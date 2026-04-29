import { lazy, Suspense } from 'react'
import { MapFallback } from '~/components/map/MapFallback'
import { useAppStore } from '~/store/useAppStore'

const ApproachMap = lazy(() =>
  import('~/components/map/ApproachMap').then((m) => ({ default: m.ApproachMap }))
)

interface MapSectionProps {
  heightClass?: string
}

export const MapSection = ({ heightClass = 'h-[60vh] min-h-[20rem]' }: MapSectionProps) => {
  const enableMap = useAppStore((s) => s.enableMap)
  return (
    <div className={`overflow-hidden rounded-cockpit border border-base-300 bg-base-100 ${heightClass}`}>
      {enableMap ? (
        <Suspense fallback={<MapFallback className="h-full w-full" />}>
          <ApproachMap className="h-full w-full" />
        </Suspense>
      ) : (
        <MapFallback className="h-full w-full" />
      )}
    </div>
  )
}
