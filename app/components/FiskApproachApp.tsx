import { useEffect, useMemo } from 'react'
import { AppShell } from './shell/AppShell'
import { CriticalNotamBanner } from './shell/CriticalNotamBanner'
import { PhaseSections } from './section/PhaseSections'
import { MapSection } from './section/sections/MapSection'
import { DivertFab } from './divert/DivertFab'
import { NoticeSheet } from './sheets/NoticeSheet'
import { ProfileSheet } from './sheets/ProfileSheet'
import { SignsSheet } from './sheets/SignsSheet'
import { AlternatesSheet } from './sheets/AlternatesSheet'
import { DivertSheet } from './sheets/DivertSheet'
import { useAppStore } from '~/store/useAppStore'
import {
  countNotamsByPriority,
  getCriticalNotams
} from '~/utils/notamFilters'
import { trackAppEvent } from '~/utils/analytics'
import type { Notam } from './notams/types'

interface FiskApproachAppProps {
  notamList: Notam[]
  fetchedAt: string
  source: string
  fetchError?: string
}

const FlightInlineMap = () => (
  <div className="mt-4">
    <MapSection heightClass="h-[40vh] min-h-[18rem]" />
  </div>
)

/**
 * Top-level orchestrator. Composes the AppShell (AppBar, StatusBar,
 * PhaseSpine, PhaseHero, sheets) with the phase-aware section panels
 * and the in-flight inline map.
 */
export const FiskApproachApp = ({
  notamList,
  fetchedAt,
  source,
  fetchError
}: FiskApproachAppProps) => {
  const mode = useAppStore((s) => s.mode)
  const list = useMemo(() => notamList ?? [], [notamList])

  const critical = useMemo(
    () =>
      getCriticalNotams(list).map((n) => ({
        id: n.id,
        number: n.number,
        text: n.text
      })),
    [list]
  )

  useEffect(() => {
    const counts = countNotamsByPriority(list)
    trackAppEvent('notams loaded', {
      status: fetchError ? 'error' : 'success',
      total: list.length,
      critical: counts.critical,
      high: counts.high,
      medium: counts.medium,
      low: counts.low
    })
    // Fire once per loader response (each fetch produces a new
    // `fetchedAt`); list identity changes too but is captured via the
    // counts above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedAt])

  return (
    <>
      <AppShell topBanner={<CriticalNotamBanner criticalNotams={critical} />}>
        {mode === 'in-flight' && <FlightInlineMap />}
        <PhaseSections
          notamList={list}
          fetchedAt={fetchedAt}
          source={source}
          fetchError={fetchError}
        />
      </AppShell>
      <DivertFab />
      <NoticeSheet />
      <ProfileSheet />
      <SignsSheet />
      <AlternatesSheet />
      <DivertSheet />
    </>
  )
}

export default FiskApproachApp
