import { useEffect, lazy, Suspense } from 'react'
import { useAppStore } from '~/store/useAppStore'
import { useGeolocation } from '~/hooks/useGeolocation'
import { stages } from '~/routes/stages'

// Components
import { ThemeToggle } from './ui/ThemeToggle'
import { ModeToggle } from './ui/ModeToggle'
import { FrequencyHeader } from './ui/FrequencyHeader'
import { HorizontalTimeline } from './timeline/HorizontalTimeline'
import { StageCard } from './stages/StageCard'
import { NotamList } from './notams/NotamList'
import { StandingInstructions } from './ui/StandingInstructions'
// import { AircraftProfile } from './ui/AircraftProfile' // Hidden until integrated
import { OfflineIndicator } from './ui/OfflineIndicator'
import { MapToggle } from './ui/MapToggle'
import { MapFallback } from './map/MapFallback'
import { VisualAids } from './ui/VisualAids'
import { ErrorBoundary } from './ErrorBoundary'
import { ErrorNotification } from './ui/ErrorNotification'

// Lazy load the map component for better performance
const ApproachMap = lazy(() => import('./map/ApproachMap').then(module => ({ default: module.ApproachMap })))

// Icons
import { MdWarning, MdMap } from 'react-icons/md'
import ReactMarkdown from 'react-markdown'

interface FiskApproachAppProps {
  notamList: {
    notamList: Array<{
      id: string
      number: string
      type: string
      effectiveEnd: string
      text: string
    }>
  }
}

export const FiskApproachApp = ({ notamList }: FiskApproachAppProps) => {
  const { currentStage, mode, theme, enableMap } = useAppStore()
  
  // Initialize geolocation tracking
  useGeolocation()
  
  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const currentStageData = stages[currentStage]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-base-200">
        <ErrorNotification />
        
        {/* App Header */}
        <div className="bg-base-100 shadow-sm border-b border-base-300">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  EAA AirVenture - Oshkosh Approach Guide
                </h1>
                <p className="text-sm text-base-content/70">
                  Interactive guide for the Fisk Approach
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ModeToggle />
                <MapToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

      {/* Frequency Header */}
      <FrequencyHeader />

      {/* Horizontal Timeline */}
      <HorizontalTimeline />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {mode === 'pre-flight' ? (
          // Pre-flight Layout - More detailed, side-by-side
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Instructions and Current Stage */}
            <div className="xl:col-span-2 space-y-6">
              {/* Important Notice */}
              <div className="alert alert-warning">
                <MdWarning className="h-6 w-6" />
                <div>
                  <h3 className="font-bold">Important - New 2024 NOTAM</h3>
                  <div className="text-sm mt-1">
                    <ReactMarkdown>
                      Familiarise yourself with the new procedures for this year! 
                      **[Download Full Digital Copy](https://www.eaa.org/~/media/B6C8744689624E2C9A424352E42C3EA7.ashx)**
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Current Stage */}
              <StageCard stage={currentStageData} />

              {/* NOTAMs */}
              <NotamList notamList={notamList.notamList || []} />

              {/* Moving Map */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">
                    <MdMap className="text-primary" />
                    Approach Map
                  </h3>
                  <div className="h-96 w-full rounded-lg overflow-hidden">
                    {enableMap ? (
                      <Suspense fallback={<MapFallback className="h-full w-full" />}>
                        <ApproachMap className="h-full w-full" />
                      </Suspense>
                    ) : (
                      <MapFallback className="h-full w-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Standing Instructions and Summary */}
            <div className="space-y-6">
              {/* <AircraftProfile /> Hidden until integrated */}
              <VisualAids />
              <StandingInstructions />
              
              {/* Stage Summary */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-sm">Progress Summary</h3>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-base-content/70">Current Stage:</span>
                      <span className="ml-2 font-semibold">{currentStage + 1} of {stages.length}</span>
                    </div>
                    <div>
                      <span className="text-base-content/70">Stage:</span>
                      <span className="ml-2 font-semibold">{currentStageData.title}</span>
                    </div>
                    <div>
                      <span className="text-base-content/70">Timeline:</span>
                      <span className="ml-2">{currentStageData.timelinePosition}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // In-flight Layout - Simplified, focused
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Current Stage */}
              <div>
                <StageCard stage={currentStageData} />
              </div>
              
              {/* Right side - Moving Map */}
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">
                    <MdMap className="text-primary" />
                    Live Position
                  </h3>
                  <div className="h-96 lg:h-[32rem] w-full rounded-lg overflow-hidden">
                    {enableMap ? (
                      <Suspense fallback={<MapFallback className="h-full w-full" />}>
                        <ApproachMap className="h-full w-full" />
                      </Suspense>
                    ) : (
                      <MapFallback className="h-full w-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Critical NOTAMs only */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-warning">
                  <MdWarning />
                  Critical NOTAMs
                </h3>
                <div className="text-sm">
                  {notamList.notamList && notamList.notamList.length > 0 ? (
                    <div className="space-y-2">
                      {notamList.notamList.slice(0, 3).map((notam) => (
                        <div key={notam.id} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <span className="font-mono text-xs text-warning mr-2">
                              {notam.number}
                            </span>
                            <span className="text-sm">{notam.text}</span>
                          </div>
                        </div>
                      ))}
                      {notamList.notamList.length > 3 && (
                        <div className="text-xs text-base-content/60 text-center pt-2">
                          +{notamList.notamList.length - 3} more NOTAMs
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-base-content/60">
                      No critical NOTAMs
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
    </ErrorBoundary>
  )
}