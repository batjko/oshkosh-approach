export interface Notam {
  id: string
  number: string
  type: string
  effectiveStart?: string
  effectiveEnd: string
  text: string
  icaoLocation?: string
  translationToken?: string
}
