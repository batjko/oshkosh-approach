import { transitions } from '~/content/oshkosh'

export const TransitionPicker = () => (
  <section aria-label="Active transition" className="briefing-card-quiet">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
      Transition starting points
    </h3>
    <p className="mt-1 text-sm text-base-content/70">
      ATC announces the active transition on Arrival ATIS 125.9. Real-time
      changes may be issued on Fisk Approach 120.7.
    </p>
    <ul className="mt-3 space-y-2 text-sm">
      {transitions.map((t) => (
        <li key={t.id} className="rounded-cockpit border border-base-300 bg-base-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{t.name}</span>
            {t.highVolumeOnly && <span className="pill-warn">high traffic only</span>}
          </div>
          <p className="mt-1 text-xs text-base-content/60">{t.description}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-base-content/80">
            {t.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  </section>
)
