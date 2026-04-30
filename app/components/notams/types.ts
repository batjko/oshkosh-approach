import type { NotamType } from '~/utils/notamTypes'

export interface Notam {
  id: string
  number: string
  type: NotamType
  effectiveStart?: string
  effectiveEnd: string
  text: string
  icaoLocation?: string
  translationToken?: string
}
