"use client";
// React import
import React from "react";
import { useRouter } from "next/navigation";
// Constant import
import { reviews } from "@/constants/index";

// Component imports
import NavBar from "@/components/NavBar";

import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const JoinDepartmentPage = ({ params }) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const router = useRouter();

    // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();
  
  const user = session?.user;
  const isSignedIn = !!user;

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <main className="bg-[#121212] min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  
    const department = reviews.find((dept) => {
        return dept.id == params.joinId;
    });

    if (!department) {
        if (!params.joinId.startsWith("clerk_")) {
            toast.error("No Department Found");
        }
        router.push("/");
    } else {
        return (
            <div>
                <NavBar />
                <div>
                    <FormComp dept={department} />
                </div>
                <Footer />
            </div>
        );
    }
};

export default JoinDepartmentPage;
