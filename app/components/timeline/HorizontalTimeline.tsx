import { useRef, useEffect } from 'react'
import { useAppStore } from '~/store/useAppStore'
import { stages } from '~/routes/stages'
import { MdCheckCircle, MdRadioButtonUnchecked, MdAdjust, MdFlightTakeoff, MdFlightLand } from 'react-icons/md'

export const HorizontalTimeline = () => {
  const { currentStage, setCurrentStage, mode, currentLocation } = useAppStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentStageRef = useRef<HTMLButtonElement>(null)

  const timelineData = stages.map((stage, index) => ({
    name: stage.title,
    progress: stage.timelinePosition,
    current: index === currentStage,
    completed: index < currentStage,
    distance: stage.estimatedDistance || null,
    duration: stage.estimatedDuration || null,
  }))

  // Auto-scroll to current stage
  useEffect(() => {
    if (currentStageRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const element = currentStageRef.current
      const elementLeft = element.offsetLeft
      const elementWidth = element.offsetWidth
      const containerWidth = container.offsetWidth
      const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2)
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
    }
  }, [currentStage])

  return (
    <div className="bg-base-100 shadow-sm border-b border-base-300">
      <div className="container mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                  style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="relative flex justify-between">
              <MdFlightTakeoff className="h-6 w-6 text-success bg-base-100 z-10" />
              <MdFlightLand className="h-6 w-6 text-primary bg-base-100 z-10" />
            </div>
          </div>
        </div>
        
        {/* Timeline items */}
        <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-base-300">
          <div className="flex items-center gap-3 min-w-max pb-2">
            {timelineData.map((stage, index) => (
              <div key={index} className="flex items-center">
                <button
                  ref={stage.current ? currentStageRef : null}
                  onClick={() => setCurrentStage(index)}
                  className={`group relative flex flex-col items-center p-4 rounded-xl transition-all min-w-[140px] ${
                    stage.current 
                      ? 'bg-primary/10 border-2 border-primary shadow-lg scale-105' 
                      : stage.completed
                      ? 'bg-success/10 border border-success/30 hover:bg-success/20'
                      : 'bg-base-200 hover:bg-base-300 border border-base-300'
                  } ${mode === 'in-flight' && !stage.current && !stage.completed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={mode === 'in-flight' && !stage.current && !stage.completed}
                >
                  {/* Stage number badge */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    stage.current ? 'bg-primary text-primary-content' : 
                    stage.completed ? 'bg-success text-success-content' : 
                    'bg-base-300 text-base-content'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-2">
                    {stage.completed ? (
                      <MdCheckCircle className="h-8 w-8 text-success" />
                    ) : stage.current ? (
                      <MdAdjust className="h-8 w-8 text-primary animate-pulse" />
                    ) : (
                      <MdRadioButtonUnchecked className="h-8 w-8 text-base-content/30" />
                    )}
                  </div>
                  
                  {/* Stage info */}
                  <div className="text-center">
                    <div className={`text-sm font-semibold line-clamp-2 ${
                      stage.current ? 'text-primary' : 
                      stage.completed ? 'text-success' : 
                      'text-base-content'
                    }`}>
                      {stage.name}
                    </div>
                    <div className="text-xs text-base-content/60 mt-1">
                      {stage.progress}
                    </div>
                    {stage.distance && (
                      <div className="text-xs text-base-content/50 mt-1">
                        {stage.distance}
                      </div>
                    )}
                  </div>
                  
                  {/* GPS indicator for current stage */}
                  {stage.current && currentLocation && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-success rounded-full animate-ping" />
                    </div>
                  )}
                </button>
                
                {/* Connector line */}
                {index < timelineData.length - 1 && (
                  <div className="flex-shrink-0 mx-1">
                    <div className={`h-0.5 w-6 transition-colors ${
                      index < currentStage ? 'bg-success' : 'bg-base-300'
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Stage counter for mobile */}
        <div className="mt-3 text-center sm:hidden">
          <span className="text-sm font-medium text-base-content">
            Stage {currentStage + 1} of {stages.length}
          </span>
        </div>
      </div>
    </div>
  )
}