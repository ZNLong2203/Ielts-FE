"use client";

import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import QuestionTextWithHighlight from "./QuestionTextWithHighlight";
import QuestionInput from "./QuestionInput";

interface QuizQuestionProps {
  question: {
    id: string;
    type: string;
    question: string;
    options?: string[];
    option_ids?: string[];
  };
  questionNumber: string | number;
  currentAnswer: string | string[] | undefined;
  isFlagged: boolean;
  isSelected: boolean;
  onAnswerChange: (answer: string | string[]) => void;
  onToggleFlag: () => void;
  questionRef: (el: HTMLDivElement | null) => void;
  // For speaking questions
  speakingAudio?: { blob: Blob; url: string };
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAudio?: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export default function QuizQuestion({
  question,
  questionNumber,
  currentAnswer,
  isFlagged,
  isSelected,
  onAnswerChange,
  onToggleFlag,
  questionRef,
  speakingAudio,
  isRecording,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onClearAudio,
  fileInputRef,
}: QuizQuestionProps) {
  return (
    <div
      ref={questionRef}
      className={cn(
        "bg-white rounded-lg p-6 border-2 transition-all duration-300",
        isSelected
          ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
          : "border-gray-100 hover:border-blue-200"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-baseline space-x-2 flex-1">
          <span className="font-semibold text-lg text-gray-900 flex-shrink-0">
            {questionNumber}.
          </span>
          <QuestionTextWithHighlight questionId={question.id} questionText={question.question} />
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleFlag} className={cn(
          "ml-2 flex-shrink-0",
          isFlagged ? "text-yellow-600" : "text-gray-400"
        )}>
          <Flag className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4">
        <QuestionInput
          question={question}
          currentAnswer={currentAnswer}
          onAnswerChange={(questionId, answer) => {
            onAnswerChange(answer);
          }}
          speakingAudio={speakingAudio}
          isRecording={isRecording}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onFileUpload={onFileUpload}
          onClearAudio={onClearAudio}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
}

