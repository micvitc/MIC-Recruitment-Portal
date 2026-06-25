"use client";

// Grid Component
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";

import DeptHero from "./DeptHero";

// Icons
import { PiFileLockThin } from "react-icons/pi";
import { PiBrainThin } from "react-icons/pi";
import { PiCodeThin } from "react-icons/pi";
import { PiAndroidLogoThin } from "react-icons/pi";
import { PiNoteThin } from "react-icons/pi";
import { PiSuitcaseSimpleThin } from "react-icons/pi";
import { PiPolygonThin } from "react-icons/pi";
import { PiPaintBrushBroadThin } from "react-icons/pi";
import { PiCameraThin } from "react-icons/pi";
import { PiMoneyWavyThin } from "react-icons/pi";
import { PiCodeSimpleThin } from "react-icons/pi";
// Constant Import
import { reviews } from "../constants/index";

let features = [
    {
        Icon: PiBrainThin,
        name: "Development",
        description: "We automatically save your files as you type.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
        Icon: PiCodeSimpleThin,
        name: "Full text search",
        description: "Search through all your files in one place.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: PiAndroidLogoThin,
        name: "Multilingual",
        description: "Supports 100+ languages and counting.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: PiCodeThin,
        name: "Calendar",
        description: "Use the calendar to filter your files by date.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
        Icon: PiFileLockThin,
        name: "Notifications",
        description:
            "Get notified when someone shares a file or mentions you in a comment.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
    {
        Icon: PiPaintBrushBroadThin,
        name: "Save your files",
        description: "We automatically save your files as you type.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
        Icon: PiSuitcaseSimpleThin,
        name: "Full text search",
        description: "Search through all your files in one place.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: PiPolygonThin,
        name: "Multilingual",
        description: "Supports 100+ languages and counting.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: PiNoteThin,
        name: "Calendar",
        description: "Use the calendar to filter your files by date.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
        Icon: PiCameraThin,
        name: "Notifications",
        description:
            "Get notified when someone shares a file or mentions you in a comment.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
    {
        Icon: PiMoneyWavyThin,
        name: "Notifications",
        description:
            "Get notified when someone shares a file or mentions you in a comment.",
        href: "/",
        cta: "Learn more",
        background: <img className="absolute -right-20 -top-20 opacity-60" />,
        className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    },
];

let used = 0;

reviews.forEach((r, index) => {
    let f = features[index];
        f.name = r.name;
        f.description = r.body;
        f.href = r.id;
        f.cta = "Join Department";
});

export default function BentoGridComp() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DeptHero dept={{ name: "Technical Departments" }} />
                <div className="flex flex-col gap-4 justify-center items-between p-5">
                    {features.slice(0, 5).map((feature) => (
                        <div key={feature.name}>
                            {feature.name !== "null" && (
                                <BentoCard key={feature.name} {...feature} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <DeptHero dept={{ name: "Non Technical Departments" }} />
            <div className="p-5 flex flex-col gap-4">
                <BentoGrid className="lg:grid-rows-3">
                    {features.slice(5, 10).map((feature) => (
                        <BentoCard key={feature.name} {...feature} />
                    ))}
                </BentoGrid>
            </div>
        </div>
    );
}
