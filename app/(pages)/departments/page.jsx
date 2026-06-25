"use client";
// React imports
import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AllDepartments from "@/components/AllDepartments";
import PopupComp from "@/components/PopupComp";

const DepartmentsListPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem("hasSeenDepartmentsPopup");

        if(!hasSeenPopup) {
            setIsDialogOpen(true);
            localStorage.setItem("hasSeenDepartmentsPopup", "true");
        }
    }, []);

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const PopupData = {
        header: "Preference Notice",
        description:
            "This information is crucial for applying for departments at Microsoft Innovations Club.",
        message: [
            "The first department enrolled will be considered as your first preference.",
            "You can at most enroll for two departments.",
        ],
    };

    return (
        <div>
            <NavBar />
            <span className="hidden">
                {isDialogOpen && (
                    <PopupComp
                        isOpen={isDialogOpen}
                        PopupData={PopupData}
                        onClose={handleDialogClose}
                    />
                )}
            </span>
            <AllDepartments />
            <Footer />
        </div>
    );
};

export default DepartmentsListPage;
