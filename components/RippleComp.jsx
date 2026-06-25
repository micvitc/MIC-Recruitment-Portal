// React import
import React from "react";
// MagicUI import
import Ripple from "@/components/magicui/ripple";

// Ripple Component
const RippleComp = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <p className="z-10 whitespace-pre-wrap text-center text-2xl font-medium tracking-tighter text-white">
        Loading
      </p>
      <Ripple />
    </div>
  );
};

export default RippleComp;
