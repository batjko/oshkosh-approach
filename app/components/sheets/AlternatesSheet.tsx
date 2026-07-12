import { MdLocalAirport, MdPhone, MdLaunch } from 'react-icons/md'
import { alternates } from '~/content/oshkosh'
import { Sheet } from '../sheet/Sheet'

export const AlternatesSheet = () => (
  <Sheet
    id="alternates"
    title="Alternate airports"
    description="Pre-brief these. Plan fuel for holding, go-arounds, and an alternate; update VFR flight-plan destination if diverting."
  >
    <ul className="space-y-3">
      {alternates.map((alt) => (
        <li
          key={alt.id}
          className="rounded-cockpit border border-base-300 bg-base-100 p-3"
        >
          <header className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MdLocalAirport className="h-5 w-5 text-primary" />
              <div>
                <div className="font-cockpit text-base font-semibold tabular-nums">
                  {alt.icao}
                </div>
                <div className="text-xs text-base-content/70">{alt.name}</div>
              </div>
            </div>
            <a
              href={alt.referenceUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-xs gap-1"
            >
              <MdLaunch className="h-3 w-3" /> FAA airport info
            </a>
          </header>
          <p className="mt-2 text-sm text-base-content/80">{alt.description}</p>
          {alt.notes && alt.notes.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-base-content/70">
              {alt.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          {alt.contactPhone && (
            <div className="mt-2 text-xs">
              <div className="text-base-content/60">{alt.contactPurpose}</div>
              <a
                href={`tel:${alt.contactPhone.replace(/[^0-9+]/g, '')}`}
                className="mt-0.5 inline-flex items-center gap-1 text-primary"
              >
                <MdPhone className="h-3 w-3" />
                {alt.contactPhone}
              </a>
            </div>
          )}
        </li>
      ))}
    </ul>
  </Sheet>
)
