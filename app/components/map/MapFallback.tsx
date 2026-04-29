import { MdMap, MdLocationOn } from 'react-icons/md'
import { phaseById } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

interface MapFallbackProps {
  className?: string
}

export const MapFallback = ({ className = '' }: MapFallbackProps) => {
  const currentPhase = useAppStore((s) => s.currentPhase)
  const location = useAppStore((s) => s.currentLocation)
  const phase = phaseById(currentPhase)

  return (
    <div
      className={`relative ${className} flex items-center justify-center rounded-cockpit border-2 border-dashed border-base-300 bg-base-200`}
    >
      <div className="max-w-md p-6 text-center">
        <MdMap className="mx-auto h-12 w-12 text-base-content/30" aria-hidden />
        <h3 className="mt-2 text-base font-semibold">Map unavailable</h3>
        <p className="mt-1 text-sm text-base-content/70">
          The interactive map requires a modern browser with JS enabled.
        </p>
        {phase && (
          <div className="mt-4 rounded-cockpit bg-base-100 p-3 text-left text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              Current phase
            </div>
            <div className="font-semibold">{phase.title}</div>
            <p className="mt-1 text-xs text-base-content/60">{phase.summary}</p>
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
          <MdLocationOn className="h-4 w-4 text-primary" />
          {location ? (
            <span>
              ±{Math.round(location.accuracy)}m at{' '}
              <span className="font-cockpit tabular-nums">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </span>
          ) : (
            <span className="text-base-content/60">Location not available.</span>
          )}
        </div>
      </div>
    </div>
  )
}
