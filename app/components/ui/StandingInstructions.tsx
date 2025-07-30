import ReactMarkdown from 'react-markdown'
import { MdInfo } from 'react-icons/md'

const standingInstructions = [
  "ATIS: **125.9** - Fisk Approach: **120.7**",
  "Holding zones include **Ripon**, **Green Lake**, and **Puckaway Lake**, as well as an emergency landing turf strip south of Fisk.",
  "No FISK arrivals before **8 a.m. CDT on Thursday, July 25.**",
  `Transition points approaching Oshkosh from the west:    
  **Endeavor Bridge**, **Puckaway Lake**, and **Green Lake**. 
  ATC activates them on ATIS during highest traffic flows.`,
]

export const StandingInstructions = () => {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">
          <MdInfo className="text-info" />
          Standing Instructions
        </h3>
        <div className="space-y-3 mt-4">
          {standingInstructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-3"></div>
              <div className="flex-1">
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {instruction}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}