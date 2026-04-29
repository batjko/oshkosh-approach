/**
 * NOTAM filtering and priority categorisation for the Fisk arrival.
 *
 * Priority levels reflect operational impact for a VFR pilot inbound to
 * KOSH during AirVenture week — NOT raw "is the word 'runway' present".
 *
 * - critical: arrival is blocked or substantially altered (closure, TFR,
 *   IFR-only, NORDO disable). Demands action before launch / divert.
 * - high:    affects the actual procedure or comms we use (FISK arrival,
 *   RIPON, OSH tower / Fisk Approach freq changes, runway-specific
 *   advisory during event window).
 * - medium:  IAP/IFR procedural changes, ILS/VOR availability, alternate
 *   field changes — context the pilot may want to know.
 * - low:     distant obstacles, taxiway lighting, fuel availability,
 *   routine equipment.
 */

export interface NotamPriority {
  level: 'critical' | 'high' | 'medium' | 'low'
  color: string
  icon: string
}

const CRITICAL = { level: 'critical', color: 'error', icon: 'warning' } as const
const HIGH = { level: 'high', color: 'warning', icon: 'info' } as const
const MEDIUM = { level: 'medium', color: 'info', icon: 'info-circle' } as const
const LOW = { level: 'low', color: 'base-content', icon: 'circle' } as const

/**
 * Closure / blocking conditions — the only signals that should ever
 * reach the critical banner. Word-boundary anchored to avoid matching
 * substrings like "closed-circuit" inside narrative text.
 */
const CRITICAL_PATTERNS = [
  /\bAIRPORT\s+CLOSED\b/i,
  /\bARPT\s+(CLOSED|CLSD|CLD)\b/i,
  /\bAERODROME\s+(CLOSED|CLSD)\b/i,
  /\bAD\s+(CLOSED|CLSD)\b/i,
  /\bRWY\s+\d+[LRC]?(?:\s*\/\s*\d+[LRC]?)?\s+(CLOSED|CLSD)\b/i,
  /\bRUNWAY\s+\d+[LRC]?(?:\s*\/\s*\d+[LRC]?)?\s+CLOSED\b/i,
  /\bFLIGHT\s+RESTRICTION\b/i,
  /\bTFR\b/i,
  /\bIFR\s+ONLY\b/i,
  /\bVFR\s+(?:ARRIVALS?\s+)?(?:NOT\s+PERMITTED|PROHIBITED|SUSPENDED)\b/i,
  /\bAIRSPACE\s+CLOSED\b/i,
  /\bEMERGENCY\b/i
]

/**
 * Operationally relevant to the FISK VFR arrival. We match phrases
 * specific to the arrival, the comms strip, or runways used during
 * event week.
 */
const HIGH_PATTERNS = [
  /\bFISK\b/i,
  /\bRIPON\b/i,
  /\bAIRVENTURE\b/i,
  /\bMASS\s+ARRIVAL\b/i,
  /\bATIS\s+\d{3}\.\d{1,3}\b/i,
  /\bTOWER\s+\d{3}\.\d{1,3}\b/i,
  /\b(?:OSH|KOSH)\s+TOWER\b/i,
  /\bAPPROACH\s+\d{3}\.\d{1,3}\b/i,
  /\bGROUND\s+\d{3}\.\d{1,3}\b/i,
  /\bTRANSPONDER\b/i,
  /\bNORDO\b/i,
  /\bWAIVER\b/i
]

/**
 * IFR procedure or navaid changes, runway / ILS status. Useful context
 * but not emergency.
 */
const MEDIUM_PATTERNS = [
  /\bIAP\b/i,
  /\bILS\b/i,
  /\bLOC\s+(BC\s+)?RWY\b/i,
  /\bVOR\s+RWY\b/i,
  /\bGPS\s+RWY\b/i,
  /\bRNAV\b/i,
  /\bMINIMUMS\b/i,
  /\bMDA\b/i,
  /\bNAVAID\b/i,
  /\bDME\b/i,
  /\bSID\b/i,
  /\bSTAR\b/i
]

const matchAny = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((p) => p.test(text))

export const categorizeNotamPriority = (notamText: string): NotamPriority => {
  if (!notamText) return LOW
  if (matchAny(notamText, CRITICAL_PATTERNS)) return CRITICAL
  if (matchAny(notamText, HIGH_PATTERNS)) return HIGH
  if (matchAny(notamText, MEDIUM_PATTERNS)) return MEDIUM
  return LOW
}

interface NotamLike {
  text: string
  number: string
  type: string
}

export const filterNotamsByType = <T extends NotamLike>(
  notams: T[],
  type: string
): T[] => {
  if (type === 'All') return notams
  return notams.filter((notam) => notam.type === type)
}

export const filterNotamsBySearch = <T extends NotamLike>(
  notams: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm) return notams
  const lower = searchTerm.toLowerCase()
  return notams.filter(
    (notam) =>
      notam.text.toLowerCase().includes(lower) ||
      notam.number.toLowerCase().includes(lower) ||
      notam.type.toLowerCase().includes(lower)
  )
}

const priorityOrder: Record<NotamPriority['level'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
}

/**
 * Items that genuinely block or substantially alter the arrival. Used
 * by `CriticalNotamBanner` — should be near-empty most of the time.
 */
export const getCriticalNotams = <T extends NotamLike>(notams: T[]) =>
  notams
    .map((notam) => ({
      ...notam,
      priority: categorizeNotamPriority(notam.text)
    }))
    .filter((notam) => notam.priority.level === 'critical')
    .sort(
      (a, b) =>
        priorityOrder[a.priority.level] - priorityOrder[b.priority.level]
    )

/**
 * Critical + high. Used for the count badge on the NOTAMs tab — items
 * the pilot should not skip past.
 */
export const getImportantNotams = <T extends NotamLike>(notams: T[]) =>
  notams
    .map((notam) => ({
      ...notam,
      priority: categorizeNotamPriority(notam.text)
    }))
    .filter(
      (notam) =>
        notam.priority.level === 'critical' || notam.priority.level === 'high'
    )
    .sort(
      (a, b) =>
        priorityOrder[a.priority.level] - priorityOrder[b.priority.level]
    )

export const sortNotamsByPriority = <T extends NotamLike>(notams: T[]) =>
  notams
    .map((notam) => ({
      ...notam,
      priority: categorizeNotamPriority(notam.text)
    }))
    .sort(
      (a, b) =>
        priorityOrder[a.priority.level] - priorityOrder[b.priority.level]
    )
