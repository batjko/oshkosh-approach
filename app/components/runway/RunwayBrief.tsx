import { runwayById, type RunwayDefinition } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'
import { MdFlightLand, MdRule, MdWarningAmber } from 'react-icons/md'

/**
 * Horizontal landing-distance bar. Coloured aim points are placed at
 * their `feetRemaining` proportion of the threshold-to-end distance so
 * pilots can see at a glance how far down the runway each dot is.
 */
const LandingDistanceBar = ({ runway }: { runway: RunwayDefinition }) => {
  const total = runway.thresholdFtRemaining
  if (!total || runway.aimPoints.length === 0) return null
  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-base-content/60">
        <span>Threshold</span>
        <span className="font-cockpit tabular-nums">
          {total.toLocaleString()} ft
        </span>
        <span>End</span>
      </div>
      <div
        role="img"
        aria-label="Runway aim points by remaining distance"
        className="relative h-7 w-full overflow-hidden rounded-full bg-gradient-to-r from-success/20 via-warning/15 to-error/20"
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-base-content/30" />
        <div className="absolute inset-y-0 right-0 w-1 bg-base-content/30" />
        {runway.aimPoints.map((dot) => {
          const ratio = Math.min(1, Math.max(0, 1 - dot.feetRemaining / total))
          return (
            <span
              key={dot.id}
              title={`${dot.label}: ${dot.feetRemaining.toLocaleString()} ft remaining`}
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-base-100 shadow"
              style={{
                left: `${ratio * 100}%`,
                backgroundColor: dot.colorHex
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export const RunwayBrief = () => {
  const assignedId = useAppStore((s) => s.assignedRunwayId)
  if (!assignedId) {
    return (
      <div className="briefing-card-quiet">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-base-content/70">
          <MdFlightLand className="h-4 w-4 text-primary" /> Runway brief
        </h3>
        <p className="mt-2 text-sm text-base-content/60">
          No runway assigned yet. ATC will issue your runway at Fisk - then tap
          it above to load the brief.
        </p>
      </div>
    )
  }
  const runway = runwayById(assignedId)
  if (!runway) return null

  return (
    <article className="briefing-card border-l-4 border-primary">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <MdFlightLand className="h-5 w-5 text-primary" />
            {runway.label} brief
          </h3>
          <p className="text-xs text-base-content/60">
            Monitor tower <span className="font-cockpit font-semibold">{runway.towerFreq}</span>
            {runway.widthFt ? ` - width ${runway.widthFt} ft` : ''}
            {runway.shortApproach ? ' - short approach likely' : ''}
            {runway.longLanding ? ' - long landing' : ''}
          </p>
        </div>
      </header>

      <LandingDistanceBar runway={runway} />

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {runway.thresholdFtRemaining !== undefined && (
          <div className="rounded-cockpit bg-base-200 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-base-content/60">
              Threshold
            </div>
            <div className="font-cockpit text-numeral-sm tabular-nums text-base-content">
              {runway.thresholdFtRemaining.toLocaleString()} ft
            </div>
          </div>
        )}
        {runway.displacedThresholdFtRemaining !== undefined && (
          <div className="rounded-cockpit bg-base-200 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wide text-base-content/60">
              Displaced threshold
            </div>
            <div className="font-cockpit text-numeral-sm tabular-nums text-base-content">
              {runway.displacedThresholdFtRemaining.toLocaleString()} ft
            </div>
          </div>
        )}
        {runway.aimPoints.map((dot) => (
          <div
            key={dot.id}
            className="flex items-center gap-2 rounded-cockpit bg-base-200 px-3 py-2"
          >
            <span
              aria-hidden
              className={`inline-block h-5 w-5 ${
                dot.shape === 'square' ? 'rounded-sm' : 'rounded-full'
              } border border-base-content/20`}
              style={{ backgroundColor: dot.colorHex }}
            />
            <div>
              <div className="text-[10px] uppercase tracking-wide text-base-content/60">
                {dot.label}
              </div>
              <div className="font-cockpit text-numeral-sm tabular-nums text-base-content">
                {dot.feetRemaining.toLocaleString()} ft
              </div>
            </div>
          </div>
        ))}
      </div>

      {runway.rules.length > 0 && (
        <section className="mt-4 rounded-cockpit border-l-4 border-warning bg-warning/10 p-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-warning">
            <MdRule className="h-4 w-4" /> Rules
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {runway.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-3 flex items-center gap-2 text-xs text-base-content/60">
        <MdWarningAmber className="h-4 w-4 text-warning" />
        Notify ATC immediately if you go around. Eyes outside - departures are
        on a separate frequency.
      </p>
    </article>
  )
}
