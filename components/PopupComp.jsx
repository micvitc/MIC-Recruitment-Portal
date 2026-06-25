"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PiArrowRightThin } from "react-icons/pi";

const PopupComp = ({ isOpen, onClose, PopupData }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-fit h-fit">
                <DialogHeader>
                    <DialogTitle>{PopupData?.header}</DialogTitle>
                    <DialogDescription>
                        {PopupData?.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center items-start gap-1">
                    {PopupData?.message.map((message, index) => (
                        <p
                            key={index}
                            className="flex gap-1 items-center justify-center"
                        >
                            <PiArrowRightThin />
                            {message}
                        </p>
                    ))}
                </div>
                <Button
                    className="mt-1"
                    onClick={() => {
                        onClose(); // Close the dialog when clicked
                    }}
                >
                    Got it
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default PopupComp;
