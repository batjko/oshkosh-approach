import { MdMap, MdLocationOn } from 'react-icons/md'
import { useAppStore } from '~/store/useAppStore'
import { stages } from '~/routes/stages'

export const MapFallback = ({ className = '' }: { className?: string }) => {
  const { currentStage, currentLocation } = useAppStore()
  
  const currentStageData = stages[currentStage]
  
  return (
    <div className={`relative ${className} bg-base-200 rounded-lg border-2 border-dashed border-base-300`}>
      <div className="text-center p-8">
        <MdMap className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
        <h3 className="text-lg font-semibold text-base-content mb-2">
          Interactive Map Unavailable
        </h3>
        <p className="text-base-content/70 mb-4">
          The interactive map feature requires a modern browser with JavaScript enabled.
        </p>
        
        {/* Current Position Info */}
        <div className="bg-base-100 rounded-lg p-4 mb-4">
          <h4 className="font-semibold mb-2">Current Stage</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-base-content/70">Stage:</span>
              <span className="ml-2 font-semibold">{currentStage + 1} of {stages.length}</span>
            </div>
            <div>
              <span className="text-base-content/70">Title:</span>
              <span className="ml-2">{currentStageData.title}</span>
            </div>
            <div>
              <span className="text-base-content/70">Timeline:</span>
              <span className="ml-2">{currentStageData.timelinePosition}</span>
            </div>
          </div>
        </div>

        {/* GPS Status */}
        <div className="bg-base-100 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center justify-center gap-2">
            <MdLocationOn className="text-primary" />
            GPS Status
          </h4>
          {currentLocation ? (
            <div className="text-sm space-y-1">
              <div className="text-success">✓ Location Available</div>
              <div>
                <span className="text-base-content/70">Accuracy:</span>
                <span className="ml-2">±{Math.round(currentLocation.accuracy)}m</span>
              </div>
              <div className="text-xs text-base-content/60 mt-2">
                Lat: {currentLocation.lat.toFixed(6)}<br/>
                Lng: {currentLocation.lng.toFixed(6)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-base-content/60">
              Location not available or permission not granted
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-base-content/50">
          Try refreshing the page or updating your browser for full map functionality
        </div>
      </div>
    </div>
  )
}