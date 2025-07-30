export interface StageInstruction {
  text: string
  icon: string
}

export interface Stage {
  title: string
  instructions: StageInstruction[]
  detailedInfo: string
  nextStepPrep: string
  timelinePosition: string
  estimatedDistance?: string
  estimatedDuration?: string
}

export const stages: Stage[] = [
  {
    title: "Pre-Approach Prep",
    instructions: [
      { text: "Check current NOTAMs", icon: "check-circle" },
      { text: "Monitor ATIS on **125.9**", icon: "broadcast-tower" }, // Changed from "radio"
      { text: "Listen to Oshkosh ATIS", icon: "headphones" },
      { text: "Have AirVenture NOTAM on board", icon: "map" },
    ],
    detailedInfo: "Ensure you have the latest AirVenture NOTAM and familiarize yourself with the arrival procedure. The ATIS frequency 125.9 will provide current airport information.",
    nextStepPrep: "Proceed to Ripon at **1,800 feet MSL**",
    timelinePosition: "Before departure or en route",
  },
  {
    title: "Initial Contact Point (Ripon)",
    instructions: [
      { text: "Arrive at Ripon at **1,800** feet MSL", icon: "map-marker-alt" },
      { text: "Join single-file line over railroad tracks", icon: "users" },
      { text: "Form a single line following the tracks", icon: "route" },
    ],
    detailedInfo: "Ripon is your initial contact point. Maintain **1,800 feet MSL** and form a single-file line following the railroad tracks.",
    nextStepPrep: "Prepare to maintain **90 knots**",
    timelinePosition: "Approximately 15-20 minutes before landing",
  },
  {
    title: "Speed, Altitude & Distance",
    instructions: [
      { text: "Maintain **90 knots** (or 2,300 rpm for slower aircraft)", icon: "tachometer-alt" },
      { text: "Maintain **1,800 feet** MSL", icon: "tachometer-alt" }, // Changed from "altimeter"
      { text: "Maintain half-mile separation", icon: "ruler" },
      { text: "Adjust spacing as instructed by ATC", icon: "broadcast-tower" }, // Changed from "radio"
    ],
    detailedInfo: "From Ripon to Fisk, maintain **90 knots** (or 2,300 rpm for slower aircraft) and keep your altitude at **1,800** feet MSL. This ensures proper spacing and flow of traffic.\n\nProper spacing is crucial for safety. Aim for **half-mile separation** between aircraft. Be prepared to adjust your spacing if instructed by ATC.",
    nextStepPrep: "Look for Fisk water tower",
    timelinePosition: "Continuous from Ripon to Final Approach, 10-15 minutes before landing",
  },
  {
    title: "Look for Landmarks",
    instructions: [
      { text: "Follow **railroad tracks** from Ripon to Fisk", icon: "map" },
      { text: "Report at Fisk water tower", icon: "landmark" },
      { text: "Prepare for right turn at power plant", icon: "arrow-right" },
    ],
    detailedInfo: "Use visual landmarks to navigate. The railroad tracks will guide you from Ripon to Fisk. The Fisk water tower is your reporting point, and you'll make a right turn at the power plant.",
    nextStepPrep: "Monitor Fisk Approach on **120.7**",
    timelinePosition: "About 10-15 minutes before landing",
  },
  {
    title: "Radio Communication Procedures",
    instructions: [
      { text: "Monitor Fisk Approach on **120.7**", icon: "broadcast-tower" }, // Changed from "radio"
      { text: "No radio calls until instructed", icon: "ban" },
      { text: "Acknowledge with wing rock only", icon: "plane" },
    ],
    detailedInfo: "Maintain radio silence until instructed otherwise. Acknowledge ATC instructions with a wing rock.",
    nextStepPrep: "Identify your aircraft type and color",
    timelinePosition: "Continuous from Ripon to landing, starting about 15 minutes before landing",
  },
  {
    title: "Aircraft Type Identification",
    instructions: [
      { text: "Identify your aircraft type and color", icon: "plane" },
      { text: "Respond to ATC identification", icon: "reply" },
    ],
    detailedInfo: "ATC will identify aircraft by type and color, not by N-number. Be sure you know how your aircraft will be described.",
    nextStepPrep: "Prepare for runway assignment",
    timelinePosition: "At Fisk, about 5-10 minutes before landing",
  },
  {
    title: "Runway Assignment",
    instructions: [
      { text: "Listen for runway assignment", icon: "broadcast-tower" },
      { text: "Prepare for last-minute changes", icon: "exclamation-triangle" },
    ],
    detailedInfo: "Your runway assignment may change at the last minute due to traffic flow. Be prepared to adjust quickly.",
    nextStepPrep: "Prepare for final approach",
    timelinePosition: "At Fisk, about 5-10 minutes before landing",
  },
  {
    title: "Final Approach Instructions",
    instructions: [
      { text: "Turn right, follow the road", icon: "road" },
      { text: "Land on the colored dot ATC gives you", icon: "dot-circle" },
      { text: "**Await clearance** to land", icon: "check-circle" },
    ],
    detailedInfo: "Follow ATC instructions for final approach. Land on the designated colored dot and clear the runway quickly.",
    nextStepPrep: "Be ready for go-around if necessary",
    timelinePosition: "2-5 minutes before landing",
  },
  {
    title: "Go-Around Procedures",
    instructions: [
      { text: "Execute go-around if necessary", icon: "redo" },
      { text: "Fly runway heading, climb to **1,800 feet**", icon: "arrow-up" },
      { text: "Return to Ripon and start over", icon: "undo" },
    ],
    detailedInfo: "Be ready to execute a go-around at any point. Follow the procedure and return to Ripon if necessary.",
    nextStepPrep: "Otherwise, prepare for taxi instructions",
    timelinePosition: "If necessary, at any time",
  },
  {
    title: "Taxi and Parking",
    instructions: [
      { text: "Exit at next exit from colored dot", icon: "sign-out-alt" },
      { text: "Follow the flagman (Marshal)", icon: "flag" },
      { text: "Hold up identifier code page for Marshal", icon: "file-alt" },
      { text: "Taxi to GA parking as directed", icon: "parking" },
    ],
    detailedInfo: "After landing, exit the runway quickly and follow the flagman's directions to general aviation parking.",
    nextStepPrep: "Shut down at the end of the runway",
    timelinePosition: "Immediately after landing",
  },
];