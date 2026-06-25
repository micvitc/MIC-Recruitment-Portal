"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeProvider } from "next-themes";
import Particles from "@/components/magicui/particles";
import ThemeToggle from "./ThemeToggle";
import Image from "next/image";

const ThankYouPage = () => {
    const { theme } = useTheme();
    const [color, setColor] = useState("#ffffff");

    useEffect(() => {
        setColor(theme === "dark" ? "#ffffff" : "#000000");
    }, [theme]);

    return (
        <ThemeProvider>
            <div className="min-h-screen w-full overflow-hidden">
                {/* Navbar - Minimal Version without links */}
                <div className="sticky top-0 z-50 backdrop-blur-sm border flex justify-between items-center p-5">
                    <div className="flex justify-between items-center gap-2">
                        <Image
                            src="/assets/images/mic-logo.jpg"
                            alt="mic-logo"
                            height={40}
                            width={40}
                            className="rounded-full"
                        />
                        <p className="tracking-tight hidden sm:block">
                            Microsoft Innovations Club
                        </p>
                        <p className="tracking-wide visible sm:hidden">MIC</p>
                    </div>
                    <div>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
                    <Particles
                        className="absolute inset-0"
                        quantity={150}
                        ease={80}
                        color={color}
                        refresh
                    />
                    
                    <div className="relative z-10 text-center px-4 max-w-2xl flex flex-col items-center justify-center">
                        {/* Recruitment Portal Heading */}
                        <h2 className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl sm:text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10 mb-16">
                            Recruitment Portal
                        </h2>

                        {/* Main Heading */}
                        <h1 className="text-4xl md:text-6xl font-bold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Thank You!
                        </h1>

                        {/* Message */}
                        <div className="space-y-6">
                            <p className="text-lg md:text-2xl text-foreground/80 leading-relaxed font-light">
                                The recruitment drive for <span className="font-semibold">MIC 25-26</span> has concluded successfully with over <span className="font-semibold">1200+ applicants</span>.
                            </p>

                            <p className="text-lg md:text-2xl text-foreground/80 font-light">
                                Thank you for being a part of this journey
                            </p>
                        </div>

                        {/* Decorative element */}
                        <div className="mt-12 flex justify-center gap-2">
                            <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
                            <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full opacity-50"></div>
                            <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full opacity-25"></div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default ThankYouPage;
