import { useEffect, useState } from 'react'
import { useAppStore } from '~/store/useAppStore'
import { stages } from '~/routes/stages'
import { MdMyLocation, MdLocationOff, MdMap } from 'react-icons/md'

// Oshkosh approach waypoints (approximate coordinates)
const waypoints = {
  ripon: [43.8433, -88.8167] as [number, number],
  fisk: [43.7702, -88.5494] as [number, number],
  oshkosh: [43.9844, -88.5569] as [number, number],
  greenLake: [43.8442, -88.9567] as [number, number],
  puckawayLake: [43.6167, -89.1833] as [number, number],
}

// Railroad tracks route (simplified)
const railroadRoute: [number, number][] = [
  waypoints.ripon,
  [43.8350, -88.7800],
  [43.8200, -88.7400],
  [43.8000, -88.6800],
  [43.7850, -88.6200],
  waypoints.fisk,
]

// Final approach path
const finalApproachRoute: [number, number][] = [
  waypoints.fisk,
  [43.8200, -88.5600],
  [43.9000, -88.5580],
  waypoints.oshkosh,
]

interface ApproachMapProps {
  className?: string
}

export const ApproachMap = ({ className = '' }: ApproachMapProps) => {
  const { currentLocation, currentStage, setCurrentStage } = useAppStore()
  const [mapComponents, setMapComponents] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [loadError, setLoadError] = useState(false)
  
  // Center map based on current location or default to Oshkosh area
  const mapCenter: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng]
    : waypoints.oshkosh

  // Optimized lazy loading with error handling
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapComponents) {
      let cancelled = false
      
      const loadMapComponents = async () => {
        try {
          const [reactLeaflet, , leaflet] = await Promise.all([
            import('react-leaflet'),
            import('leaflet/dist/leaflet.css'),
            import('leaflet')
          ])
          
          if (cancelled) return
          
          // Fix default markers
          delete (leaflet.Icon.Default.prototype as any)._getIconUrl
          leaflet.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          })
          
          setMapComponents(reactLeaflet)
          setIsClient(true)
        } catch (error) {
          console.error('Failed to load map components:', error)
          if (!cancelled) setLoadError(true)
        }
      }
      
      loadMapComponents()
      
      return () => { cancelled = true }
    }
  }, [mapComponents])

  // Geofencing - check if user is near waypoints and auto-advance stages
  useEffect(() => {
    if (!currentLocation) return

    const userLatLng = [currentLocation.lat, currentLocation.lng] as [number, number]
    const proximityThreshold = 0.01 // Roughly 1km

    // Check proximity to key waypoints and auto-advance stages
    const checkProximity = (waypoint: [number, number], targetStage: number) => {
      const distance = Math.sqrt(
        Math.pow(userLatLng[0] - waypoint[0], 2) + 
        Math.pow(userLatLng[1] - waypoint[1], 2)
      )
      
      if (distance < proximityThreshold && currentStage < targetStage) {
        setCurrentStage(targetStage)
      }
    }

    // Auto-advance stages based on location
    checkProximity(waypoints.ripon, 1) // Initial Contact Point
    checkProximity(waypoints.fisk, 5) // Aircraft Type Identification
    checkProximity(waypoints.oshkosh, 8) // Final Approach
  }, [currentLocation, currentStage, setCurrentStage])

  const getCurrentStageWaypoint = (): [number, number] | null => {
    const stageWaypoints = [
      null, // Pre-approach prep
      waypoints.ripon, // Initial Contact Point
      waypoints.ripon, // Speed, Altitude & Distance (still at Ripon)
      waypoints.fisk, // Look for Landmarks
      waypoints.fisk, // Radio Communication
      waypoints.fisk, // Aircraft Type Identification
      waypoints.fisk, // Runway Assignment
      waypoints.oshkosh, // Final Approach
      waypoints.oshkosh, // Go-Around
      waypoints.oshkosh, // Taxi and Parking
    ]
    
    return stageWaypoints[currentStage] || null
  }

  // Show loading or error state until components are ready
  if (!isClient || !mapComponents) {
    return (
      <div className={`relative w-full h-full ${className} flex items-center justify-center bg-base-200 rounded-lg`} style={{ minHeight: '300px' }}>
        <div className="text-center p-8">
          {loadError ? (
            <>
              <MdLocationOff className="h-12 w-12 mx-auto text-error mb-4" />
              <p className="text-base-content/60 mb-2">Unable to load map</p>
              <p className="text-sm text-base-content/50">Check your connection and try again</p>
            </>
          ) : (
            <>
              <MdMap className="h-12 w-12 mx-auto text-base-content/40 mb-4 animate-pulse" />
              <p className="text-base-content/60">Loading Map...</p>
              <div className="mt-4">
                <span className="loading loading-spinner loading-sm text-primary"></span>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } = mapComponents

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Railroad tracks route */}
        <Polyline
          positions={railroadRoute}
          pathOptions={{ color: '#8B4513', weight: 3, dashArray: '10, 5' }}
        />
        
        {/* Final approach route */}
        <Polyline
          positions={finalApproachRoute}
          pathOptions={{ color: '#FF6B35', weight: 4 }}
        />
        
        {/* Waypoint markers */}
        <Marker position={waypoints.ripon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">Ripon</h3>
              <p className="text-sm">Initial Contact Point</p>
              <p className="text-xs">1,800 ft MSL</p>
            </div>
          </Popup>
        </Marker>
        
        <Marker position={waypoints.fisk}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">Fisk</h3>
              <p className="text-sm">Water Tower</p>
              <p className="text-xs">Monitor 120.7</p>
            </div>
          </Popup>
        </Marker>
        
        <Marker position={waypoints.oshkosh}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">Wittman Regional</h3>
              <p className="text-sm">KOSH</p>
              <p className="text-xs">Follow colored dots</p>
            </div>
          </Popup>
        </Marker>
        
        {/* User location */}
        {currentLocation && (
          <>
            <Marker position={[currentLocation.lat, currentLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold">Your Location</h3>
                  <p className="text-xs">Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Accuracy circle */}
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={currentLocation.accuracy}
              pathOptions={{ 
                color: '#3B82F6', 
                fillColor: '#3B82F6', 
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          </>
        )}
        
        {/* Current stage target waypoint highlight */}
        {getCurrentStageWaypoint() && (
          <Circle
            center={getCurrentStageWaypoint()!}
            radius={1000}
            pathOptions={{ 
              color: '#10B981', 
              fillColor: '#10B981', 
              fillOpacity: 0.2,
              weight: 3,
              dashArray: '5, 5'
            }}
          />
        )}
      </MapContainer>
      
      {/* Location status indicator */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className={`btn btn-sm ${currentLocation ? 'btn-success' : 'btn-error'}`}>
          {currentLocation ? (
            <>
              <MdMyLocation className="w-4 h-4 mr-1" />
              GPS Active
            </>
          ) : (
            <>
              <MdLocationOff className="w-4 h-4 mr-1" />
              No GPS
            </>
          )}
        </div>
      </div>
      
      {/* Stage indicator */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-base-100 shadow-lg rounded-lg p-3">
          <div className="text-sm font-semibold text-primary">
            Stage {currentStage + 1}: {stages[currentStage].title}
          </div>
          <div className="text-xs text-base-content/70">
            {stages[currentStage].timelinePosition}
          </div>
        </div>
      </div>
    </div>
  )
}