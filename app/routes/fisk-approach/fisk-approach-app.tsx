import { useState } from "react";
import { stages } from "../stages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import ReactMarkdown from "react-markdown";

// const ReactMarkdown = ({ children }) => <div><p>HELLO</p></div>

import "./approach.css";

const standingInstructions = [
  "ATIS: **125.9** - Fisk Approach: **120.7**",
  "Holding zones include **Ripon**, **Green Lake**, and **Puckaway Lake**, as well as an emergency landing turf strip south of Fisk.",
  "No FISK arrivals before **8 a.m. CDT on Thursday, July 25.**",
  `Transition points approaching Oshkosh from the west:    
  **Endeavor Bridge**, **Puckaway Lake**, and **Green Lake**. 
  ATC activates them on ATIS during highest traffic flows.`,
];

const CurrentSituationBox = ({ notamList: { notamList } }) => {
  return (
    <div className="card bg-base-100 shadow-md mb-4">
      <div className="card-body">
        <h2 className="card-title">Current NOTAMs ({ notamList?.length })</h2>
        <div className="flex flex-col -mx-2" style={{ minHeight: "300px" }}>
          <div className="overflow-x-auto">
            <table className="table table-xs w-full mt-4">
              <thead>
                <tr className="text-base-content">
                  <th className="text-center">Number</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Until</th>
                  <th className="text-center">Text</th>
                </tr>
              </thead>
              <tbody>
                {notamList && notamList.length > 0 ? (
                  notamList.map((notam, index) => (
                    <tr
                      key={notam.id}
                      className={
                        index % 2 === 0 ? "bg-base-200" : "bg-base-100"
                      }
                    >
                      <td>{notam.number}</td>
                      <td>{notam.type}</td>
                      <td>{notam.effectiveEnd}</td>
                      <td className="text-base-content">{notam.text}</td>
                    </tr>
                  ))
                ) : (
                  <p>No data...</p>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineProps {
  currentStage: number;
  onStageClick: (stageIndex: number) => void;
}

const Timeline = ({ currentStage, onStageClick }: TimelineProps) => {
  const timelineData = stages.map((stage, index) => ({
    name: stage.title,
    progress: stage.timelinePosition,
    current: index === currentStage,
    completed: index < currentStage,
  }));

  return (
    <div className="card bg-base-100 shadow-xl mb-4">
      <div className="card-body">
        <h3 className="card-title text-center">Approach</h3>
        <div className="flex flex-col mt-8">
          {timelineData.map((stage, index) => (
            <a
              key={index}
              href={`#stage-${index + 1}`}
              role="button"
              tabIndex={0}
              className={`flex items-center mb-2 ${
                stage.current ? "font-bold" : ""
              }`}
              onClick={() => onStageClick(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onStageClick(index);
              }}
              style={{ cursor: "pointer" }}
            >
              <div
                className={`badge ${
                  stage.current
                    ? "badge-error"
                    : stage.completed
                    ? "badge-success"
                    : "badge-primary"
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-2 flex flex-col">
                <p className="text-base">{stage.name}</p>
                <p className="text-xs text-base-content text-opacity-50">
                  {stage.progress}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="text-center text-base-content mt-4 mb-2">
        Stage {currentStage + 1} of {stages.length}
      </div>
    </div>
  );
};

interface Stage {
  title: string;
  instructions: { text: string; icon: IconName }[];
  detailedInfo: string;
  nextStepPrep: string;
  timelinePosition: string;
}

interface ApproachStageProps {
  stage: Stage;
  onNext: () => void;
  onPrev: () => void;
}

const ApproachStage = ({ stage, onNext, onPrev }: ApproachStageProps) => {
  const currentStageIndex = stages.findIndex((s) => s.title === stage.title);
  return (
    <div className="card bg-base-100 shadow-xl mb-4">
      <div className="card-body">
        <h2 className="card-title">{stage.title}</h2>
        <ul className="list-none pl-0 mb-4">
          {stage.instructions.map((instruction, index) => (
            <li key={index} className="mb-2 flex items-center">
              <FontAwesomeIcon
                icon={["fas", instruction.icon]}
                className="w-4 h-4 mr-2 text-primary"
              />
              <span className="text-base-content">
                <ReactMarkdown>{instruction.text}</ReactMarkdown>
              </span>
            </li>
          ))}
        </ul>

        <div className="border border-base-300 rounded p-2 mb-4">
          <p className="text-base-content">
            <ReactMarkdown>{stage.detailedInfo}</ReactMarkdown>
          </p>
        </div>

        <div className="bg-base-300 p-4 rounded-lg shadow-md flex justify-end w-auto ml-auto">
          <div>
            <h3 className="font-semibold text-base-content mb-2">
              Prepare for next stage:
            </h3>
            <p className="text-base-content text-opacity-70">
              <ReactMarkdown>{stage.nextStepPrep}</ReactMarkdown>
            </p>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          {currentStageIndex > 0 ? (
            <a
              href={`#stage-${currentStageIndex}`}
              onClick={onPrev}
              className="btn btn-outline"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
              Prev
            </a>
          ) : (
            <div></div>
          )}
          {currentStageIndex < stages.length - 1 && (
            <a
              href={`#stage-${currentStageIndex + 1}`}
              onClick={onNext}
              className="btn btn-primary"
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 ml-2" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const FiskApproachApp = ({ notamList }) => {
  const [currentStage, setCurrentStage] = useState(0);

  const handleNext = () =>
    currentStage < stages.length - 1 && setCurrentStage(currentStage + 1);
  const handlePrev = () =>
    currentStage > 0 && setCurrentStage(currentStage - 1);
  const handleStageClick = (stageIndex: number) => setCurrentStage(stageIndex);

  return (
    <div className="min-h-screen bg-base-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="col-span-1">
        <div className="flex flex-col justify-between h-full">
          <div>
            <h1 className="text-3xl font-extrabold mb-6 text-base-content text-center">
              EAA Oshkosh 2024 Approach Guide
            </h1>
            <Timeline
              currentStage={currentStage}
              onStageClick={handleStageClick}
            />
            <div className="card bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <h3 className="card-title text-center">
                  Standing Instructions
                </h3>
                <div className="flex flex-col mt-4 ml-4">
                  <ul className="list-square text-base-content">
                    {standingInstructions.map((instruction, index) => (
                      <li key={index} className="mb-2">
                        <ReactMarkdown>{instruction}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-3">
        <div className="mb-4">
          <div className="alert alert-warning">
            <div className="flex">
              <div className="py-1">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="fill-current h-8 w-8 text-base-100 mr-4"
                />
              </div>

              <div>
                <p className="font-bold">Important</p>
                <p className="text-sm">
                  <ReactMarkdown>
                    New 2024 NOTAM released! Familiarise yourself with the new
                    procedures for this year! -- Click here to download: **[Full
                    Digital
                    Copy](https://www.eaa.org/~/media/B6C8744689624E2C9A424352E42C3EA7.ashx)**
                  </ReactMarkdown>{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
        <CurrentSituationBox notamList={notamList} />
        <ApproachStage
          stage={stages[currentStage]}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>
    </div>
  );
};

export default FiskApproachApp;
