"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignInCard() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign-in...");
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/"
      });
      console.log("Sign-in result:", result);
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md">
  <CardHeader className="text-center">
    <CardTitle className="text-2xl font-bold">
      Welcome to MIC Recruitment Portal
    </CardTitle>
    <CardDescription>
      Sign in to access your account
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-sm text-muted-foreground text-center">
      Kindly log in with your official VIT email ID.
      <br />
      Other email addresses will not be permitted.
    </p>

    <Button
      onClick={handleGoogleSignIn}
      variant="secondary"
      className="w-full"
      size="lg"
    >
      <FaGoogle className="mr-2 h-5 w-5" />
      Continue with Google
    </Button>

    <Button
      onClick={() => router.push("/")}
      variant="outline"
      className="w-full"
    >
      Back to Home
    </Button>

    <p className="text-xs text-muted-foreground text-center">
      By continuing, you agree to our terms of service and privacy policy
    </p>
  </CardContent>
</Card>
  );
}