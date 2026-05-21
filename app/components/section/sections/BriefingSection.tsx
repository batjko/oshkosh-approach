import { MdInfoOutline, MdWarningAmber } from 'react-icons/md'
import {
  departureRunways,
  departureSafetyNotes,
  holds,
  holdAltitudeFtMsl,
  holdGeneralGuidance,
  holdHighAltitudeFtMsl,
  holdHighSpeedKt,
  holdSaturationGuidance,
  holdSpeedKt,
  type PhaseDefinition
} from '~/content/oshkosh'
import { Checklist } from '~/components/checklist/Checklist'
import { SourceBadge } from '~/components/sources/SourceBadge'

interface BriefingSectionProps {
  phase: PhaseDefinition
  /** Whether to inline the holds sub-block (transition / ripon-to-fisk). */
  showHolds?: boolean
}

const HoldsSubBlock = () => (
  <section
    aria-label="Holds"
    className="rounded-cockpit border border-base-300 bg-base-100 p-3"
  >
    <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
      Holds
    </h3>
    <p className="mt-1 text-xs text-base-content/70">
      ATC may instruct a hold over a published landmark when the arrival
      saturates. Hold at {holdSpeedKt} kt, or maximum cruise if below {holdSpeedKt} kt,
      and {holdAltitudeFtMsl.toLocaleString()} ft MSL. If unable, use {holdHighSpeedKt} kt at{' '}
      {holdHighAltitudeFtMsl.toLocaleString()} ft MSL.
    </p>
    <p className="mt-2 text-xs text-base-content/70">{holdGeneralGuidance}</p>
    <p className="mt-1 text-xs text-base-content/70">{holdSaturationGuidance}</p>
    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
      {holds.map((h) => (
        <li
          key={h.id}
          className="rounded-cockpit bg-base-200 p-2.5 text-xs"
        >
          <div className="font-semibold text-base-content">{h.name}</div>
          <div className="mt-0.5 text-base-content/70">{h.pattern}</div>
          <div className="mt-1 text-[11px] text-base-content/60">
            <strong className="text-base-content/80">When:</strong> {h.whenUsed}
          </div>
          <div className="mt-0.5 text-[11px] text-base-content/60">
            <strong className="text-base-content/80">Exit:</strong> {h.exit}
          </div>
        </li>
      ))}
    </ul>
  </section>
)

const DepartureSubBlock = () => (
  <section
    aria-label="Departure runways"
    className="rounded-cockpit border border-base-300 bg-base-100 p-3"
  >
    <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
      Departure Runways
    </h3>
    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
      {departureRunways.map((r) => (
        <li
          key={r.id}
          className="rounded-cockpit bg-base-200 p-2.5 text-xs"
        >
          <div className="font-semibold text-base-content">{r.label}</div>
          <div className="mt-0.5 text-base-content/70">
            {r.remainingFt.toLocaleString()} ft remaining
          </div>
          <div className="mt-1 font-cockpit text-[11px] text-base-content/70">
            Monitor {r.monitorFreq}
          </div>
          {r.notes?.map((note) => (
            <div key={note} className="mt-1 text-[11px] text-base-content/60">
              {note}
            </div>
          ))}
        </li>
      ))}
    </ul>
    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-base-content/70">
      {departureSafetyNotes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  </section>
)

const WarningsBlock = ({ warnings }: { warnings: string[] }) => (
  <section
    aria-label="Warnings"
    className="rounded-cockpit border-l-4 border-warning bg-warning/10 p-3"
  >
    <h3 className="flex items-center gap-2 text-sm font-semibold text-warning">
      <MdWarningAmber className="h-4 w-4" /> Watch out
    </h3>
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
      {warnings.map((w) => (
        <li key={w}>{w}</li>
      ))}
    </ul>
  </section>
)

export const BriefingSection = ({ phase, showHolds }: BriefingSectionProps) => (
  <div className="grid gap-4 xl:grid-cols-3 xl:items-start">
    <div className="min-w-0 space-y-4 xl:col-span-2">
      <p className="text-base text-base-content">{phase.summary}</p>

      <section className="rounded-cockpit bg-base-200 p-3">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          <MdInfoOutline className="h-4 w-4 text-primary" /> Briefing
        </h3>
        <p className="mt-2 text-sm leading-relaxed">{phase.briefing}</p>
      </section>

      {phase.warnings && phase.warnings.length > 0 && (
        <div className="xl:hidden">
          <WarningsBlock warnings={phase.warnings} />
        </div>
      )}

      <section aria-label="Primary actions" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Do this
        </h3>
        <Checklist items={phase.primaryActions} variant="default" />
      </section>

      {phase.secondaryActions && phase.secondaryActions.length > 0 && (
        <section aria-label="Secondary actions" className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
            If time permits
          </h3>
          <Checklist items={phase.secondaryActions} />
        </section>
      )}

      {showHolds && <HoldsSubBlock />}
      {phase.id === 'depart' && <DepartureSubBlock />}
    </div>

    <aside className="space-y-4 xl:sticky xl:top-36">
      {phase.warnings && phase.warnings.length > 0 && (
        <div className="hidden xl:block">
          <WarningsBlock warnings={phase.warnings} />
        </div>
      )}

      <SourceBadge ids={phase.sources} />
    </aside>
  </div>
)
