import { MdRoute, MdLocalAirport, MdLaunch } from 'react-icons/md'
import { alternates, divertTriggers } from '~/content/oshkosh'
import { Sheet } from '../sheet/Sheet'

export const DivertSheet = () => (
  <Sheet
    id="divert"
    title="Divert"
    description="Pre-briefed triggers and alternates. Tap a trigger to confirm the action."
  >
    <div className="space-y-5">
      <section aria-label="Decision triggers" className="space-y-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          <MdRoute className="h-4 w-4" /> Decision triggers
        </h3>
        <ul className="space-y-2">
          {divertTriggers.map((t) => (
            <li
              key={t.id}
              className={`rounded-cockpit border p-3 ${
                t.severity === 'critical'
                  ? 'border-error/40 bg-error/10'
                  : 'border-warning/40 bg-warning/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{t.trigger}</p>
                  <p className="mt-1 text-sm text-base-content/80">{t.action}</p>
                </div>
                <span
                  className={
                    t.severity === 'critical' ? 'pill-danger' : 'pill-warn'
                  }
                >
                  {t.severity}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Alternates" className="space-y-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          <MdLocalAirport className="h-4 w-4" /> Alternates
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {alternates.map((alt) => (
            <li key={alt.id}>
              <a
                href={alt.referenceUrl}
                target="_blank"
                rel="noreferrer"
                className="tap-target flex items-center justify-between gap-2 rounded-cockpit border border-base-300 bg-base-100 p-3 transition hover:bg-base-200"
              >
                <div>
                  <div className="font-cockpit text-base font-semibold tabular-nums">
                    {alt.icao}
                  </div>
                  <div className="text-xs text-base-content/70">{alt.name}</div>
                </div>
                <MdLaunch className="h-4 w-4 text-base-content/50" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  </Sheet>
)
