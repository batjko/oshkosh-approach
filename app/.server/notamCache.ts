import { createHash } from 'node:crypto'

import type { NotamTranslationValue } from './notamTranslation'

interface CacheableNotam {
  id: string
  number: string
  type: string
  effectiveStart?: string
  effectiveEnd?: string
  text: string
  icaoLocation?: string
  translationToken?: string
  cachedTranslation?: NotamTranslationValue
}

interface ActiveNotamCacheRecord<TNotam extends CacheableNotam> {
  key: string
  sourceHash: string
  firstSeenAt: string
  lastSeenAt: string
  notam: TNotam
}

interface ActiveNotamCacheReconcileResult<TNotam extends CacheableNotam> {
  notams: TNotam[]
  activeCount: number
  prunedCount: number
}

const activeNotamCache = new Map<string, ActiveNotamCacheRecord<CacheableNotam>>()

const normalize = (value: string | undefined): string =>
  (value ?? '').replace(/\s+/g, ' ').trim()

const hashJson = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

export const buildActiveNotamCacheKey = (
  notam: Pick<CacheableNotam, 'id'> | string
): string => normalize(typeof notam === 'string' ? notam : notam.id)

const sourceHashFor = (notam: CacheableNotam): string =>
  hashJson({
    id: normalize(notam.id),
    number: normalize(notam.number),
    type: normalize(notam.type),
    effectiveStart: normalize(notam.effectiveStart),
    effectiveEnd: normalize(notam.effectiveEnd),
    text: normalize(notam.text),
    icaoLocation: normalize(notam.icaoLocation)
  })

export const reconcileActiveNotamCache = <TNotam extends CacheableNotam>(
  activeNotams: TNotam[],
  now: Date = new Date()
): ActiveNotamCacheReconcileResult<TNotam> => {
  const seenKeys = new Set<string>()
  const seenAt = now.toISOString()
  const notams = activeNotams
    .map((notam) => {
      const key = buildActiveNotamCacheKey(notam)
      if (!key) return null

      seenKeys.add(key)
      const existing = activeNotamCache.get(key)
      const cachedTranslation =
        notam.cachedTranslation ?? existing?.notam.cachedTranslation
      const cachedNotam = {
        ...notam,
        ...(cachedTranslation ? { cachedTranslation } : {})
      } as TNotam

      activeNotamCache.set(key, {
        key,
        sourceHash: sourceHashFor(cachedNotam),
        firstSeenAt: existing?.firstSeenAt ?? seenAt,
        lastSeenAt: seenAt,
        notam: cachedNotam
      })

      return cachedNotam
    })
    .filter((notam): notam is TNotam => Boolean(notam))

  let prunedCount = 0
  for (const key of activeNotamCache.keys()) {
    if (!seenKeys.has(key)) {
      activeNotamCache.delete(key)
      prunedCount += 1
    }
  }

  return {
    notams,
    activeCount: activeNotamCache.size,
    prunedCount
  }
}

export const getActiveNotamTranslation = (
  notam: Pick<CacheableNotam, 'id'> | string
): NotamTranslationValue | null =>
  activeNotamCache.get(buildActiveNotamCacheKey(notam))?.notam
    .cachedTranslation ?? null

export const storeActiveNotamTranslation = <TNotam extends CacheableNotam>(
  notam: TNotam,
  translation: NotamTranslationValue
): TNotam => {
  const key = buildActiveNotamCacheKey(notam)
  const now = new Date().toISOString()
  const existing = key ? activeNotamCache.get(key) : undefined
  const cachedNotam = {
    ...(existing?.notam ?? notam),
    cachedTranslation: translation
  } as TNotam

  if (key) {
    activeNotamCache.set(key, {
      key,
      sourceHash: sourceHashFor(cachedNotam),
      firstSeenAt: existing?.firstSeenAt ?? now,
      lastSeenAt: now,
      notam: cachedNotam
    })
  }

  return cachedNotam
}

