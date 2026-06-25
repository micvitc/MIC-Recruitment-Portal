"use client";

import React, { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loader } from "lucide-react";
import { QuestionnaireData } from "@/constants";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import DeptHero from "@/components/DeptHero";
import { toast } from "sonner";

const FormComp = ({ dept }) => {
    const { data: session, isPending, error } = authClient.useSession();
    
    const user = session?.user;
    const isSignedIn = !!user;
    const isLoaded = !isPending;
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [photoQs, setPhotoQs] = useState(false);

    useEffect(() => {
        if (user) {
          const userEmail = user.email;
        }
      }, [user]);

      // Function to check application count
  async function checkApplicationCount(userEmail) {
    const checkResponse = await fetch(
      `/api/check-applications?email=${userEmail}`
    );
    const { count } = await checkResponse.json();
    console.log(count);

    if (count >= 2) {
      setErrorMessage(
        "Remember that you can only submit upto 2 unique applications"
      );
      setIsSubmitting(false);
      return;
    }
  }

    let questionData = QuestionnaireData.filter(
        (qd) => qd.department === dept.name
    )[0].questions;

    const schemaObj = {
        Name: z.string(),
        RegistrationNumber: z.string(),
        Email: z.string(),
        Phone: z
            .string()
            .min(1, "Phone is required")
            .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
        Reason: z.string().min(1, "Reason is required"),
        // Projects: z.string().min(1, "Projects is required"),
    };

    questionData.forEach((qd) => {
        schemaObj[qd] = z.string().optional();
    });

    const formSchema = z.object(schemaObj);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Name: "",
            RegistrationNumber: "",
            Email: "",
            Phone: "",
            Reason: "",
            // Projects: "",
        },
    });

    if (dept.name === "Photography") {
        if (!photoQs) {
            questionData = questionData.photography;
        } else {
            questionData = questionData.videography;
        }
    }

    useEffect(() => {
        if (isLoaded && user) {
            // const fullName = user.fullName;
            // const nameLength = fullName.split(" ").length;
            // const regNo = fullName.split(" ")[nameLength - 1];
            // const name = fullName.split(" ").slice(0, 2).join(" ");
            // const email = user.primaryEmailAddress.emailAddress;
            const userEmail = user.email;

            form.setValue("Name", "");
            // form.setValue("RegistrationNumber", "");
            form.setValue("Email", userEmail);

            async function checkSubmission() {
                const res = await fetch(
                    `/api/check-department-submission?email=${userEmail}&department=${dept.name}`
                );
                const data = await res.json();
                setAlreadySubmitted(data.submitted);
                setLoading(false);
            }

            checkSubmission();
        }
    }, [isLoaded, user, dept.name, form]);

    if (!isLoaded) {
        return (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader size={40} className="animate-spin text-white mx-auto mb-4" />
              <p className="text-white">Loading...</p>
            </div>
          </div>
        );
      }

      if (!isSignedIn) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] m-10">
              <div className="w-full max-w-md rounded-lg border p-8 shadow bg-card text-card-foreground">
                <div className="text-center">
                  <p className="text-2xl font-semibold mb-2">
                    Sign In Required
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Kindly sign in using your official VIT email address to access the application form.
                  </p>
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    variant="outline"
                    className="w-full sm:w-1/2"
                  >
                    Continue to Sign In
                  </Button>
                </div>
              </div>
            </div>
          );
      }

      const userEmail = user?.email;
      if (userEmail && !userEmail.endsWith("@vitstudent.ac.in")) {
        return (
          <div className="flex justify-center items-center min-h-[60vh] m-10">
            <div className="text-center">
              <p className="text-2xl font-semibold text-white mb-4">
                Access Denied
              </p>
              <p className="text-lg text-gray-300 mb-4">
                Please log in using your VIT email address.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go Home
              </Button>
            </div>
          </div>
        );
      }

const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
        const email = values.Email;
        console.log("Email is: ", email);
        const checkResponse = await fetch(
            `/api/check-applications?email=${email}`
        );
        const { count } = await checkResponse.json();

        if (count >= 2) {
            setErrorMessage(
                "You can only submit applications to two departments."
            );
            setIsSubmitting(false);
            return;
        }

        const formData = {
            ...values,
            Department: !photoQs ? dept.name : "Video Editing",
            Questions: questionData.reduce((acc, qd) => {
                acc[qd] = values[qd];
                return acc;
            }, {}),
        };

        console.log({ "form data : ": formData });

        const response = await fetch("/api/submit-form", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            toast.success(
                `You have successfully applied to ${dept.name} department.`
            );
            router.push("/");
        } else {
            const data = await response.json();
            setErrorMessage(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Form submission error:", error);
        setErrorMessage("An error occurred while submitting the form.");
    } finally {
        setIsSubmitting(false);
    }
};

    if (alreadySubmitted) {
        return (
            <div className="flex justify-center items-center m-10">
                <p>Your response has been recorded.</p>
            </div>
        );
    }

    if (!isFormOpen) {
        return (
            <div className="flex justify-center items-center m-10">
                <p>Recruitment has now been terminated.</p>
            </div>
        );
    }

    return (
        <div>
            <DeptHero dept={dept} photoQs={photoQs} setPhotoQs={setPhotoQs} />
            <div className={"flex flex-col justify-center items-center m-10"}>
                <Form {...form}>
                    <form
                        className="flex flex-col gap-5 min-w-[30%] max-w-[50vh]"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="Name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your name"
                                            // onKeyDown={handleKeyDown}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-lightRed" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="RegistrationNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">
                                        Registration Number
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your registration number"
                                            // onKeyDown={handleKeyDown}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-lightRed" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your college email"
                                            // onKeyDown={handleKeyDown}
                                            disabled
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-lightRed" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">
                                        Phone Number
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your phone number"
                                            // onKeyDown={handleKeyDown}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-lightRed" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">
                                        Why do you want to join the{" "}
                                        {dept.name === "Photography"
                                            ? "this"
                                            : dept.name}{" "}
                                        department?
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your reason"
                                            // onKeyDown={handleKeyDown}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-lightRed" />
                                </FormItem>
                            )}
                        />
{/*                         <FormField
                            control={form.control}
                            name="Projects"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 dark:text-gray-300">
                                        What projects have you worked on?
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter project / github link"
                                            // onKeyDown={handleKeyDown}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500 dark:text-lightRed" />
                                </FormItem>
                            )}
                        /> */}
                        {questionData.map((qd) => (
                            <FormField
                                key={qd}
                                control={form.control}
                                name={qd}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 dark:text-gray-300">
                                            {qd}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter your response"
                                                // onKeyDown={handleKeyDown}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 dark:text-lightRed" />
                                    </FormItem>
                                )}
                            />
                        ))}

                        <Button className="w-full" type="submit">
                            {isSubmitting ? (
                                <>
                                    <Loader
                                        size={20}
                                        className="animate-spin mr-1"
                                    />
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                        {errorMessage && (
                            <p className="text-red-500 dark:text-lightRed mt-2">
                                {errorMessage}
                            </p>
                        )}
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default FormComp;
