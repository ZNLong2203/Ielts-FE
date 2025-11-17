"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import PassageWithHighlight from "./PassageWithHighlight";
import QuizQuestion from "./QuizQuestion";

interface Question {
  id: string;
  type: string;
  question: string;
  ordering: number;
  options?: string[];
  option_ids?: string[];
}

interface QuestionGroup {
  id: string;
  title?: string;
  instruction?: string;
  passage_reference?: string;
  image_url?: string;
  questions: Question[];
}

interface QuizQuestionGroupProps {
  group: QuestionGroup;
  groupIndex: number;
  currentAnswer: (questionId: string) => string | string[] | undefined;
  flaggedQuestions: Set<string>;
  selectedQuestionId: string | null;
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  onToggleFlag: (questionId: string) => void;
  onPinPassage: (passageId: string) => void;
  onPinImage: (imageUrl: string | null) => void;
  pinnedPassageId: string | null;
  pinnedImageUrl: string | null;
  questionRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
  // For speaking questions
  speakingAudios?: { [key: string]: { blob: Blob; url: string } };
  speakingRecording?: { [key: string]: boolean };
  onStartRecording?: (questionId: string) => void;
  onStopRecording?: (questionId: string) => void;
  onFileUpload?: (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAudio?: (questionId: string) => void;
  fileInputRefs?: React.RefObject<{ [key: string]: HTMLInputElement | null }>;
  isLastGroup?: boolean;
}

export default function QuizQuestionGroup({
  group,
  groupIndex,
  currentAnswer,
  flaggedQuestions,
  selectedQuestionId,
  onAnswerChange,
  onToggleFlag,
  onPinPassage,
  onPinImage,
  pinnedPassageId,
  pinnedImageUrl,
  questionRefs,
  speakingAudios,
  speakingRecording,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onClearAudio,
  fileInputRefs,
  isLastGroup = false,
}: QuizQuestionGroupProps) {
  const passageId = `passage-${group.id}`;
  const isPassagePinned = pinnedPassageId === passageId;
  const isImagePinned = pinnedImageUrl === group.image_url;

  return (
    <div className="space-y-6">
      {/* Passage/Reading Text at Top */}
      {group.passage_reference && (
        <PassageWithHighlight
          passageId={passageId}
          passageText={group.passage_reference}
          onPin={() => onPinPassage(isPassagePinned ? "" : passageId)}
          isPinned={isPassagePinned}
        />
      )}

      {/* Group Image */}
      {group.image_url && (
        <div className="mb-4 relative group">
          <img
            src={group.image_url}
            alt="Question reference"
            className="w-full rounded-lg border border-gray-200"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPinImage(isImagePinned ? null : group.image_url || null)}
            className={cn(
              "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
              isImagePinned ? "bg-blue-600 text-white hover:bg-blue-700" : ""
            )}
          >
            {isImagePinned ? (
              <>
                <PinOff className="h-3 w-3 mr-1" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-3 w-3 mr-1" />
                Pin
              </>
            )}
          </Button>
        </div>
      )}

      {/* Group Header */}
      <div className="border-b-2 border-gray-200 pb-3">
        <h4 className="text-lg font-semibold text-gray-900">
          {group.title ||
            `Questions ${group.questions[0]?.ordering || groupIndex + 1}-${
              group.questions[group.questions.length - 1]?.ordering ||
              groupIndex + group.questions.length
            }`}
        </h4>
        {group.instruction && (
          <p className="text-sm text-gray-600 mt-2 italic">{group.instruction}</p>
        )}
      </div>

      {/* All Questions in this Group */}
      <div className="space-y-6">
        {group.questions.map((question, qIndex) => {
          // Create a ref object for this question's file input
          const questionFileInputRef = useMemo(() => {
            if (!fileInputRefs?.current) return undefined;
            return {
              get current() {
                return fileInputRefs.current?.[question.id] || null;
              },
              set current(value: HTMLInputElement | null) {
                if (fileInputRefs?.current) {
                  fileInputRefs.current[question.id] = value;
                }
              },
            } as React.RefObject<HTMLInputElement>;
          }, [fileInputRefs, question.id]);

          return (
            <QuizQuestion
              key={question.id}
              question={question}
              questionNumber={question.ordering || `${groupIndex + 1}.${qIndex + 1}`}
              currentAnswer={currentAnswer(question.id)}
              isFlagged={flaggedQuestions.has(question.id)}
              isSelected={selectedQuestionId === question.id}
              onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
              onToggleFlag={() => onToggleFlag(question.id)}
              questionRef={(el) => {
                if (questionRefs.current) {
                  questionRefs.current[question.id] = el;
                }
              }}
              speakingAudio={speakingAudios?.[question.id]}
              isRecording={speakingRecording?.[question.id]}
              onStartRecording={
                onStartRecording ? () => onStartRecording(question.id) : undefined
              }
              onStopRecording={
                onStopRecording ? () => onStopRecording(question.id) : undefined
              }
              onFileUpload={
                onFileUpload ? (e) => onFileUpload(question.id, e) : undefined
              }
              onClearAudio={onClearAudio ? () => onClearAudio(question.id) : undefined}
              fileInputRef={questionFileInputRef}
            />
          );
        })}
      </div>

      {!isLastGroup && <Separator className="my-8" />}
    </div>
  );
}

