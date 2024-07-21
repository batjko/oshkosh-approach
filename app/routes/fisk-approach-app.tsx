import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const stages = [
  {
    title: "Pre-Approach Preparation",
    instructions: [
      { text: "Review NOTAM for arrival procedures", icon: "info-circle" },
      { text: "Monitor ATIS on 125.9", icon: "radio" },
      { text: "Have AirVenture NOTAM on board", icon: "map" },
    ],
    detailedInfo: "Ensure you have the latest AirVenture NOTAM and familiarize yourself with the arrival procedure. The ATIS frequency 125.9 will provide current airport information.",
    nextStepPrep: "Proceed to Ripon at 1,800 feet MSL",
    timelinePosition: 0
  },
  {
    title: "Initial Contact Point (Ripon)",
    instructions: [
      { text: "Arrive at Ripon at 1,800 feet MSL", icon: "target" },
      { text: "Join single-file line over railroad tracks", icon: "users" },
    ],
    detailedInfo: "Ripon is your initial contact point. Maintain 1,800 feet MSL and form a single-file line following the railroad tracks.",
    nextStepPrep: "Prepare to maintain 90 knots",
    timelinePosition: 25
  },
  {
    title: "Speed and Altitude Management",
    instructions: [
      { text: "Maintain 90 knots (or 2,300 rpm for slower aircraft)", icon: "plane" },
      { text: "Maintain 1,800 feet MSL", icon: "target" },
    ],
    detailedInfo: "From Ripon to Fisk, maintain 90 knots (or 2,300 rpm for slower aircraft) and keep your altitude at 1,800 feet MSL. This ensures proper spacing and flow of traffic.",
    nextStepPrep: "Watch for proper spacing between aircraft",
    timelinePosition: 50
  },
  {
    title: "Aircraft Spacing",
    instructions: [
      { text: "Maintain half-mile separation", icon: "users" },
      { text: "Adjust spacing as instructed by ATC", icon: "radio" },
    ],
    detailedInfo: "Proper spacing is crucial for safety. Aim for half-mile separation between aircraft. Be prepared to adjust your spacing if instructed by ATC.",
    nextStepPrep: "Look for Fisk water tower",
    timelinePosition: 75
  },
  {
    title: "Visual References and Landmarks",
    instructions: [
      { text: "Follow railroad tracks from Ripon to Fisk", icon: "map" },
      { text: "Report at Fisk water tower", icon: "landmark" },
      { text: "Prepare for right turn at power plant", icon: "chevron-right" },
    ],
    detailedInfo: "Use visual landmarks to navigate. The railroad tracks will guide you from Ripon to Fisk. The Fisk water tower is your reporting point, and you'll make a right turn at the power plant.",
    nextStepPrep: "Monitor Fisk Approach on 120.7",
    timelinePosition: 100
  },
];

const ApproachMap = () => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <h2 className="text-xl font-bold mb-2">Approach Map</h2>
    <div className="bg-gray-200 h-64 flex items-center justify-center">
      <p>Interactive map would be displayed here</p>
    </div>
  </div>
);

interface TimelineProps {
  currentStage: number;
}

const Timeline = ({ currentStage }: TimelineProps) => {
  const timelineData = stages.map((stage, index) => ({
    name: stage.title,
    progress: stage.timelinePosition,
    current: index === currentStage
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-2">Approach Timeline</h2>
      {/* <ResponsiveContainer width="100%" height={100}>
        <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" tick={false} />
          <YAxis hide={true} />
          <Tooltip />
          <Line type="monotone" dataKey="progress" stroke="#8884d8" strokeWidth={2} dot={{ r: 8 }} activeDot={{ r: 10 }} />
          {timelineData.map((entry, index) => (
            <ReferenceLine key={index} x={index} stroke="green" label={{ position: 'top', value: entry.name, fill: entry.current ? 'red' : 'black', fontSize: 10 }} />
          ))}
        </LineChart>
      </ResponsiveContainer> */}
    </div>
  );
};

interface Stage {
  title: string;
  instructions: { text: string; icon: string }[];
  detailedInfo: string;
  nextStepPrep: string;
  timelinePosition: number;
}

interface ApproachStageProps {
  stage: Stage;
  onNext: () => void;
  onPrev: () => void;
}

const ApproachStage = ({ stage, onNext, onPrev }: ApproachStageProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-2">{stage.title}</h2>
      <ul className="list-none pl-0 mb-4">
        {stage.instructions.map((instruction, index) => (
          <li key={index} className="mb-2 flex items-center">
            <i className={`fas fa-${instruction.icon} w-6 h-6 mr-2`}></i>
            <span>{instruction.text}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="text-blue-500 hover:text-blue-700 mb-2"
      >
        {expanded ? "Hide Details" : "Show Details"}
      </button>
      {expanded && (
        <div className="bg-gray-100 p-2 rounded mb-4">
          <p>{stage.detailedInfo}</p>
        </div>
      )}
      <div className="bg-blue-100 p-2 rounded">
        <h3 className="font-semibold mb-1">Prepare for next:</h3>
        <p>{stage.nextStepPrep}</p>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={onPrev}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <i className="fas fa-chevron-left mr-2"></i>
          Prev
        </button>
        <button
          onClick={onNext}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          Next
          <i className="fas fa-chevron-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: { audioEnabled: boolean };
  onSettingChange: (setting: string, value: boolean) => void;
}

const SettingsModal = ({ isOpen, onClose, settings, onSettingChange }: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={(e) => onSettingChange('audioEnabled', e.target.checked)}
              className="mr-2"
            />
            Enable Audio Cues
          </label>
        </div>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const FiskApproachApp = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [settings, setSettings] = useState({ audioEnabled: true });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (settings.audioEnabled) {
      console.log('(Fake) Audio enabled');
      // fetch('/api/placeholder/audio', { method: 'HEAD' })
      //   .then(response => {
      //     if (response.ok) {
      //       const audio = new Audio('/api/placeholder/audio');  // replace with actual audio file path
      //       audio.play();
      //     } else {
      //       console.warn('Audio file not found');
      //     }
      //   })
      //   .catch(error => console.error('Error fetching audio file:', error));
    }
  }, [currentStage, settings.audioEnabled]);

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
    }
  };

  const handlePrev = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Fisk Approach Guide</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <i className="fas fa-cog mr-2"></i>
          Settings
        </button>
      </div>
      <div className="mb-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <div className="flex">
            <div className="py-1"><i className="fas fa-info-circle fill-current h-6 w-6 text-yellow-500 mr-4"></i></div>
            <div>
              <p className="font-bold">Important</p>
              <p className="text-sm">Always follow current ATC instructions and the latest NOTAM.</p>
            </div>
          </div>
        </div>
      </div>
      <Timeline currentStage={currentStage} />
      <ApproachMap />
      <ApproachStage 
        stage={stages[currentStage]}
        onNext={handleNext}
        onPrev={handlePrev}
      />
      <div className="text-center text-gray-500">
        Stage {currentStage + 1} of {stages.length}
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingChange={handleSettingChange}
      />
      {settings.audioEnabled && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full">
          <i className="fas fa-volume-up"></i>
        </div>
      )}
    </div>
  );
};

export default FiskApproachApp;