/**
 * Raw shape returned by FAA NOTAM Search XHR
 * (https://notams.aim.faa.gov/notamSearch/search).
 *
 * Only the fields we consume are typed; everything else is left as
 * `unknown` so we never depend on undocumented internals.
 */
export interface RawFaaNotam {
  notamNumber: string
  facilityDesignator: string
  icaoId: string
  /** Free-form keyword (e.g. `IAP`, `RWY`, `OBST`, `AD`, `NAV`). */
  keyword?: string
  /** `MM/DD/YYYY HHmm` (Zulu) or other formats; we parse defensively. */
  issueDate?: string
  startDate?: string
  /** `MM/DD/YYYY HHmm` or the literal `'PERM'`. */
  endDate?: string
  /** Preferred user-facing prose. */
  plainLanguageMessage?: string
  /** Raw `!FDC` / `!OSH` style message. */
  traditionalMessage?: string
  status?: 'Active' | 'Cancelled' | string
  cancelledOrExpired?: boolean
  airportName?: string
}

export interface RawFaaNotamSearchResponse {
  notamList?: RawFaaNotam[]
}
