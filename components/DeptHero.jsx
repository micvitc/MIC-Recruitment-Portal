"use client";
// React import
import React from "react";

// MagicUI import
import { cn } from "@/lib/utils";
import DotPattern from "@/components/magicui/dot-pattern";
import { Switch } from "@/components/ui/switch";
const DeptHero = ({ dept, setPhotoQs,photoQs }) => {
    return (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-none border border-t-0 bg-background p-20">
            <div className="flex flex-col gap-2 justify-center items-center">
                <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
                    {!photoQs ? dept.name : "Video Editing"}
                </p>
                <p>{dept.body}</p>
                {dept.name === "Photography" && (
                    <div className="flex mt-3 items-center justify-start w-fit gap-3">
                        <Switch
                            checked={photoQs}
                            onCheckedChange={() => setPhotoQs(!photoQs)}
                        />
                        <p>Switch to Video Editing?</p>
                    </div>
                )}
            </div>
            <DotPattern
                width={20}
                height={20}
                cx={1}
                cy={1}
                cr={1}
                className={cn(
                    "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
                )}
            />
        </div>
    );
};

export default DeptHero;
