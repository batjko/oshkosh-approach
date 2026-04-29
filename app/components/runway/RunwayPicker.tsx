import { runways } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

export const RunwayPicker = () => {
  const assigned = useAppStore((s) => s.assignedRunwayId)
  const setAssigned = useAppStore((s) => s.setAssignedRunwayId)
  return (
    <div className="briefing-card-quiet">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
        ATC runway assignment
      </h3>
      <p className="mt-1 text-sm text-base-content/70">
        Tap the runway ATC issued at Fisk to load its brief.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {runways.map((r) => {
          const active = assigned === r.id
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setAssigned(active ? null : r.id)}
              className={`tap-target rounded-cockpit border px-3 py-2.5 text-left transition ${
                active
                  ? 'border-primary bg-primary text-primary-content shadow-cockpit'
                  : 'border-base-300 bg-base-100 hover:bg-base-200'
              }`}
              aria-pressed={active}
            >
              <div className="font-cockpit text-numeral-sm tabular-nums">
                {r.label.replace('Runway ', '')}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                Tower {r.towerFreq}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
