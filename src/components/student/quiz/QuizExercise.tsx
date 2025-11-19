"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pin, PinOff, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import PassageWithHighlight from "./PassageWithHighlight";
import QuizQuestionGroup from "./QuizQuestionGroup";

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
}

interface Exercise {
  id: string;
  title: string;
  instruction?: string;
  passage?: string;
  image_url?: string;
  audio_url?: string;
  question_groups: QuestionGroup[];
  total_questions: number;
}

interface QuizExerciseProps {
  exercise: Exercise;
  exerciseIndex: number;
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
  isLastExercise?: boolean;
}

export default function QuizExercise({
  exercise,
  exerciseIndex,
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
  isLastExercise = false,
}: QuizExerciseProps) {
  const passageId = `exercise-passage-${exercise.id}`;
  const isPassagePinned = pinnedPassageId === passageId;
  const isImagePinned = pinnedImageUrl === exercise.image_url;

  // Calculate total questions in this exercise
  const totalQuestionsInExercise = exercise.question_groups.reduce(
    (sum, group) => sum + group.questions.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <div className="border-b-2 border-blue-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{exercise.title}</h3>
            {exercise.instruction && (
              <p className="text-sm text-gray-600 mt-1">{exercise.instruction}</p>
            )}
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            {totalQuestionsInExercise} {totalQuestionsInExercise === 1 ? 'question' : 'questions'}
          </div>
        </div>
      </div>

      {/* Exercise Passage (from exercise.content) */}
      {exercise.passage && (
        <PassageWithHighlight
          passageId={passageId}
          passageText={exercise.passage}
          onPin={() => onPinPassage(isPassagePinned ? "" : passageId)}
          isPinned={isPassagePinned}
        />
      )}

      {/* Exercise Image (from exercise.content) */}
      {exercise.image_url && (
        <div className="mb-4 relative group">
          <img
            src={exercise.image_url}
            alt="Exercise reference"
            className="w-full rounded-lg border border-gray-200"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPinImage(isImagePinned ? null : exercise.image_url || null)}
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

      {/* Exercise Audio Player (for Listening) */}
      {exercise.audio_url && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Headphones className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Audio Recording</span>
          </div>
          <audio controls className="w-full">
            <source src={exercise.audio_url} type="audio/mpeg" />
            <source src={exercise.audio_url} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Question Groups within this Exercise */}
      <div className="space-y-6">
        {exercise.question_groups.map((group, groupIndex) => (
          <QuizQuestionGroup
            key={group.id}
            group={group}
            groupIndex={groupIndex}
            currentAnswer={currentAnswer}
            flaggedQuestions={flaggedQuestions}
            selectedQuestionId={selectedQuestionId}
            onAnswerChange={onAnswerChange}
            onToggleFlag={onToggleFlag}
            onPinImage={onPinImage}
            pinnedImageUrl={pinnedImageUrl}
            questionRefs={questionRefs}
            speakingAudios={speakingAudios}
            speakingRecording={speakingRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onFileUpload={onFileUpload}
            onClearAudio={onClearAudio}
            fileInputRefs={fileInputRefs}
            isLastGroup={groupIndex === exercise.question_groups.length - 1}
          />
        ))}
      </div>

      {!isLastExercise && <Separator className="my-8 border-2" />}
    </div>
  );
}

