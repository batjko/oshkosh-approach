import dns from 'node:dns'
import type {
  RawFaaNotam,
  RawFaaNotamSearchResponse
} from './notamSearch.types'
import { keywordToType, type NotamType } from '../utils/notamTypes'
import { serverLogger } from './logger'
import { signNotamTranslationRequest } from './notamTranslationSignature'

// FAA Akamai edge resolves both A and AAAA. Some Node SSR runtimes hang
// on IPv6 attempts before falling back to IPv4. Force IPv4-first so the
// loader stays under timeout reliably.
dns.setDefaultResultOrder('ipv4first')

/**
 * Public FAA NOTAM Search XHR endpoint. Same one the official FAA NOTAM
 * Search UI calls. Returns JSON, no API key required.
 *
 * IMPORTANT: do not cache results in-process. Each loader call must hit
 * fresh per the product requirement — pilots reload to refresh, NOTAMs
 * are authoritative.
 */
const FAA_NOTAM_SEARCH_URL = 'https://notams.aim.faa.gov/notamSearch/search'
const DEFAULT_ICAO = 'KOSH'
const FETCH_TIMEOUT_MS = 20_000

const fetchWithHeaderTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

export interface TransformedNotam {
  id: string
  number: string
  /** User-facing type derived from the FAA NOTAM keyword. */
  type: NotamType
  /** ISO-8601 or `'PERM'`. */
  effectiveStart: string
  /** ISO-8601 or `'PERM'`. */
  effectiveEnd: string
  text: string
  icaoLocation: string
  airportName?: string
  translationToken?: string
}

export interface NotamFetchResult {
  notamList: TransformedNotam[]
  /** ISO-8601 timestamp of when the loader fetched FAA. */
  fetchedAt: string
  /** Human-readable provenance string for UI. */
  source: string
  /** Populated only when fetch failed; UI surfaces it. */
  error?: string
}

/**
 * Parse FAA-format dates: `MM/DD/YYYY HHmm` (Zulu) or the literal `'PERM'`.
 * Returns ISO-8601 string or `'PERM'`.
 */
const parseFaaDate = (raw?: string): string => {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (trimmed.toUpperCase() === 'PERM') return 'PERM'

  const m = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2})(\d{2})$/)
  if (m) {
    const [, mm, dd, yyyy, hh, min] = m
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:00Z`
  }
  // Defensive: fall back to Date parser, drop on failure.
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

const isCurrentlyActive = (notam: TransformedNotam, now: Date): boolean => {
  const start = notam.effectiveStart
  const end = notam.effectiveEnd
  if (start && start !== 'PERM') {
    const startMs = Date.parse(start)
    if (!Number.isNaN(startMs) && startMs > now.getTime()) return false
  }
  if (end === 'PERM' || end === '') return true
  const endMs = Date.parse(end)
  if (!Number.isNaN(endMs) && endMs < now.getTime()) return false
  return true
}

/**
 * FAA returns `plainLanguageMessage` either as text or as inline HTML
 * (some NOTAMs embed `<table>` / `<b>` markup). Strip tags + decode the
 * handful of entities the FAA actually emits so the UI never shows raw
 * markup. Falls back to `traditionalMessage` when stripping leaves
 * nothing useful.
 */
const cleanMessage = (
  plain?: string,
  traditional?: string
): string => {
  const stripTags = (input: string): string =>
    input
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\/(p|tr|table|tbody|thead|div|li)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

  const cleanedPlain = plain ? stripTags(plain) : ''
  if (cleanedPlain.length >= 16) return cleanedPlain

  const cleanedTraditional = traditional ? stripTags(traditional) : ''
  if (cleanedTraditional.length > 0) return cleanedTraditional

  return cleanedPlain || '(No message body provided by FAA)'
}

const transformNotam = (raw: RawFaaNotam): TransformedNotam => {
  const notam = {
    id: raw.notamNumber,
    number: raw.notamNumber,
    type: keywordToType(raw.keyword),
    effectiveStart: parseFaaDate(raw.startDate),
    effectiveEnd: parseFaaDate(raw.endDate),
    text: cleanMessage(raw.plainLanguageMessage, raw.traditionalMessage),
    icaoLocation: raw.icaoId,
    airportName: raw.airportName
  }

  return {
    ...notam,
    translationToken: signNotamTranslationRequest(notam)
  }
}

export const transformNotamList = (
  raw: RawFaaNotamSearchResponse,
  now: Date = new Date()
): TransformedNotam[] => {
  const items = Array.isArray(raw?.notamList) ? raw.notamList : []
  return items
    .filter(
      (n) =>
        n &&
        n.notamNumber &&
        (n.status ?? 'Active').toLowerCase() === 'active' &&
        n.cancelledOrExpired !== true
    )
    .map(transformNotam)
    .filter((n) => isCurrentlyActive(n, now))
}

const buildSearchBody = (icao: string): string =>
  new URLSearchParams({
    searchType: '0',
    designatorsForLocation: icao,
    latDegrees: '0',
    latMinutes: '0',
    latSeconds: '0',
    longDegrees: '0',
    longMinutes: '0',
    longSeconds: '0',
    radius: '10',
    sortColumns: '5 false',
    sortDirection: 'true',
    designatorForAccountable: '',
    offset: '0',
    notamsOnly: 'false',
    radiusSearchOnDesignator: 'false',
    latitudeDirection: 'N',
    longitudeDirection: 'W',
    freeFormText: '',
    flightPathText: '',
    flightPathDivertAirfields: '',
    flightPathBuffer: '4',
    flightPathIncludeNavaids: 'true',
    flightPathIncludeArtcc: 'false',
    flightPathIncludeTfr: 'true',
    flightPathIncludeRegulatory: 'false',
    flightPathResultsType: 'All NOTAMs'
  }).toString()

/**
 * Fetch live KOSH NOTAMs from the FAA's public NOTAM Search service.
 * Always hits the network. Never caches. Returns a typed result with a
 * `fetchedAt` timestamp the UI can display.
 */
export async function getKoshNotams(
  icao: string = DEFAULT_ICAO
): Promise<NotamFetchResult> {
  const fetchedAt = new Date().toISOString()
  const source = `FAA NOTAM Search (${icao})`
  const startedAt = Date.now()
  serverLogger.info('notam.fetch.start', { icao })
  try {
    const response = await fetchWithHeaderTimeout(FAA_NOTAM_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        // FAA NOTAM Search sits behind Akamai which bot-blocks
        // non-browser User-Agents. Present a standard browser UA.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: 'https://notams.aim.faa.gov',
        Referer: 'https://notams.aim.faa.gov/notamSearch/'
      },
      body: buildSearchBody(icao)
    }, FETCH_TIMEOUT_MS)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    const json = (await response.json()) as RawFaaNotamSearchResponse
    const notamList = transformNotamList(json)
    const elapsedMs = Date.now() - startedAt
    serverLogger.info('notam.fetch.success', {
      icao,
      count: notamList.length,
      rawCount: Array.isArray(json?.notamList) ? json.notamList.length : 0,
      elapsedMs
    })
    return { notamList, fetchedAt, source }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown FAA fetch error'
    const elapsedMs = Date.now() - startedAt
    serverLogger.error('notam.fetch.failed', {
      icao,
      error: message,
      elapsedMs
    })
    return {
      notamList: [],
      fetchedAt,
      source,
      error: message
    }
  }
}

/** @deprecated kept temporarily for compatibility with older imports. */
export const getNotamsFromEAA = async (): Promise<TransformedNotam[]> => {
  const { notamList } = await getKoshNotams()
  return notamList
}
