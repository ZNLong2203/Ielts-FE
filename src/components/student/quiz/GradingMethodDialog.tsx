"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GradingMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: 'ai' | 'teacher') => void;
}

export default function GradingMethodDialog({
  open,
  onOpenChange,
  onSelect,
}: GradingMethodDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-gray-900">
            Choose Grading Method
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-gray-600 text-base">
            Please select how you would like your writing to be graded:
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {/* AI Grading Option */}
            <button
              onClick={() => {
                onSelect('ai');
                onOpenChange(false);
              }}
              className="p-6 border-2 border-blue-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Grading</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Get instant feedback and scores using AI. Results available immediately after submission.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-200">
                  <span className="font-medium">Instant results</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">AI-powered analysis</span>
                </div>
              </div>
            </button>

            {/* Teacher Grading Option */}
            <button
              onClick={() => {
                onSelect('teacher');
                onOpenChange(false);
              }}
              className="p-6 border-2 border-purple-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher Grading</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Get detailed feedback from experienced IELTS teachers. You&apos;ll receive an email notification when grading is complete.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-200">
                  <span className="font-medium">Email notification</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">Expert review</span>
                </div>
              </div>
            </button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

