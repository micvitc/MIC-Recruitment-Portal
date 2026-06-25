"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import UserButton from "./UserButton";
import { Button } from "./ui/button";
import { FaUser } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import PopupComp from "./PopupComp";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const NavBar = () => {
    const imgSize = 40;
    const router = useRouter();

    const { data: session, isPending, error } = authClient.useSession();

    const user = session?.user;
    const isSignedIn = !!user;
    const isAdmin = user?.role === "admin";

    return (
        <div className="sticky top-0 z-50 backdrop-blur-sm border flex justify-between items-center p-5">
            <Link
                href={`/`}
                className="flex justify-between items-center gap-2"
            >
                <Image
                    src="/assets/images/mic-logo.jpg"
                    alt="mic-logo"
                    height={imgSize}
                    width={imgSize}
                    className="rounded-full"
                />
                <p className="tracking-tight hidden sm:block">
                    Microsoft Innovations Club
                </p>
                <p className="tracking-wide visible sm:hidden">MIC</p>
            </Link>
            <div className="flex gap-3">
                <PopupComp />
                <ThemeToggle />
                {isSignedIn && isAdmin && (
                    <Link href={`/admin/`}>
                        <Button
                            className="rounded-full"
                            variant="outline"
                            size="icon"
                        >
                            <MdAdminPanelSettings />
                        </Button>
                    </Link>
                )}
                {!isSignedIn ? (
                    <Button
                        onClick={() => router.push("/auth/signin")}
                        className="rounded-full"
                        variant="outline"
                        size="icon"
                    >
                        <FaUser />
                    </Button>
                ) : (
                    <UserButton
                        user={user}
                        onSignOut={() => {
                            setUser(null);
                            setIsSignedIn(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default NavBar;
