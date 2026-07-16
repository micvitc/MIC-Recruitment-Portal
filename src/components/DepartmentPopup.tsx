"use client";

import React, { useEffect } from "react";

export interface DepartmentData {
  title: string;
  role: string;
  iconType: "uiux" | "dev" | "cc" | "aiml" | "cyber" | "design" | "mgmt" | "ep" | "media";
  tagline: string;
  subtitle: string;
  description: string;
  skills: string;
  desc?: string;
}

// Map from role name (used in existing data) to new dept slug
const ROLE_TO_SLUG: Record<string, string> = {
  Development: "development",
  "Competitive Coding": "competitive-coding",
  "UI/UX": "ui-ux",
  "AI/ML": "ai-ml",
  "Cyber Security": "cyber-security",
  Design: "design",
  Management: "management",
  Entrepreneurship: "entrepreneurship",
  "Content & Media": "content-media",
};

interface DepartmentPopupProps {
  department: DepartmentData | null;
  onClose: () => void;
  onApply: (role: string) => void;
}

export default function DepartmentPopup({
  department,
  onClose,
  onApply,
}: DepartmentPopupProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!department) return null;

  // Custom retro pixel art / SVG icons for each quest
  const renderDepartmentIcon = (type: DepartmentData["iconType"]) => {
    switch (type) {
      case "uiux":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <rect x="4" y="4" width="24" height="24" fill="#FCEE0A" stroke="#000" strokeWidth="2" />
            <path d="M10 22 L14 14 L22 10 L18 18 Z" fill="#E83818" stroke="#000" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="2" fill="#FFFFFF" />
          </svg>
        );
      case "dev":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <rect x="3" y="6" width="26" height="18" fill="#44AAFF" stroke="#000" strokeWidth="2" />
            <rect x="6" y="9" width="20" height="12" fill="#001122" />
            <path d="M9 13 L12 15 L9 17" fill="none" stroke="#72F418" strokeWidth="2" />
            <rect x="14" y="16" width="5" height="2" fill="#72F418" />
            <rect x="11" y="24" width="10" height="3" fill="#888888" stroke="#000" strokeWidth="2" />
          </svg>
        );
      case "cc":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <path d="M16 3 L22 13 L18 13 L21 27 L11 15 L15 15 Z" fill="#FCEE0A" stroke="#000" strokeWidth="2" />
          </svg>
        );
      case "aiml":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <rect x="7" y="8" width="18" height="16" fill="#F85838" stroke="#000" strokeWidth="2" />
            <rect x="10" y="12" width="4" height="4" fill="#72F418" />
            <rect x="18" y="12" width="4" height="4" fill="#72F418" />
            <rect x="11" y="19" width="10" height="2" fill="#FFFFFF" />
            <rect x="15" y="4" width="2" height="4" fill="#888" />
            <circle cx="16" cy="3" r="2" fill="#FCEE0A" />
          </svg>
        );
      case "cyber":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <path d="M16 4 L26 8 V16 C26 23 16 28 16 28 C16 28 6 23 6 16 V8 Z" fill="#3FA70E" stroke="#000" strokeWidth="2" />
            <path d="M13 14 L16 17 L21 12" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          </svg>
        );
      case "design":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <circle cx="16" cy="16" r="12" fill="#FF88DD" stroke="#000" strokeWidth="2" />
            <circle cx="12" cy="12" r="2.5" fill="#FCEE0A" />
            <circle cx="20" cy="12" r="2.5" fill="#44AAFF" />
            <circle cx="12" cy="20" r="2.5" fill="#72F418" />
            <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
          </svg>
        );
      case "mgmt":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <rect x="5" y="10" width="22" height="16" fill="#885522" stroke="#000" strokeWidth="2" />
            <rect x="12" y="6" width="8" height="4" fill="#CC8844" stroke="#000" strokeWidth="2" />
            <rect x="14" y="14" width="4" height="8" fill="#FCEE0A" />
          </svg>
        );
      case "ep":
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <path d="M16 4 C22 4 24 10 24 16 L20 22 L12 22 L8 16 C8 10 10 4 16 4 Z" fill="#EE3333" stroke="#000" strokeWidth="2" />
            <circle cx="16" cy="12" r="3" fill="#44AAFF" stroke="#000" strokeWidth="1" />
            <path d="M13 22 L13 26 L16 29 L19 26 L19 22 Z" fill="#FCEE0A" stroke="#000" strokeWidth="1.5" />
          </svg>
        );
      case "media":
      default:
        return (
          <svg width="40" height="40" viewBox="0 0 32 32" className="pixelated">
            <rect x="4" y="8" width="24" height="16" fill="#A444FF" stroke="#000" strokeWidth="2" />
            <path d="M13 12 L21 16 L13 20 Z" fill="#FFFFFF" stroke="#000" strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-[850px] bg-[#FFE4D6] border-4 border-black rounded-[10px] p-3 sm:p-4 relative flex flex-col my-auto retro-shadow font-press-start"
        style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.4)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Corner Pixels inside outer container */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-black" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-black" />

        {/* Modal Close Button (Close_icon.svg) */}
        <button
          onClick={onClose}
          className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100 flex items-center justify-center select-none z-30"
          title="Close Popup"
        >
          <img
            src="/Close_icon.svg"
            alt="Close"
            className="w-[38px] h-[36px] sm:w-[46px] sm:h-[44px] pixelated select-none pointer-events-none"
          />
        </button>

        {/* Header Bar */}
        <div className="w-full bg-[#C85A28] border-4 border-black py-2.5 sm:py-3 px-4 rounded-[6px] mb-3 sm:mb-4 flex items-center justify-center relative">
          <h2 className="text-black font-bold text-[12px] sm:text-[15px] tracking-wider uppercase text-center drop-shadow-[1px_1px_0px_rgba(255,255,255,0.25)]">
            {department.title}
          </h2>
          {/* Inner Header Decorative Pixels */}
          <div className="absolute left-2 top-2 w-1 h-1 bg-black" />
          <div className="absolute left-2 bottom-2 w-1 h-1 bg-black" />
          <div className="absolute right-2 top-2 w-1 h-1 bg-black" />
          <div className="absolute right-2 bottom-2 w-1 h-1 bg-black" />
        </div>

        {/* Top Banner Split Box */}
        <div className="w-full flex flex-col sm:flex-row border-4 border-black bg-[#DDA02A]">
          {/* Left Icon Square */}
          <div className="w-full sm:w-[150px] h-[90px] sm:h-[120px] bg-[#DDA02A] border-b-4 sm:border-b-0 sm:border-r-4 border-black flex items-center justify-center shrink-0 p-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black border-2 border-black flex items-center justify-center shadow-[inset_0_0_10px_rgba(255,255,255,0.15)]">
              {renderDepartmentIcon(department.iconType)}
            </div>
          </div>
          {/* Right Tagline Box */}
          <div className="flex-1 p-3 sm:p-5 bg-[#DDA02A] flex items-center justify-center text-center">
            <p className="text-[9px] sm:text-[11px] text-black font-bold tracking-wide leading-relaxed uppercase">
              {department.tagline}
            </p>
          </div>
        </div>

        {/* Main White Body Box */}
        <div className="w-full mt-3 sm:mt-4 bg-white border-4 border-black p-4 sm:p-6 flex flex-col justify-between">
          {/* Top Section */}
          <div>
            <h3 className="text-[10px] sm:text-[12px] font-bold text-black uppercase tracking-wider">
              DEPARTMENT MAP
            </h3>
            <div className="w-full h-[3px] sm:h-1 bg-black my-3 sm:my-3.5" />

            {/* Orange Description Box */}
            <div
              className="bg-[#F3A331] border-2 sm:border-4 border-black p-4 sm:p-5 my-2 flex flex-col justify-between relative"
              style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.15)" }}
            >
              <div>
                <p className="text-[9px] sm:text-[10px] text-black font-bold tracking-wide uppercase leading-relaxed mb-3 sm:mb-4">
                  {department.subtitle}
                </p>
                <p className="text-[10px] sm:text-[11px] text-black font-bold tracking-wide uppercase leading-relaxed my-2">
                  {department.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/25">
                <p className="text-[8px] sm:text-[9px] text-black/90 font-bold uppercase tracking-widest">
                  {department.skills}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section CTA */}
          <div className="mt-3 sm:mt-4">
            <div className="w-full h-[3px] sm:h-1 bg-black mb-3 sm:mb-4" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[9px] sm:text-[10px] text-black font-bold uppercase tracking-wide text-center sm:text-left">
                WANNA JOIN US IN COMPLETING THIS QUEST?
              </p>
              <button
                onClick={() => {
                  const slug = ROLE_TO_SLUG[department.role] ?? department.role.toLowerCase().replace(/\s+/g, "-");
                  onApply(slug);
                }}
                className="w-full sm:w-auto bg-[#E29A2B] hover:bg-[#F0AD3D] active:scale-95 border-2 sm:border-4 border-black py-2.5 px-4 sm:py-3 sm:px-6 text-[9px] sm:text-[10px] font-bold text-black uppercase tracking-wider cursor-pointer whitespace-nowrap transition-all"
                style={{ boxShadow: "3px 3px 0px 0px #000" }}
              >
                APPLY FOR THE QUEST
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
