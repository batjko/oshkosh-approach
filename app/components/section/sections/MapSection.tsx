import { useEffect, useState, type ComponentType } from 'react'
import { MapFallback } from '~/components/map/MapFallback'
import { useAppStore } from '~/store/useAppStore'

interface MapSectionProps {
  heightClass?: string
}

interface ApproachMapProps {
  className?: string
}

export const MapSection = ({
  heightClass = 'h-[clamp(20rem,58dvh,42rem)]'
}: MapSectionProps) => {
  const enableMap = useAppStore((s) => s.enableMap)
  const [mounted, setMounted] = useState(false)
  const [ApproachMap, setApproachMap] =
    useState<ComponentType<ApproachMapProps> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !enableMap || ApproachMap) return
    let cancelled = false
    import('~/components/map/ApproachMap').then((m) => {
      if (!cancelled) setApproachMap(() => m.ApproachMap)
    })
    return () => {
      cancelled = true
    }
  }, [ApproachMap, enableMap, mounted])

  return (
    <div className={`overflow-hidden rounded-cockpit border border-base-300 bg-base-100 ${heightClass}`}>
      {enableMap && mounted && ApproachMap ? (
        <ApproachMap className="h-full w-full" />
      ) : (
        <MapFallback className="h-full w-full" />
      )}
    </div>
  )
}
