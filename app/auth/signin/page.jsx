"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { SignInCard } from "@/components/SignInCard";

export default function SignInPage() {
  const router = useRouter();

  // Check if user is already authenticated
  const { data: session, isPending } = authClient.useSession();

  // Redirect if already signed in
  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/");
    }
  }, [session, isPending, router]);

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the sign-in form if already authenticated
  if (session?.user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center text-white">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }
  
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignInCard/>
      </div>
    </div>
  );
} 