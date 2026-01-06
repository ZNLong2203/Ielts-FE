"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4 max-w-md">
        <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="text-gray-600">{error.message || "An unexpected error occurred"}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="mt-4">
            Try again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline" 
            className="mt-4"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

