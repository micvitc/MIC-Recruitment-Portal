"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import { Separator } from "./ui/separator";
import { Button } from "@/components/ui/button";

export default function CarouselComp({
    dataList,
    handleShortlist,
    shortlistStatus,
}) {
    return (
        <Carousel className="w-[75vw]">
            <CarouselContent>
                {dataList.map((data, index) => (
                    <CarouselItem key={data._id}>
                        <div className="p-1">
                            <Card className="h-[45vh] border-none shadow-none overflow-y-scroll">
                                <CardContent className="flex flex-col items-center justify-center p-3">
                                    <span className="flex flex-col items-center justify-center mb-3 gap-1 font-medium">
                                        {data.Name}
                                        <span className="font-light text-sm opacity-[50%]">
                                            {data.Department}
                                        </span>
                                    </span>
                                    <div className="w-full flex flex-col gap-5">
                                        {Array.from(data.Questions).map(
                                            ([question, answer], qIndex) => (
                                                <div
                                                    key={qIndex}
                                                    className="border p-3 border-sm rounded-md"
                                                >
                                                    <h1 className="mb-1 font-light">
                                                        {qIndex + 1}. {question}{" "}
                                                    </h1>
                                                    <Separator />
                                                    <p className="mt-1 font-normal opacity-[70%]">
                                                        {answer !== "" || answer
                                                            ? answer
                                                            : "Not Answered"}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => handleShortlist(index)}
                                        className={`text-white rounded-md mt-4 ${
                                            shortlistStatus[index]
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-green-600 hover:bg-green-700"
                                        }`}
                                    >
                                        {shortlistStatus[index]
                                            ? "Unshortlist Applicant"
                                            : "Shortlist Applicant"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
}
