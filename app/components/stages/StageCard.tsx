import { useAppStore } from '~/store/useAppStore'
import { stages } from '~/routes/stages'
import type { Stage } from '~/routes/stages'
import ReactMarkdown from 'react-markdown'
import { 
  MdChevronLeft, 
  MdChevronRight, 
  MdExpandMore, 
  MdExpandLess,
  MdFlightTakeoff,
  MdRadio,
  MdSpeed,
  MdLocationOn,
  MdVisibility,
  MdAirplanemodeActive,
  MdLandscape,
  MdFlightLand,
  MdRefresh,
  MdLocalParking
} from 'react-icons/md'
import { useState } from 'react'

// Icon mapping for different instruction types
const getIconForInstruction = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'plane-departure': MdFlightTakeoff,
    'radio': MdRadio,
    'tachometer-alt': MdSpeed,
    'map-marker-alt': MdLocationOn,
    'eye': MdVisibility,
    'plane': MdAirplanemodeActive,
    'mountain': MdLandscape,
    'plane-arrival': MdFlightLand,
    'redo': MdRefresh,
    'parking': MdLocalParking,
  }
  return iconMap[iconName] || MdFlightTakeoff
}

interface StageCardProps {
  stage: Stage
}

export const StageCard = ({ stage }: StageCardProps) => {
  const { currentStage, nextStage, prevStage, mode, currentLocation } = useAppStore()
  const [showDetails, setShowDetails] = useState(mode === 'pre-flight')
  
  const currentStageIndex = stages.findIndex((s) => s.title === stage.title)
  
  return (
    <div className={`card bg-base-100 shadow-lg ${mode === 'in-flight' ? 'border-2 border-primary' : ''}`}>
      <div className={`card-body ${mode === 'in-flight' ? 'p-6 md:p-8' : ''}`}>
        {/* Header with stage number and GPS status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`badge ${mode === 'in-flight' ? 'badge-lg' : ''} badge-primary`}>
              Stage {currentStageIndex + 1} of {stages.length}
            </div>
            {mode === 'in-flight' && currentLocation && (
              <div className="badge badge-success gap-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                GPS Active
              </div>
            )}
          </div>
          {mode === 'pre-flight' && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-ghost btn-sm"
            >
              {showDetails ? <MdExpandLess /> : <MdExpandMore />}
              {showDetails ? 'Less' : 'More'}
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className={`card-title text-primary ${mode === 'in-flight' ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
            {stage.title}
          </h2>
        </div>

        {/* Instructions - Always visible */}
        <div className={`space-y-4 mt-6 ${mode === 'in-flight' ? 'bg-base-200 p-6 rounded-xl' : ''}`}>
          {stage.instructions.map((instruction, index) => {
            const IconComponent = getIconForInstruction(instruction.icon)
            return (
              <div key={index} className={`flex items-start gap-4 ${mode === 'in-flight' ? 'p-3 bg-base-100 rounded-lg shadow-sm' : ''}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`${mode === 'in-flight' ? 'w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center' : ''}`}>
                    <IconComponent className={`${mode === 'in-flight' ? 'w-7 h-7' : 'w-5 h-5'} text-primary`} />
                  </div>
                </div>
                <div className={`flex-1 ${mode === 'in-flight' ? 'text-lg md:text-xl font-medium' : 'text-base'}`}>
                  <ReactMarkdown>{instruction.text}</ReactMarkdown>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detailed Information - Collapsible in pre-flight, hidden in in-flight */}
        {showDetails && mode === 'pre-flight' && (
          <div className="mt-6 space-y-4">
            <div className="divider">Details</div>
            
            <div className="bg-base-200 p-4 rounded-lg">
              <ReactMarkdown className="prose prose-sm max-w-none">
                {stage.detailedInfo}
              </ReactMarkdown>
            </div>

            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <h4 className="font-semibold text-accent mb-2">Prepare for next stage:</h4>
              <ReactMarkdown className="prose prose-sm max-w-none text-base-content/80">
                {stage.nextStepPrep}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex justify-between ${mode === 'in-flight' ? 'mt-8 gap-4' : 'mt-6'}`}>
          {currentStageIndex > 0 ? (
            <button
              onClick={prevStage}
              className={`btn ${mode === 'in-flight' ? 'btn-lg min-h-[4rem] px-8' : 'btn-md'} btn-outline flex-1 md:flex-initial`}
            >
              <MdChevronLeft className={`${mode === 'in-flight' ? 'w-6 h-6' : 'w-5 h-5'} mr-1`} />
              Previous
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStageIndex < stages.length - 1 && (
            <button
              onClick={nextStage}
              className={`btn ${mode === 'in-flight' ? 'btn-lg min-h-[4rem] px-8' : 'btn-md'} btn-primary flex-1 md:flex-initial`}
            >
              Next Stage
              <MdChevronRight className={`${mode === 'in-flight' ? 'w-6 h-6' : 'w-5 h-5'} ml-1`} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}