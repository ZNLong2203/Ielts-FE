"use client";
import { Card, CardContent } from "@/components/ui/card";
import Heading from "@/components/ui/heading";
import { Mic } from "lucide-react";

const SpeakingDetail = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <Heading
                title="Speaking Exercise Detail"
                description="View speaking exercise details"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Speaking detail component - To be implemented</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpeakingDetail;

