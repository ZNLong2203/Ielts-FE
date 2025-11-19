"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizNavigationProps {
  sections: Array<{
    id: string;
    name: string;
    total_questions: number;
    exercises?: Array<{
      id: string;
      title: string;
      total_questions: number;
    }>;
  }>;
  allQuestions: Array<{
    question: { id: string; type: string };
    sectionIndex: number;
    exerciseIndex?: number;
  }>;
  currentSectionIndex: number;
  currentExerciseIndex?: number; // For exercise-based navigation
  answeredCount: number;
  totalQuestions: number;
  flaggedQuestions: Set<string>;
  isSubmitting: boolean;
  isNavigationExpanded: boolean;
  isQuestionAnswered: (questionId: string, questionType?: string) => boolean;
  onSectionChange: (index: number) => void;
  onExerciseChange?: (sectionIndex: number, exerciseIndex: number) => void; // New prop for exercise navigation
  onQuestionClick: (questionId: string, sectionIndex: number) => void;
  onSubmit: () => void;
  onToggleNavigation: () => void;
  isPinned?: boolean;
}

export default function QuizNavigation({
  sections,
  allQuestions,
  currentSectionIndex,
  currentExerciseIndex,
  answeredCount,
  totalQuestions,
  flaggedQuestions,
  isSubmitting,
  isNavigationExpanded,
  isQuestionAnswered,
  onSectionChange,
  onExerciseChange,
  onQuestionClick,
  onSubmit,
  onToggleNavigation,
  isPinned = false,
}: QuizNavigationProps) {
  // Get current section
  const currentSection = sections[currentSectionIndex];
  // If current section has exercises, use exercises for "Sections" display
  // Otherwise, use sections as before
  const displayItems = currentSection?.exercises && currentSection.exercises.length > 0
    ? currentSection.exercises.map(ex => ({
        id: ex.id,
        name: ex.title,
        total_questions: ex.total_questions,
      }))
    : sections.map(s => ({
        id: s.id,
        name: s.name,
        total_questions: s.total_questions,
      }));
  
  const currentItemIndex = currentSection?.exercises && currentSection.exercises.length > 0
    ? (currentExerciseIndex ?? 0)
    : currentSectionIndex;
  if (isPinned) {
    // Navigation at bottom when pinned
    return (
      <div className="w-full bg-white border-t border-gray-200">
        <div className="flex items-center justify-center p-2 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleNavigation}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            {isNavigationExpanded ? (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Hide Navigation
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Navigation
              </>
            )}
          </Button>
        </div>

        {isNavigationExpanded && (
          <div className="p-4 space-y-4 max-h-48 overflow-y-auto">
            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Sections</h3>
                <div className="space-y-2">
                  {displayItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (currentSection?.exercises && currentSection.exercises.length > 0 && onExerciseChange) {
                          onExerciseChange(currentSectionIndex, index);
                        } else {
                          onSectionChange(index);
                        }
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded-lg border transition-colors text-xs",
                        index === currentItemIndex
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        {item.total_questions} questions
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-2 lg:hidden" />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Questions</h3>
                <div className="grid grid-cols-5 gap-2 max-h-24 overflow-y-auto">
                  {allQuestions.map(({ question, sectionIndex }, index) => (
                    <button
                      key={question.id}
                      onClick={() => onQuestionClick(question.id, sectionIndex)}
                      className={cn(
                        "w-8 h-8 rounded text-xs font-medium transition-colors",
                        isQuestionAnswered(question.id, question.type)
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : flaggedQuestions.has(question.id)
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-100 rounded mr-1"></div>
                    Answered
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-100 rounded mr-1"></div>
                    Flagged
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex gap-4 flex-col lg:flex-row">
              <div className="bg-gray-50 rounded-lg p-3 flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Summary</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-medium text-green-600">
                      {answeredCount}/{totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flagged:</span>
                    <span className="font-medium text-yellow-600">{flaggedQuestions.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium text-gray-600">
                      {totalQuestions - answeredCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2">
                <Button
                  onClick={onSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-sm"
                  disabled={answeredCount === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit ({answeredCount}/{totalQuestions})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar navigation when not pinned
  return (
    <div className="w-full lg:w-80 p-6 bg-white border-l border-gray-200">
      <div className="space-y-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Sections</h3>
          <div className="space-y-2">
            {displayItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  if (currentSection?.exercises && currentSection.exercises.length > 0 && onExerciseChange) {
                    onExerciseChange(currentSectionIndex, index);
                  } else {
                    onSectionChange(index);
                  }
                }}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  index === currentItemIndex
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                )}
              >
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs opacity-80 mt-1">{item.total_questions} questions</div>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {allQuestions.map(({ question, sectionIndex }, index) => {
              const isFlagged = flaggedQuestions.has(question.id);
              const isAnswered = isQuestionAnswered(question.id, question.type);
              
              return (
              <button
                key={question.id}
                onClick={() => onQuestionClick(question.id, sectionIndex)}
                className={cn(
                  "w-10 h-10 rounded text-sm font-medium transition-colors",
                    // Priority: flagged (yellow) > answered (green) > default (gray)
                    isFlagged
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : isAnswered
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {index + 1}
              </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-3">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
              Answered
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
              Flagged
            </span>
          </div>
        </div>

        <Separator />

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-medium text-green-600">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Flagged:</span>
              <span className="font-medium text-yellow-600">{flaggedQuestions.size}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className="font-medium text-gray-600">
                {totalQuestions - answeredCount}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={onSubmit}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={answeredCount === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Test ({answeredCount}/{totalQuestions})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

