// React import
import React from "react";
import Link from "next/link";
// ShadCN import
import { Separator } from "@/components/ui/separator";
// Icons import
import { LuMapPin } from "react-icons/lu";
import { FaInstagram } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa6";
import { BiLogoGmail } from "react-icons/bi";

// Constants import
import { LINKS } from "@/constants";

const Footer = () => {
    const iconSize = 20;
    return (
        <div>
            <Separator />
            <div className="flex justify-center items-center gap-5 p-5">
                {/* Location Icon */}
                <Link target="_blank" href={LINKS.maps}>
                    <LuMapPin
                        size={iconSize}
                        className="text-gray-500 hover:text-gray-600 cursor-pointer"
                    />
                </Link>
                {/* Instagram Icon */}
                <Link target="_blank" href={LINKS.instagram}>
                    <FaInstagram
                        size={iconSize}
                        className="text-gray-500 hover:text-gray-600 cursor-pointer"
                    />
                </Link>
                {/* Gmail Icon */}
                <Link target="_blank" href={LINKS.gmail}>
                    <BiLogoGmail
                        size={iconSize}
                        className="text-gray-500 hover:text-gray-600 cursor-pointer"
                    />
                </Link>
            </div>
        </div>
    );
};

export default Footer;
