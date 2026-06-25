"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "react-icons/lu";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "access_denied":
        return "Access was denied. Please try signing in again.";
      case "invalid_request":
        return "Invalid request. Please try again.";
      case "server_error":
        return "Server error occurred. Please try again later.";
      case "temporarily_unavailable":
        return "Service temporarily unavailable. Please try again later.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-[#1a1a1a] border-[#333] text-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-gray-400">
              {getErrorMessage(error)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                onClick={() => router.push("/")}
                className="w-full"
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
            
            {error && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Error Code: {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 