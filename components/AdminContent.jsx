"use client";
import React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import DataTable from "./DataTable";

const AdminContent = ({ applicants }) => {

  const { data: session, isPending, error } = authClient.useSession();
  
  const user = session?.user;
  const isSignedIn = !!user;
  const isLoaded = !isPending;

    if (!isLoaded) {
        return null;
    }

    const isAdmin = user?.role === "admin";

    if (!isSignedIn) {
        return (
            <div className="flex items-center justify-center h-[88vh] p-4 text-center">
              <div className="text-center">
                <p className="text-2xl font-semibold text-white mb-4">
                  Authentication Required
                </p>
                <p className="text-lg text-gray-300 mb-6">
                  Please sign in to access the admin panel.
                </p>
                <Button onClick={() => window.location.href = "/auth/signin"} className="bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </div>
            </div>
          );
    } else {
        if (!isAdmin) {
            return (
                <div className="flex items-center justify-center h-[88vh] p-4 text-center">
                    Access Denied! You are not authorized to view this webpage.
                </div>
            );
        }
    }
    return <DataTable data={applicants} />;
};

export default AdminContent;
