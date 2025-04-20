"use client";

import React from "react";
import { useToast } from "@/hooks/use-toast";
import ReviewAnalyzer from "@/components/ReviewAnalyzer";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-10">
      {/* Header & Logout */}
      <div className="w-full max-w-md flex justify-between px-8 mb-6">
        <h1 className="text-2xl font-semibold">BlueKaktus Analytics</h1>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
          Logout
        </Button>
      </div>

      {/* Analysis Component */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <ReviewAnalyzer />
      </div>

      {/* Note */}
      <p className="text-red-500 mt-4 text-sm text-center">
        Please use a CSV with fewer than 100 reviews. This prototype is rate‑limited and may be slow.
      </p>
    </div>
  );
}
