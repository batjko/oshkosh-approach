import {
  MdMap,
  MdMenuBook,
  MdRoute,
  MdNotificationsActive,
  MdFlightLand,
  MdAutoAwesome
} from 'react-icons/md'
import { useAppStore, type SectionId } from '~/store/useAppStore'
import { phaseById, type PhaseId } from '~/content/oshkosh'
import { getImportantNotams } from '~/utils/notamFilters'
import { SectionTabs, type SectionTabDef } from './SectionTabs'
import { SectionPanel } from './SectionPanel'
import { BriefingSection } from './sections/BriefingSection'
import { MapSection } from './sections/MapSection'
import { RunwaySection } from './sections/RunwaySection'
import { NotamSection } from './sections/NotamSection'
import { TransitionsSection } from './sections/TransitionsSection'
import type { Notam } from '../notams/types'

const PHASE_TAB_LAYOUT: Record<PhaseId, SectionId[]> = {
  preflight: ['briefing', 'map', 'transitions', 'notams'],
  enroute: ['briefing', 'map', 'transitions', 'notams'],
  transition: ['briefing', 'map', 'transitions'],
  'ripon-to-fisk': ['briefing', 'map', 'transitions'],
  'at-fisk': ['runway', 'briefing', 'map'],
  'inbound-runway': ['runway', 'briefing', 'map'],
  ground: ['runway', 'briefing', 'map'],
  depart: ['runway', 'briefing', 'map']
}

const TAB_META: Record<
  SectionId,
  { label: string; icon: JSX.Element }
> = {
  briefing: { label: 'Briefing', icon: <MdMenuBook className="h-4 w-4" /> },
  map: { label: 'Map', icon: <MdMap className="h-4 w-4" /> },
  transitions: { label: 'Transitions', icon: <MdRoute className="h-4 w-4" /> },
  notams: {
    label: 'NOTAMs',
    icon: (
      <span className="relative inline-flex">
        <MdNotificationsActive className="h-4 w-4" />
        <MdAutoAwesome
          aria-hidden="true"
          className="absolute -left-1.5 -top-1 h-2.5 w-2.5 text-warning/80"
        />
      </span>
    )
  },
  runway: { label: 'Runway', icon: <MdFlightLand className="h-4 w-4" /> }
}

interface PhaseSectionsProps {
  notamList: Notam[]
  fetchedAt: string
  source: string
  fetchError?: string
}

const PANEL_ID = 'phase-section-panel'

/**
 * Phase-aware section tabs + panels. In flight mode the Map content is
 * rendered inline beneath the hero (handled by `FiskApproachAppV2`),
 * so the `map` tab is not part of the flight-mode tab layout.
 */
export const PhaseSections = ({
  notamList,
  fetchedAt,
  source,
  fetchError
}: PhaseSectionsProps) => {
  const phaseId = useAppStore((s) => s.currentPhase)
  const mode = useAppStore((s) => s.mode)
  const phase = phaseById(phaseId)
  if (!phase) return null

  const layout = PHASE_TAB_LAYOUT[phaseId]
  const cockpit = mode === 'in-flight'
  const ids = cockpit ? layout.filter((id) => id !== 'map') : layout

  const phaseRelevantNotams = (() => {
    if (!notamList.length) return [] as Notam[]
    return getImportantNotams(notamList).map((p) => ({
      id: p.id,
      number: p.number,
      type: p.type,
      effectiveStart: p.effectiveStart,
      effectiveEnd: p.effectiveEnd,
      text: p.text,
      icaoLocation: p.icaoLocation,
      translationToken: p.translationToken,
      cachedTranslation: p.cachedTranslation
    }))
  })()

  const tabs: SectionTabDef[] = ids.map((id) => ({
    id,
    label: TAB_META[id].label,
    icon: TAB_META[id].icon,
    count:
      id === 'notams' && phaseRelevantNotams.length > 0
        ? phaseRelevantNotams.length
        : undefined
  }))

  const showHolds = phaseId === 'transition' || phaseId === 'ripon-to-fisk'

  return (
    <section aria-label="Phase sections" className="mt-4">
      <SectionTabs tabs={tabs} panelId={PANEL_ID} />

      <SectionPanel id={PANEL_ID} sectionId="briefing">
        <BriefingSection phase={phase} showHolds={showHolds} />
      </SectionPanel>

      {!cockpit && (
        <SectionPanel id={PANEL_ID} sectionId="map">
          <MapSection />
        </SectionPanel>
      )}

      <SectionPanel id={PANEL_ID} sectionId="transitions">
        <TransitionsSection />
      </SectionPanel>

      <SectionPanel id={PANEL_ID} sectionId="notams">
        <NotamSection
          notamList={notamList}
          fetchedAt={fetchedAt}
          source={source}
          fetchError={fetchError}
        />
      </SectionPanel>

      <SectionPanel id={PANEL_ID} sectionId="runway">
        <RunwaySection />
      </SectionPanel>
    </section>
  )
}
