"use client";

import React, { useEffect } from "react";

interface PreferenceConfirmationModalProps {
  roleTitle: string;
  firstPreference?: string;
  secondPreference?: string;
  onConfirm: (preference: 1 | 2) => void;
  onCancel: () => void;
}

export default function PreferenceConfirmationModal({
  roleTitle,
  firstPreference,
  secondPreference,
  onConfirm,
  onCancel,
}: PreferenceConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const hasFirstPref = !!firstPreference;
  const targetPref: 1 | 2 = hasFirstPref ? 2 : 1;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 select-none animate-fade-in font-press-start"
      onClick={onCancel}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-[450px] bg-[#FFE4D6] border-4 border-black p-6 relative flex flex-col items-center gap-4 text-center rounded-[10px]"
        style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Corner Pixels inside outer container */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-black" />

        {/* Modal Header */}
        <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[11px] uppercase tracking-widest font-bold -mt-10 mb-2 shadow-[2px_2px_0px_#000]">
          CONFIRM APPLICATION
        </div>

        {/* Modal Body */}
        <div className="my-2">
          <p className="text-[10px] text-black font-bold uppercase tracking-wider leading-relaxed my-2">
            Do you want to apply for
          </p>
          <p className="text-[12px] text-[#A93710] font-bold uppercase tracking-wider leading-relaxed my-1">
            {roleTitle}
          </p>
          <p className="text-[10px] text-black font-bold uppercase tracking-wider leading-relaxed my-2">
            as your <span className="underline">{targetPref === 1 ? "1st" : "2nd"} Preference</span>?
          </p>
        </div>

        {/* Selection Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="flex-1 bg-[#888888] hover:bg-[#999999] text-white border-4 border-black py-2.5 px-6 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            Cancel
          </button>

          {/* Yes/Confirm Button */}
          <button
            onClick={() => onConfirm(targetPref)}
            className="flex-1 bg-[#7CA922] hover:bg-[#8CB932] text-black border-4 border-black py-2.5 px-6 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
