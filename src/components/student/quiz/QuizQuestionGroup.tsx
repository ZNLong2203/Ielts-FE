"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import QuizQuestion from "./QuizQuestion";
import { MatchingHeadingExercise } from "@/components/exercise/MatchingHeadingExercise";
import { ICourseQuestion } from "@/interface/courseQuestion";

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
  type: string;
  questions: Question[];
  matching_options?: Array<{
    id: string;
    option_text: string;
    ordering: number;
  }>;
}

interface QuizQuestionGroupProps {
  group: QuestionGroup;
  groupIndex: number;
  currentAnswer: (questionId: string) => string | string[] | undefined;
  flaggedQuestions: Set<string>;
  selectedQuestionId: string | null;
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  onToggleFlag: (questionId: string) => void;
  onPinImage: (imageUrl: string | null) => void;
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
  onPinImage,
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
  const isImagePinned = pinnedImageUrl === group.image_url;

  return (
    <div className="space-y-6">
      {/* Note: Passage is now displayed at exercise level, not here */}
      {/* Group Image (if not already shown at exercise level) - Skip for writing exercises as image is shown at exercise level */}
      {/* Only show group image if it's not a writing type (writing images are shown at exercise level) */}
      {group.image_url && group.type !== "essay" && (
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
        {/* Check if this is a matching heading exercise */}
        {group.type === "matching" && group.matching_options && group.matching_options.length > 0 ? (
          // Render MatchingHeadingExercise for matching heading questions
          <div className="mt-4">
            <MatchingHeadingExercise
              questions={group.questions.map(q => ({
                id: q.id,
                question_text: q.question,
                question_type: q.type,
                question_options: group.matching_options?.map(mo => ({
                  id: mo.id,
                  option_text: mo.option_text,
                  is_correct: false, // Will be determined by backend
                  ordering: mo.ordering,
                })) || [],
              })) as ICourseQuestion[]}
              userAnswers={group.questions.reduce((acc, q) => {
                const answer = currentAnswer(q.id);
                acc[q.id] = Array.isArray(answer) ? answer[0] : (answer || null);
                return acc;
              }, {} as Record<string, string | null>)}
              onAnswerChange={(questionId, answer) => {
                onAnswerChange(questionId, answer);
              }}
              showResults={false}
              questionResults={{}}
            />
          </div>
        ) : (
          // Render individual questions for other types
          group.questions.map((question, qIndex) => {
            // Create a ref object for this question's file input (moved outside useMemo)
            const questionFileInputRef: React.RefObject<HTMLInputElement> = {
              get current() {
                return fileInputRefs?.current?.[question.id] || null;
              },
              set current(value: HTMLInputElement | null) {
                if (fileInputRefs?.current) {
                  fileInputRefs.current[question.id] = value;
                }
              },
            };

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
          })
        )}
      </div>

      {!isLastGroup && <Separator className="my-8" />}
    </div>
  );
}

