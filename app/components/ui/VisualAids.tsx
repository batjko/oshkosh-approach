import { useState } from 'react'
import { MdInfo, MdClose, MdVisibility } from 'react-icons/md'

interface Diagram {
  id: string
  title: string
  description: string
  content: JSX.Element
}

const diagrams: Diagram[] = [
  {
    id: 'railroad-tracks',
    title: 'Following the Railroad Tracks',
    description: 'Visual reference from Ripon to Fisk',
    content: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Railroad tracks */}
        <path 
          d="M 50 250 L 350 50" 
          stroke="#8B4513" 
          strokeWidth="8" 
          strokeDasharray="15 10"
        />
        {/* Ripon */}
        <circle cx="50" cy="250" r="15" fill="#dc2626" />
        <text x="30" y="280" fontSize="14" className="fill-base-content">Ripon</text>
        {/* Fisk */}
        <circle cx="350" cy="50" r="15" fill="#dc2626" />
        <text x="320" y="35" fontSize="14" className="fill-base-content">Fisk</text>
        {/* Aircraft */}
        <path 
          d="M 180 160 L 190 150 L 200 160 L 190 170 Z" 
          fill="#3b82f6" 
          transform="rotate(-40 190 160)"
        />
        <text x="210" y="170" fontSize="12" className="fill-base-content">90 kts</text>
        <text x="210" y="185" fontSize="12" className="fill-base-content">1,800ft</text>
      </svg>
    )
  },
  {
    id: 'fisk-water-tower',
    title: 'Fisk Water Tower',
    description: 'Key visual checkpoint',
    content: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Ground */}
        <rect x="0" y="250" width="400" height="50" fill="#8fbc8f" />
        {/* Water tower */}
        <rect x="180" y="180" width="40" height="70" fill="#696969" />
        <circle cx="200" cy="150" r="40" fill="#4682b4" />
        <text x="150" y="130" fontSize="14" className="fill-base-content font-bold">FISK</text>
        {/* Radio towers */}
        <line x1="100" y1="250" x2="100" y2="200" stroke="#333" strokeWidth="2" />
        <line x1="300" y1="250" x2="300" y2="210" stroke="#333" strokeWidth="2" />
        {/* Instructions */}
        <text x="50" y="20" fontSize="16" className="fill-base-content font-bold">Rock Your Wings!</text>
        <text x="250" y="280" fontSize="12" className="fill-base-content">Monitor 120.7</text>
      </svg>
    )
  },
  {
    id: 'holding-pattern',
    title: 'Holding Patterns',
    description: 'Green Lake and Puckaway Lake holding areas',
    content: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Green Lake */}
        <ellipse cx="100" cy="150" rx="60" ry="40" fill="#4682b4" opacity="0.3" />
        <path 
          d="M 40 150 Q 100 110 160 150 Q 100 190 40 150" 
          fill="none" 
          stroke="#dc2626" 
          strokeWidth="2" 
          strokeDasharray="5 5"
        />
        <text x="50" y="100" fontSize="14" className="fill-base-content font-bold">Green Lake</text>
        <text x="60" y="220" fontSize="12" className="fill-base-content">2,300ft</text>
        
        {/* Puckaway Lake */}
        <ellipse cx="300" cy="150" rx="60" ry="40" fill="#4682b4" opacity="0.3" />
        <path 
          d="M 240 150 Q 300 110 360 150 Q 300 190 240 150" 
          fill="none" 
          stroke="#dc2626" 
          strokeWidth="2" 
          strokeDasharray="5 5"
        />
        <text x="240" y="100" fontSize="14" className="fill-base-content font-bold">Puckaway Lake</text>
        <text x="270" y="220" fontSize="12" className="fill-base-content">1,800ft</text>
      </svg>
    )
  },
  {
    id: 'colored-dots',
    title: 'Colored Dot System',
    description: 'Follow the colored dots to your runway',
    content: (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Runways */}
        <rect x="50" y="50" width="100" height="20" fill="#333" />
        <text x="60" y="90" fontSize="12" className="fill-base-content">Rwy 27</text>
        
        <rect x="250" y="50" width="100" height="20" fill="#333" />
        <text x="260" y="90" fontSize="12" className="fill-base-content">Rwy 18R</text>
        
        <rect x="150" y="150" width="100" height="20" fill="#333" />
        <text x="160" y="190" fontSize="12" className="fill-base-content">Rwy 36L</text>
        
        {/* Colored dots */}
        <circle cx="200" cy="250" r="20" fill="#ff1493" />
        <path d="M 200 230 L 150 170" stroke="#ff1493" strokeWidth="4" strokeDasharray="8 4" />
        <text x="210" y="255" fontSize="14" className="fill-base-content font-bold">Pink</text>
        
        <circle cx="100" cy="250" r="20" fill="#ffff00" />
        <path d="M 100 230 L 100 70" stroke="#ffff00" strokeWidth="4" strokeDasharray="8 4" />
        <text x="110" y="255" fontSize="14" className="fill-base-content font-bold">Yellow</text>
        
        <circle cx="300" cy="250" r="20" fill="#ffffff" stroke="#333" strokeWidth="2" />
        <path d="M 300 230 L 300 70" stroke="#333" strokeWidth="4" strokeDasharray="8 4" />
        <text x="310" y="255" fontSize="14" className="fill-base-content font-bold">White</text>
      </svg>
    )
  }
]

export const VisualAids = () => {
  const [selectedDiagram, setSelectedDiagram] = useState<string | null>(null)
  
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title">
          <MdVisibility className="text-primary" />
          Visual References
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {diagrams.map((diagram) => (
            <button
              key={diagram.id}
              onClick={() => setSelectedDiagram(diagram.id)}
              className="btn btn-outline btn-sm justify-start"
            >
              <MdInfo className="w-4 h-4" />
              {diagram.title}
            </button>
          ))}
        </div>
        
        {/* Modal for displaying diagrams */}
        {selectedDiagram && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              {diagrams.find(d => d.id === selectedDiagram) && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">
                      {diagrams.find(d => d.id === selectedDiagram)?.title}
                    </h3>
                    <button
                      className="btn btn-sm btn-circle btn-ghost"
                      onClick={() => setSelectedDiagram(null)}
                    >
                      <MdClose className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-base-content/70 mb-4">
                    {diagrams.find(d => d.id === selectedDiagram)?.description}
                  </p>
                  
                  <div className="bg-base-200 rounded-lg p-4" style={{ minHeight: '300px' }}>
                    {diagrams.find(d => d.id === selectedDiagram)?.content}
                  </div>
                </>
              )}
            </div>
            <div className="modal-backdrop" onClick={() => setSelectedDiagram(null)} />
          </div>
        )}
      </div>
    </div>
  )
}