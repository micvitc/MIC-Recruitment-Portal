import React from "react";
import { Check, Lock, Swords, Loader2, X } from "lucide-react";

interface StageProgressHeaderProps {
  currentStage: number;
  stages: { stage: number; result: "pending" | "passed" | "failed" }[];
  status: "active" | "passed" | "rejected" | "pending";
}

type CircleState = "completed" | "active" | "under_review" | "failed" | "locked";

export default function StageProgressHeader({
  currentStage,
  stages,
  status,
}: StageProgressHeaderProps) {
  const formSub = stages.find((s) => s.stage === 2);
  const taskSub = stages.find((s) => s.stage === 3);
  const interviewSub = stages.find((s) => s.stage === 4);

  // 1. Form Circle State
  let formState: CircleState = "active";
  if (status === "rejected" && (formSub?.result === "failed" || currentStage === 2)) {
    formState = "failed";
  } else if (currentStage >= 3 || status === "passed" || formSub?.result === "passed") {
    formState = "completed";
  } else if (formSub?.result === "pending") {
    formState = "under_review";
  }

  // 2. Task Circle State
  let taskState: CircleState = "locked";
  if (currentStage >= 3) {
    if (status === "rejected" && (taskSub?.result === "failed" || currentStage === 3)) {
      taskState = "failed";
    } else if (currentStage >= 4 || status === "passed" || taskSub?.result === "passed") {
      taskState = "completed";
    } else if (taskSub?.result === "pending") {
      taskState = "under_review";
    } else {
      taskState = "active";
    }
  }

  // 3. Interview Circle State
  let interviewState: CircleState = "locked";
  if (currentStage >= 4) {
    if (status === "passed" || interviewSub?.result === "passed") {
      interviewState = "completed";
    } else if (status === "rejected" || interviewSub?.result === "failed") {
      interviewState = "failed";
    } else {
      interviewState = "active"; // active booking or scheduled
    }
  }

  const levels = [
    { id: 1, label: "Form", title: "1. Form Filling", state: formState },
    { id: 2, label: "Task", title: "2. Task Phase", state: taskState },
    { id: 3, label: "Interview", title: "3. Interview", state: interviewState },
  ];

  const getStyle = (state: CircleState) => {
    switch (state) {
      case "completed":
        return {
          bg: "bg-[#52AE26]",
          text: "text-white",
          border: "border-[#3FA70E]",
          label: "WON",
          icon: <Check className="w-5 h-5 stroke-[3px]" />,
          shadow: "shadow-[0_4px_0px_#276B0B]",
        };
      case "active":
        return {
          bg: "bg-[#F3A022]",
          text: "text-black",
          border: "border-[#C87610]",
          label: "CONQUERING",
          icon: <Swords className="w-5 h-5" />,
          shadow: "shadow-[0_4px_0px_#915407]",
        };
      case "under_review":
        return {
          bg: "bg-[#00BCD4]",
          text: "text-white",
          border: "border-[#00838F]",
          label: "REVIEW",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          shadow: "shadow-[0_4px_0px_#006064]",
        };
      case "failed":
        return {
          bg: "bg-[#D32F2F]",
          text: "text-white",
          border: "border-[#9A0F0F]",
          label: "FAILED",
          icon: <X className="w-5 h-5 stroke-[3px]" />,
          shadow: "shadow-[0_4px_0px_#5D0A0A]",
        };
      case "locked":
      default:
        return {
          bg: "bg-[#9E9E9E]",
          text: "text-[#BDBDBD]",
          border: "border-[#757575]",
          label: "LOCKED",
          icon: <Lock className="w-4 h-4" />,
          shadow: "shadow-[0_4px_0px_#424242]",
        };
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-4 px-2 font-press-start">
      {/* Connector line and circles */}
      <div className="relative w-full max-w-[500px] flex items-center justify-between z-20">
        
        {/* Horizontal Connector bar */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#A05522] border-t-2 border-b-2 border-black -translate-y-1/2 z-0" />
        
        {levels.map((lvl) => {
          const style = getStyle(lvl.state);
          return (
            <div key={lvl.id} className="flex flex-col items-center relative z-10">
              {/* Top Text State label */}
              <div 
                className={`absolute bottom-[105%] px-1.5 py-0.5 rounded border-2 border-black text-[6px] tracking-wider font-extrabold uppercase bg-white text-black shadow-[1px_1px_0px_#000]`}
              >
                {style.label}
              </div>

              {/* Status Circle */}
              <div
                title={lvl.title}
                className={`w-12 h-12 rounded-full border-4 border-black flex items-center justify-center transition-all ${style.bg} ${style.text} ${style.shadow} active:translate-y-1 active:shadow-none`}
              >
                {style.icon}
              </div>

              {/* Level indicator below circle */}
              <span className="text-[8px] font-bold text-black uppercase tracking-wider mt-2.5 drop-shadow-[1px_1px_0px_rgba(255,255,255,0.7)] bg-[#FFE4D6] px-1 border border-black/20 rounded">
                {lvl.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
