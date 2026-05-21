import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CACHE_DIR =
  process.env.NOTAM_TRANSLATION_CACHE_DIR ??
  path.join(process.cwd(), '.cache', 'notam-translations')
const DEFAULT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const DEFAULT_MAX_FILES = 1_000

export interface NotamTranslationCacheIdentity {
  id: string
  number: string
  type: string
  icaoLocation?: string
  effectiveStart?: string
  effectiveEnd?: string
  text: string
  modelId: string
  promptSchemaVersion: string
}

export interface NotamTranslationCacheRecord<T> {
  key: string
  sourceHash: string
  createdAt: string
  modelId: string
  promptSchemaVersion: string
  value: T
}

const normalize = (value: string | undefined): string =>
  (value ?? '').replace(/\s+/g, ' ').trim()

const hashJson = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

export const buildNotamTranslationCacheKey = (
  identity: NotamTranslationCacheIdentity
) => {
  const id = normalize(identity.id)
  const stableIdentity = {
    id,
    number: normalize(identity.number),
    type: normalize(identity.type),
    icaoLocation: normalize(identity.icaoLocation),
    effectiveStart: normalize(identity.effectiveStart),
    effectiveEnd: normalize(identity.effectiveEnd),
    text: normalize(identity.text),
    modelId: normalize(identity.modelId),
    promptSchemaVersion: identity.promptSchemaVersion
  }

  return {
    key: hashJson({ id }),
    sourceHash: hashJson({
      id: stableIdentity.id,
      number: stableIdentity.number,
      type: stableIdentity.type,
      icaoLocation: stableIdentity.icaoLocation,
      effectiveStart: stableIdentity.effectiveStart,
      effectiveEnd: stableIdentity.effectiveEnd,
      text: stableIdentity.text
    })
  }
}

const cachePath = (key: string): string => path.join(CACHE_DIR, `${key}.json`)

const readMaxAgeMs = (): number => {
  const raw = Number(process.env.NOTAM_TRANSLATION_CACHE_MAX_AGE_MS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_AGE_MS
}

const readMaxFiles = (): number => {
  const raw = Number(process.env.NOTAM_TRANSLATION_CACHE_MAX_FILES)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_FILES
}

const isCacheRecord = <T>(
  value: unknown
): value is NotamTranslationCacheRecord<T> => {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<NotamTranslationCacheRecord<T>>
  return (
    typeof record.key === 'string' &&
    typeof record.sourceHash === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.modelId === 'string' &&
    typeof record.promptSchemaVersion === 'string' &&
    record.value !== undefined
  )
}

export const readNotamTranslationCache = async <T>(
  key: string
): Promise<T | null> => {
  try {
    const raw = await readFile(cachePath(key), 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!isCacheRecord<T>(parsed)) return null

    const createdMs = Date.parse(parsed.createdAt)
    if (
      Number.isNaN(createdMs) ||
      Date.now() - createdMs > readMaxAgeMs()
    ) {
      await unlink(cachePath(key)).catch(() => undefined)
      return null
    }

    return parsed.value
  } catch {
    return null
  }
}

export const writeNotamTranslationCache = async <T>(
  record: NotamTranslationCacheRecord<T>
): Promise<void> => {
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(cachePath(record.key), JSON.stringify(record), 'utf8')
  await pruneCache().catch(() => undefined)
}

const pruneCache = async (): Promise<void> => {
  const entries = await readdir(CACHE_DIR)
  const jsonEntries = entries.filter((entry) => entry.endsWith('.json'))
  const maxFiles = readMaxFiles()
  if (jsonEntries.length <= maxFiles) return

  const withStats = await Promise.all(
    jsonEntries.map(async (entry) => ({
      entry,
      mtimeMs: (await stat(path.join(CACHE_DIR, entry))).mtimeMs
    }))
  )

  const staleEntries = withStats
    .sort((a, b) => a.mtimeMs - b.mtimeMs)
    .slice(0, Math.max(0, withStats.length - maxFiles))

  await Promise.all(
    staleEntries.map(({ entry }) =>
      unlink(path.join(CACHE_DIR, entry)).catch(() => undefined)
    )
  )
}
