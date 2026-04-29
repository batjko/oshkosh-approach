import { useMemo } from 'react'
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
import { getCriticalNotams } from '~/utils/notamFilters'

interface NotamItem {
  id: string
  number: string
  type: string
  effectiveEnd: string
  text: string
}

interface FiskApproachAppProps {
  notamList: NotamItem[]
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
