import { useEffect, useState } from 'react'
import type * as ReactLeaflet from 'react-leaflet'
import { MdMyLocation, MdLocationOff, MdMap } from 'react-icons/md'
import { phaseById, waypoints, waypointById } from '~/content/oshkosh'
import type { LatLng, PhaseId } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

type ReactLeafletModule = typeof ReactLeaflet

interface ApproachMapProps {
  className?: string
}

type LeafletModule = typeof import('leaflet')
type LeafletModuleWithDefault = LeafletModule & { default?: LeafletModule }

const positionFor = (id: string): LatLng | null =>
  waypointById(id)?.position ?? null

const definedPositions = (positions: Array<LatLng | null>): LatLng[] =>
  positions.filter((position): position is LatLng => position !== null)

const resolveLeafletModule = (leafletModule: LeafletModule): LeafletModule => {
  const moduleWithDefault = leafletModule as LeafletModuleWithDefault
  return moduleWithDefault.default ?? leafletModule
}

const railroadRoute: LatLng[] = definedPositions([
  positionFor('vprip'),
  [43.835, -88.78],
  [43.82, -88.74],
  [43.8, -88.68],
  [43.785, -88.62],
  positionFor('vpfis')
])

const finalApproachRoute: LatLng[] = definedPositions([
  positionFor('vpfis'),
  [43.82, -88.56],
  [43.9, -88.558],
  positionFor('kosh')
])

const phaseFocusWaypointId = (phase: PhaseId): string | null => {
  switch (phase) {
    case 'preflight':
    case 'enroute':
      return null
    case 'transition':
      return 'vprip'
    case 'ripon-to-fisk':
      return 'vprip'
    case 'at-fisk':
      return 'vpfis'
    case 'inbound-runway':
      return 'kosh'
    case 'ground':
      return 'kosh'
    case 'depart':
      return 'kosh'
  }
}

export const ApproachMap = ({ className = '' }: ApproachMapProps) => {
  const location = useAppStore((s) => s.currentLocation)
  const currentPhase = useAppStore((s) => s.currentPhase)
  const [components, setComponents] = useState<ReactLeafletModule | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || components) return
    let cancelled = false
    const load = async () => {
      try {
        const [reactLeaflet, , leaflet] = await Promise.all([
          import('react-leaflet'),
          import('leaflet/dist/leaflet.css'),
          import('leaflet')
        ])
        if (cancelled) return
        const leafletInstance = resolveLeafletModule(leaflet)
        const defaultIcon = leafletInstance.Icon.Default
        if (defaultIcon) {
          delete (defaultIcon.prototype as { _getIconUrl?: unknown })._getIconUrl
          defaultIcon.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
          })
        }
        setComponents(reactLeaflet)
      } catch (err) {
        console.error('Failed to load map:', err)
        if (!cancelled) setError(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [components])

  const focusId = phaseFocusWaypointId(currentPhase)
  const focusWaypoint = focusId ? waypointById(focusId) : null
  const center: LatLng =
    (location ? [location.lat, location.lng] : focusWaypoint?.position) ??
    positionFor('kosh') ??
    waypoints[0].position

  if (!components) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center rounded-cockpit bg-base-200 ${className}`}
        style={{ minHeight: 280 }}
      >
        <div className="text-center">
          {error ? (
            <>
              <MdLocationOff className="mx-auto h-10 w-10 text-error" />
              <p className="mt-2 text-sm text-base-content/70">Unable to load map.</p>
            </>
          ) : (
            <>
              <MdMap className="mx-auto h-10 w-10 animate-pulse text-base-content/40" />
              <p className="mt-2 text-sm text-base-content/60">Loading map...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } = components
  const phase = phaseById(currentPhase)
  const coarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches

  return (
    <div className={`relative h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={11}
        dragging={!coarsePointer}
        scrollWheelZoom={false}
        touchZoom={!coarsePointer}
        style={{ height: '100%', width: '100%', minHeight: 280 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {railroadRoute.length > 1 && (
          <Polyline
            positions={railroadRoute}
            pathOptions={{ color: '#7a5a2c', weight: 3, dashArray: '10, 5' }}
          />
        )}
        {finalApproachRoute.length > 1 && (
          <Polyline
            positions={finalApproachRoute}
            pathOptions={{ color: '#c46a16', weight: 4 }}
          />
        )}
        {waypoints.map((wp) => (
          <Marker key={wp.id} position={wp.position}>
            <Popup>
              <div className="text-center text-xs">
                <div className="font-bold">{wp.name}</div>
                <p className="mt-0.5 text-[10px] text-base-content/70">
                  {wp.description}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        {location && (
          <>
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div className="text-center text-xs">
                  <div className="font-bold">Your position</div>
                  <p>±{Math.round(location.accuracy)}m</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[location.lat, location.lng]}
              radius={location.accuracy}
              pathOptions={{
                color: '#1f4e8c',
                fillColor: '#1f4e8c',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}
        {focusWaypoint && (
          <Circle
            center={focusWaypoint.position}
            radius={1000}
            pathOptions={{
              color: '#4f7a3a',
              fillColor: '#4f7a3a',
              fillOpacity: 0.18,
              weight: 3,
              dashArray: '5, 5'
            }}
          />
        )}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <div className="pointer-events-auto m-3 self-end rounded-full bg-base-100/90 px-3 py-1.5 text-xs shadow">
          {location ? (
            <span className="inline-flex items-center gap-1 text-success">
              <MdMyLocation className="h-3.5 w-3.5" /> GPS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-base-content/60">
              <MdLocationOff className="h-3.5 w-3.5" /> No GPS
            </span>
          )}
        </div>
        {phase && (
          <div className="pointer-events-auto m-3 mt-auto self-start rounded-cockpit bg-base-100/95 px-3 py-2 text-xs shadow-cockpit">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              Phase {phase.order + 1}
            </div>
            <div className="font-semibold">{phase.title}</div>
          </div>
        )}
      </div>
    </div>
  )
}
