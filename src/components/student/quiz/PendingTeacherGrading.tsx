"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Mail, CheckCircle } from "lucide-react";

interface PendingTeacherGradingProps {
  quizTitle: string;
  sectionName: string;
  onBack: () => void;
}

export default function PendingTeacherGrading({
  quizTitle,
  sectionName,
  onBack,
}: PendingTeacherGradingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>

        <Card className="border-l-4 border-l-purple-500 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-10 w-10 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">
              Writing Submitted for Teacher Grading
            </CardTitle>
            <p className="text-gray-600">
              {quizTitle} - {sectionName}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Your writing has been successfully submitted
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Your writing submission has been sent to our experienced IELTS teachers for detailed review and grading.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-blue-200">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Email Notification
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    You will receive an email notification once your writing has been graded. The email will include your band score and detailed feedback from the teacher.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-blue-200">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Processing Time
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Our teachers typically complete grading within 1-3 business days. You can check back here or wait for the email notification.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                <strong>What happens next?</strong>
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Teacher reviews your writing submission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Detailed feedback and band score are provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>You receive an email notification with results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>View detailed feedback in your test results</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Button
                onClick={onBack}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

