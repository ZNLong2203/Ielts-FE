"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  RotateCcw,
  Send,
  BookOpen,
  Loader2,
  FileText,
  Headphones,
  Mic,
  Pin,
  PinOff,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { startMockTest, submitSectionAnswers, TestSectionSubmission, TestAnswerSubmission } from "@/api/mockTest";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useTextHighlight } from "@/hooks/useTextHighlight";

// Passage Component with Highlight and Pin Support
const PassageWithHighlight = ({ 
  passageId, 
  passageText, 
  onPin, 
  isPinned 
}: { 
  passageId: string; 
  passageText: string;
  onPin: () => void;
  isPinned: boolean;
}) => {
  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } = useTextHighlight(passageId);
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">
          Reading Passage
        </h3>
        <div className="flex items-center gap-2">
          {highlights.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllHighlights}
              className="text-xs"
            >
              Clear Highlights ({highlights.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onPin}
            className={cn(
              "text-xs",
              isPinned ? "bg-blue-600 text-white hover:bg-blue-700" : ""
            )}
          >
            {isPinned ? (
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
      </div>
      <div 
        id={passageId}
        onMouseUp={toggleHighlight}
        className="bg-white rounded-lg p-6 border border-blue-200 cursor-text select-text"
      >
        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
          {renderHighlightedText(passageText)}
        </p>
        <p className="text-xs text-gray-500 mt-2 italic">
          💡 Tip: Select text to highlight important information
        </p>
      </div>
    </div>
  );
};

// Question Text Component with Highlight Support
const QuestionTextWithHighlight = ({ questionId, questionText }: { questionId: string; questionText: string }) => {
  const questionTextId = `question-text-${questionId}`;
  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } = useTextHighlight(questionTextId);
  
  return (
    <div className="flex-1">
      <div className="relative group">
        <div 
          id={questionTextId}
          onMouseUp={toggleHighlight}
          className="text-gray-900 font-medium cursor-text select-text pr-8"
        >
          {renderHighlightedText(questionText)}
        </div>
        {highlights.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllHighlights}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 px-2"
            title={`Clear ${highlights.length} highlight${highlights.length > 1 ? 's' : ''}`}
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
};

interface QuizDetailProps {
  quizId?: string;
  onBack?: () => void;
}

interface TransformedQuestion {
  id: string;
  type: string;
  question: string;
  audio_url?: string;
  image_url?: string;
  reading_passage?: string;
  options?: string[];
  option_ids?: string[];
  correct_answer?: string | string[];
  points: number;
  ordering: number;
}

interface QuestionGroup {
  id: string;
  title?: string;
  instruction?: string;
  passage_reference?: string;
  image_url?: string;
  type: string;
  questions: TransformedQuestion[];
}

interface TestSection {
  id: string;
  name: string;
  type: string;
  description?: string;
  duration: number;
  ordering: number;
  question_groups: QuestionGroup[];
  total_questions: number;
}

interface TransformedQuiz {
  id: string;
  title: string;
  description: string;
  section: string;
  duration: number;
  total_questions: number;
  instructions: string;
  sections: TestSection[];
  test_result_id?: string;
  current_section_type?: string;
}

const QuizDetailNew = ({ quizId, onBack }: QuizDetailProps) => {
  const router = useRouter();
  const [testResultId, setTestResultId] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showInstructions, setShowInstructions] = useState(false);
  const [sectionResult, setSectionResult] = useState<{
    band_score: number;
    correct_answers: number;
    total_questions: number;
    detailed_answers?: unknown;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [pinnedPassageId, setPinnedPassageId] = useState<string | null>(null);
  const [pinnedImageUrl, setPinnedImageUrl] = useState<string | null>(null);
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(true);
  const questionRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  const startTestMutation = useMutation({
    mutationFn: (testId: string) => startMockTest(testId),
    onSuccess: (data) => {
      if (!data || !data.test_result_id || !data.test) {
        toast.error("Invalid test data received");
        return;
      }
      setTestResultId(data.test_result_id);
      const test = data.test;
      const firstSection = test.test_sections?.[0];
      if (firstSection) {
        setTimeRemaining(firstSection.duration * 60);
      } else {
        toast.error("Test has no sections");
      }
      toast.success("Test started! Good luck! 🍀");
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || "Failed to start test");
    },
  });

  const submitSectionMutation = useMutation({
    mutationFn: (data: TestSectionSubmission) => submitSectionAnswers(data),
    onSuccess: (response) => {
      setSectionResult(response.data);
      setIsCompleted(true);
      setIsStarted(false);
      toast.success(`Section completed! Band Score: ${response.data.band_score}`, {
        duration: 5000,
      });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || "Failed to submit answers");
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (quizId && !startTestMutation.data && !startTestMutation.isPending) {
      startTestMutation.mutate(quizId);
    }
  }, [quizId, startTestMutation]);

  const transformedQuiz: TransformedQuiz | null = useMemo(() => {
    if (!startTestMutation.data) return null;
    
    const test = startTestMutation.data.test;
    if (!test || !test.test_sections) return null;

    const sections: TestSection[] = test.test_sections
      .sort((a: { ordering: number }, b: { ordering: number }) => a.ordering - b.ordering)
      .map((section: {
        id: string;
        section_name: string;
        section_type: string;
        description?: string;
        duration: number;
        ordering: number;
        exercises?: Array<{
          question_groups?: Array<{
            id: string;
            passage_reference?: string | null;
            group_title?: string | null;
            group_instruction?: string | null;
            image_url?: string | null;
            question_type: string;
            ordering: number;
            questions?: Array<{
              id: string;
              question_type: string;
              question_text: string;
              audio_url?: string | null;
              image_url?: string | null;
              reading_passage?: string | null;
              points?: number | null;
              ordering: number;
              question_options?: Array<{
                id: string;
                option_text: string;
              }>;
            }>;
          }>;
        }>;
      }) => {
        const questionGroups: QuestionGroup[] = [];
        
        section.exercises?.forEach((exercise) => {
          exercise.question_groups
            ?.sort((a, b) => a.ordering - b.ordering)
            .forEach((group) => {
              const questions: TransformedQuestion[] = (group.questions || [])
                .sort((a, b) => a.ordering - b.ordering)
                .map((question) => ({
                  id: question.id,
                  type: question.question_type,
                  question: question.question_text,
                  audio_url: question.audio_url || undefined,
                  image_url: question.image_url || group.image_url || undefined,
                  reading_passage: question.reading_passage || undefined,
                  points: question.points ? Number(question.points) : 1,
                  ordering: question.ordering,
                  options: question.question_options?.map((opt) => opt.option_text) || [],
                  option_ids: question.question_options?.map((opt) => opt.id) || [],
                }));

              questionGroups.push({
                id: group.id,
                title: group.group_title || undefined,
                instruction: group.group_instruction || undefined,
                passage_reference: group.passage_reference || undefined,
                image_url: group.image_url || undefined,
                type: group.question_type,
                questions,
              });
            });
        });

        const totalQuestions = questionGroups.reduce((sum, g) => sum + g.questions.length, 0);

        return {
          id: section.id,
          name: section.section_name,
          type: section.section_type,
          description: section.description,
          duration: section.duration,
          ordering: section.ordering,
          question_groups: questionGroups,
          total_questions: totalQuestions,
        };
      });

    const totalQuestions = sections.reduce((sum, s) => sum + s.total_questions, 0);
    const totalDuration = sections.reduce((sum, s) => sum + s.duration, 0);

    return {
      id: test.id,
      title: test.title,
      description: test.description || "",
      section: test.test_type || sections[0]?.type || "reading",
      duration: totalDuration,
      total_questions: totalQuestions,
      instructions: test.instructions || "",
      sections,
      test_result_id: startTestMutation.data.test_result_id,
      current_section_type: sections[0]?.type,
    };
  }, [startTestMutation.data]);

  const quiz = transformedQuiz;
  const currentSection = quiz?.sections[currentSectionIndex];
  const totalQuestions = quiz?.total_questions || 0;

  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz || !testResultId || !currentSection || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeTaken = timeStarted ? Math.floor((Date.now() - timeStarted) / 1000) : 0;
      
      const allQuestions = quiz.sections.flatMap(s => 
        s.question_groups.flatMap(g => g.questions)
      );
      
      const answerSubmissions: TestAnswerSubmission[] = allQuestions.map((q) => {
        const userAnswer = answers[q.id];
        const answerData: {
          fill_blank_answers?: string;
          multiple_choice_answers?: string[];
          true_false_answers?: string;
          matching_answers?: string;
        } = {};
        
        switch (q.type) {
          case "multiple_choice":
            const mcAnswer = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
            answerData.multiple_choice_answers = mcAnswer ? [mcAnswer] : [];
            break;
          case "fill_blank":
            answerData.fill_blank_answers = Array.isArray(userAnswer) ? userAnswer.join(" ") : (userAnswer || "");
            break;
          case "true_false":
            answerData.true_false_answers = Array.isArray(userAnswer) ? userAnswer[0] : (userAnswer || "");
            break;
          case "matching":
            answerData.matching_answers = Array.isArray(userAnswer) ? userAnswer[0] : (userAnswer || "");
            break;
          default:
            answerData.fill_blank_answers = Array.isArray(userAnswer) ? userAnswer.join(" ") : (userAnswer || "");
        }
        
        return {
          question_id: q.id,
          user_answer: answerData,
        };
      });

      const submissionData: TestSectionSubmission = {
        test_result_id: testResultId,
        test_section_id: currentSection.id,
        time_taken: timeTaken,
        answers: answerSubmissions,
      };

      await submitSectionMutation.mutateAsync(submissionData);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, testResultId, currentSection, isSubmitting, timeStarted, answers, submitSectionMutation]);

  useEffect(() => {
    if (!isStarted || isCompleted || !timeStarted) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timeStarted) / 1000);
      const remaining = (quiz?.duration || 0) * 60 - elapsed;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        handleSubmitQuiz();
        return;
      }
      
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isCompleted, timeStarted, quiz, handleSubmitQuiz]);

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "listening": return <Headphones className="h-5 w-5" />;
      case "reading": return <BookOpen className="h-5 w-5" />;
      case "writing": return <FileText className="h-5 w-5" />;
      case "speaking": return <Mic className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case "listening": return "bg-blue-50 text-blue-700 border-blue-200";
      case "reading": return "bg-green-50 text-green-700 border-green-200";
      case "writing": return "bg-purple-50 text-purple-700 border-purple-200";
      case "speaking": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!quiz) return "text-green-600";
    const percentage = (timeRemaining / (quiz.duration * 60)) * 100;
    if (percentage <= 5) return "text-red-600 animate-pulse";
    if (percentage <= 10) return "text-red-600";
    if (percentage <= 25) return "text-orange-600";
    return "text-green-600";
  };

  const handleStartQuiz = async () => {
    if (!quizId) {
      toast.error("Test ID is required");
      return;
    }
    
    if (startTestMutation.data) {
      setIsStarted(true);
      setShowInstructions(false);
      if (!timeStarted) {
        setTimeStarted(Date.now());
      }
    } else {
      try {
        await startTestMutation.mutateAsync(quizId);
        setIsStarted(true);
        setShowInstructions(false);
        setTimeStarted(Date.now());
      } catch {
      }
    }
  };

  useEffect(() => {
    if (startTestMutation.data && !isStarted && !showInstructions) {
      setIsStarted(true);
      setTimeStarted(Date.now());
    }
  }, [startTestMutation.data, isStarted, showInstructions]);

  // Effect to hide sidebar and footer when pinned
  useEffect(() => {
    if (pinnedPassageId || pinnedImageUrl) {
      // Find sidebar by checking all divs with fixed positioning
      const allDivs = Array.from(document.querySelectorAll('div'));
      const sidebar = allDivs.find(div => {
        const classes = String(div.className || div.getAttribute('class') || '');
        return classes.includes('lg:fixed') && classes.includes('lg:w-72') && classes.includes('lg:flex');
      });
      
      // Hide footer
      const footer = document.querySelector('footer');
      
      // Find main wrapper with lg:pl-72
      const allElements = Array.from(document.querySelectorAll('*'));
      const mainWrapper = allElements.find(el => {
        const classes = String(el.className || el.getAttribute('class') || '');
        return classes.includes('lg:pl-72');
      });
      
      const originalStyles: { element: HTMLElement; display: string; paddingLeft: string }[] = [];
      
      if (sidebar) {
        const el = sidebar as HTMLElement;
        const originalDisplay = el.style.display || '';
        originalStyles.push({ element: el, display: originalDisplay, paddingLeft: '' });
        el.style.display = 'none';
      }
      if (footer) {
        const el = footer as HTMLElement;
        const originalDisplay = el.style.display || '';
        originalStyles.push({ element: el, display: originalDisplay, paddingLeft: '' });
        el.style.display = 'none';
      }
      if (mainWrapper) {
        const el = mainWrapper as HTMLElement;
        const originalPaddingLeft = el.style.paddingLeft || '';
        originalStyles.push({ element: el, display: '', paddingLeft: originalPaddingLeft });
        el.style.paddingLeft = '0';
      }
      
      // Prevent body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore on unmount or when unpinned
        originalStyles.forEach(({ element, display, paddingLeft }) => {
          // Remove inline style to restore CSS classes (for sidebar/footer)
          if (display === '') {
            element.style.display = '';
          } else {
            element.style.display = display;
          }
          // Restore padding
          if (paddingLeft === '') {
            element.style.paddingLeft = '';
          } else {
            element.style.paddingLeft = paddingLeft;
          }
        });
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [pinnedPassageId, pinnedImageUrl]);

  const toggleFlag = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleResetQuiz = () => {
    setCurrentSectionIndex(0);
    setAnswers({});
    // Reset pinned items when resetting quiz
    setPinnedPassageId(null);
    setPinnedImageUrl(null);
    if (quiz) {
      setTimeRemaining(quiz.duration * 60);
    }
    setIsStarted(false);
    setIsCompleted(false);
    setFlaggedQuestions(new Set());
    setShowInstructions(true);
    setSectionResult(null);
    setTimeStarted(null);
    setIsSubmitting(false);
    setSelectedQuestionId(null);
    toast.success("Quiz reset successfully!");
  };

  // Scroll to question when clicking question number
  const scrollToQuestion = (questionId: string) => {
    const questionElement = questionRefs.current[questionId];
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedQuestionId(questionId);
      setTimeout(() => setSelectedQuestionId(null), 2000);
    }
  };

  // Render question input based on type
  const renderQuestionInput = (question: TransformedQuestion) => {
    const currentAnswer = answers[question.id];
    const baseId = `question-${question.id}`;

    switch (question.type) {
      case "multiple_choice":
        return (
          <RadioGroup
            value={Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer || "")}
            onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id]: value }))}
            className="space-y-2"
          >
            {question.options?.map((option, index) => {
              const optionValue = question.option_ids?.[index] || String(index);
              return (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem 
                    value={optionValue} 
                    id={`${baseId}-opt-${index}`}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`${baseId}-opt-${index}`} 
                    className="cursor-pointer flex-1 text-sm leading-relaxed"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case "fill_blank":
        return (
          <div className="space-y-2">
            <Input
              id={baseId}
              value={Array.isArray(currentAnswer) 
                ? currentAnswer.join(" ") 
                : (currentAnswer as string) || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer here..."
              className="w-full p-3 border-2 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              Enter your answer exactly as requested in the question.
            </p>
          </div>
        );

      case "true_false":
        return (
          <RadioGroup
            value={Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer as string) || ""}
            onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id]: value }))}
            className="space-y-2"
          >
            {["TRUE", "FALSE", "NOT GIVEN"].map((option) => (
              <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={option} id={`${baseId}-${option.toLowerCase()}`} />
                <Label htmlFor={`${baseId}-${option.toLowerCase()}`} className="cursor-pointer font-medium">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "matching":
        return (
          <RadioGroup
            value={Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer as string) || ""}
            onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id]: value }))}
            className="space-y-2"
          >
            {question.options?.map((option, index) => {
              const optionValue = question.option_ids?.[index] || option;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={optionValue} id={`${baseId}-match-${index}`} />
                  <Label htmlFor={`${baseId}-match-${index}`} className="cursor-pointer font-medium">
                    {option}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case "essay":
      case "speaking":
        return (
          <div className="space-y-2">
            <Textarea
              id={baseId}
              value={Array.isArray(currentAnswer) 
                ? currentAnswer.join(" ") 
                : (currentAnswer as string) || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your detailed answer here..."
              rows={question.type === "essay" ? 12 : 6}
              className="w-full p-3 border-2 focus:border-blue-500 font-sans"
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Write clearly and organize your thoughts</span>
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">
                  Words: {((Array.isArray(currentAnswer) ? currentAnswer.join(" ") : (currentAnswer as string) || "").match(/\S+/g) || []).length}
                </span>
                <span className="text-gray-500">
                  Characters: {(Array.isArray(currentAnswer) ? currentAnswer.join(" ") : (currentAnswer as string) || "").length}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Textarea
              id={baseId}
              value={Array.isArray(currentAnswer) 
                ? currentAnswer.join(" ") 
                : (currentAnswer as string) || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full p-3 border-2 focus:border-blue-500"
            />
          </div>
        );
    }
  };

  if (startTestMutation.isPending || (!startTestMutation.data && !startTestMutation.isError)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Starting test...</p>
        </div>
      </div>
    );
  }

  if (startTestMutation.isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to start test</p>
          <Button onClick={() => quizId && startTestMutation.mutate(quizId)} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (showInstructions && !isCompleted && quiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => onBack ? onBack() : router.push("/student/dashboard/my-quizzes")}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
        </div>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn("p-3 rounded-lg border", getSectionColor(quiz.section))}>
                  {getSectionIcon(quiz.section)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                  <p className="text-gray-600 mt-1 capitalize">
                    {quiz.section} Section - Practice Test
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-sm", getSectionColor(quiz.section))}>
                {quiz.section.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              {quiz.description}
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Important Instructions
              </h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <p className="whitespace-pre-line">{quiz.instructions}</p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              >
                Start Test Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted && sectionResult && quiz) {
    const answeredQuestions = Object.keys(answers).length;
    const correctAnswers = sectionResult.correct_answers || 0;
    const totalQuestionsResult = sectionResult.total_questions || totalQuestions;
    const bandScore = sectionResult.band_score || 0;
    const score = totalQuestionsResult > 0 ? Math.round((correctAnswers / totalQuestionsResult) * 100) : 0;
    
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => onBack ? onBack() : router.push("/student/dashboard/my-quizzes")}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <Button
            variant="outline"
            onClick={handleResetQuiz}
            className="text-blue-600 border-blue-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Test
          </Button>
        </div>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-900">Test Completed!</CardTitle>
            <p className="text-gray-600">Here are your results for {quiz?.title || "this test"}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Band Score</h3>
                <p className="text-4xl font-bold text-blue-600">{bandScore.toFixed(1)}</p>
                <p className="text-sm text-blue-700 mt-2">IELTS Band</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Percentage</h3>
                <p className="text-4xl font-bold text-green-600">{score}%</p>
                <p className="text-sm text-green-700 mt-2">Overall Score</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Correct</h3>
                <p className="text-4xl font-bold text-purple-600">{correctAnswers}/{totalQuestionsResult}</p>
                <p className="text-sm text-purple-700 mt-2">Questions</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleResetQuiz}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Test
              </Button>
              <Button
                onClick={() => onBack ? onBack() : router.push("/student/dashboard/my-quizzes")}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || !currentSection) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  // Get all questions for section navigation
  const allQuestions = quiz.sections.flatMap((s, si) => 
    s.question_groups.flatMap((g, gi) => 
      g.questions.map((q, qi) => ({ question: q, sectionIndex: si, groupIndex: gi, questionIndex: qi }))
    )
  );

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      (pinnedPassageId || pinnedImageUrl) && "fixed inset-0 z-50 bg-gray-50"
    )}>
      {/* Header */}
      <div className={cn(
        "bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10",
        (pinnedPassageId || pinnedImageUrl) && "w-full"
      )}>
        <div className={cn(
          "flex items-center justify-between",
          (pinnedPassageId || pinnedImageUrl) ? "w-full px-6" : "max-w-7xl mx-auto"
        )}>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (isStarted && Object.keys(answers).length > 0) {
                  setShowConfirmExit(true);
                } else {
                  if (onBack) {
                    onBack();
                  } else {
                    router.push("/student/dashboard/my-quizzes");
                  }
                }
              }}
              className="text-gray-600"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">{currentSection.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className={cn("font-mono font-bold text-lg", getTimeColor())}>
                <Clock className="h-4 w-4 inline mr-1" />
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {(pinnedPassageId || pinnedImageUrl) ? (
        // Layout khi có pinned item - Full screen
        <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)]">
          {/* Pinned Passage/Image Panel - Left Side 50% */}
          <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-gray-200 overflow-y-auto h-full">
            <div className="w-full p-6">
              <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-800">Pinned Reference</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPinnedPassageId(null);
                    setPinnedImageUrl(null);
                  }}
                  className="text-xs"
                >
                  <PinOff className="h-3 w-3 mr-1" />
                  Unpin All
                </Button>
              </div>
              
              {/* Pinned Passage */}
              {pinnedPassageId && (() => {
                const pinnedGroup = currentSection.question_groups.find(g => `passage-${g.id}` === pinnedPassageId);
                if (!pinnedGroup?.passage_reference) return null;
                return (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Reading Passage</h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                        {pinnedGroup.passage_reference}
                      </p>
                    </div>
                  </div>
                );
              })()}
              
              {/* Pinned Image */}
              {pinnedImageUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Reference Image</h4>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={pinnedImageUrl} 
                      alt="Pinned reference" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Content - Right Side with Questions */}
          <div className="flex-1 flex flex-col overflow-hidden lg:w-1/2">
            <div className="flex-1 overflow-y-auto p-6">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{currentSection.name}</CardTitle>
                    <Badge className="bg-blue-600 text-white">
                      Section {currentSectionIndex + 1} of {quiz.sections.length}
                    </Badge>
                  </div>
                  {currentSection.description && (
                    <p className="text-sm text-gray-600 mt-2">{currentSection.description}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-8">
              {/* Display all question groups in this section */}
              {currentSection.question_groups.map((group, groupIndex) => {
                const passageId = `passage-${group.id}`;
                const isPassagePinned = pinnedPassageId === passageId;
                const isImagePinned = pinnedImageUrl === group.image_url;
                
                return (
                <div key={group.id} className="space-y-6">
                  {/* Passage/Reading Text at Top */}
                  {group.passage_reference && (
                    <PassageWithHighlight 
                      passageId={passageId}
                      passageText={group.passage_reference}
                      onPin={() => {
                        if (isPassagePinned) {
                          setPinnedPassageId(null);
                        } else {
                          setPinnedPassageId(passageId);
                        }
                      }}
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
                        onClick={() => {
                          if (isImagePinned) {
                            setPinnedImageUrl(null);
                          } else {
                            setPinnedImageUrl(group.image_url || null);
                          }
                        }}
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
                      {group.title || `Questions ${group.questions[0]?.ordering || groupIndex + 1}-${group.questions[group.questions.length - 1]?.ordering || groupIndex + group.questions.length}`}
                    </h4>
                    {group.instruction && (
                      <p className="text-sm text-gray-600 mt-2 italic">{group.instruction}</p>
                    )}
                  </div>

                  {/* All Questions in this Group */}
                  <div className="space-y-6">
                    {group.questions.map((question, qIndex) => (
                      <div 
                        key={question.id} 
                        ref={(el) => { questionRefs.current[question.id] = el; }}
                        className={cn(
                          "bg-white rounded-lg p-6 border-2 transition-all duration-300",
                          selectedQuestionId === question.id
                            ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                            : "border-gray-100 hover:border-blue-200"
                        )}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-baseline space-x-2 flex-1">
                            <span className="font-semibold text-lg text-gray-900 flex-shrink-0">
                              {question.ordering || `${groupIndex + 1}.${qIndex + 1}`}.
                            </span>
                            <QuestionTextWithHighlight 
                              questionId={question.id}
                              questionText={question.question}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFlag(question.id)}
                            className={cn(
                              "ml-2 flex-shrink-0",
                              flaggedQuestions.has(question.id) ? "text-yellow-600" : "text-gray-400"
                            )}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Question Input */}
                        <div className="mt-4">
                          {renderQuestionInput(question)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {groupIndex < currentSection.question_groups.length - 1 && (
                    <Separator className="my-8" />
                  )}
                </div>
              );
              })}
                </CardContent>
              </Card>
            </div>

            {/* Navigation Panel - Bottom */}
            <div className="w-full bg-white border-t border-gray-200">
              {/* Toggle Button */}
              <div className="flex items-center justify-center p-2 border-b border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNavigationExpanded(!isNavigationExpanded)}
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

              {/* Navigation Content */}
              {isNavigationExpanded && (
                <div className="p-4 space-y-4 max-h-48 overflow-y-auto">
                  <div className="flex gap-4 flex-col lg:flex-row">
                    {/* Section Navigation - Full Width */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Sections</h3>
                      <div className="space-y-2">
                        {quiz.sections.map((section, index) => (
                          <button
                            key={section.id}
                            onClick={() => {
                              setCurrentSectionIndex(index);
                              setPinnedPassageId(null);
                              setPinnedImageUrl(null);
                            }}
                            className={cn(
                              "w-full text-left p-2 rounded-lg border transition-colors text-xs",
                              index === currentSectionIndex
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                            )}
                          >
                            <div className="font-medium">{section.name}</div>
                            <div className="text-xs opacity-80 mt-0.5">
                              {section.total_questions} questions
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-2 lg:hidden" />

                    {/* Question Navigation - Full Width */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Questions</h3>
                      <div className="grid grid-cols-5 gap-2 max-h-24 overflow-y-auto">
                        {allQuestions.map(({ question, sectionIndex }, index) => (
                          <button
                            key={question.id}
                            onClick={() => {
                              setCurrentSectionIndex(sectionIndex);
                              setPinnedPassageId(null);
                              setPinnedImageUrl(null);
                              setTimeout(() => scrollToQuestion(question.id), 100);
                            }}
                            className={cn(
                              "w-8 h-8 rounded text-xs font-medium transition-colors",
                              answers[question.id]
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

                {/* Summary and Submit */}
                <div className="flex gap-4 flex-col lg:flex-row">
                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Summary</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Answered:</span>
                        <span className="font-medium text-green-600">
                          {Object.keys(answers).length}/{totalQuestions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flagged:</span>
                        <span className="font-medium text-yellow-600">
                          {flaggedQuestions.size}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span className="font-medium text-gray-600">
                          {totalQuestions - Object.keys(answers).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="lg:w-1/2">
                    <Button
                      onClick={handleSubmitQuiz}
                      className="w-full bg-green-600 hover:bg-green-700 text-sm"
                      disabled={Object.keys(answers).length === 0 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit ({Object.keys(answers).length}/{totalQuestions})
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Layout khi không có pinned item - Giữ nguyên layout cũ
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
          {/* Section Content - IELTS Style */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{currentSection.name}</CardTitle>
                  <Badge className="bg-blue-600 text-white">
                    Section {currentSectionIndex + 1} of {quiz.sections.length}
                  </Badge>
                </div>
                {currentSection.description && (
                  <p className="text-sm text-gray-600 mt-2">{currentSection.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Display all question groups in this section */}
                {currentSection.question_groups.map((group, groupIndex) => {
                  const passageId = `passage-${group.id}`;
                  const isPassagePinned = pinnedPassageId === passageId;
                  const isImagePinned = pinnedImageUrl === group.image_url;
                  
                  return (
                  <div key={group.id} className="space-y-6">
                    {/* Passage/Reading Text at Top */}
                    {group.passage_reference && (
                      <PassageWithHighlight 
                        passageId={passageId}
                        passageText={group.passage_reference}
                        onPin={() => {
                          if (isPassagePinned) {
                            setPinnedPassageId(null);
                          } else {
                            setPinnedPassageId(passageId);
                          }
                        }}
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
                          onClick={() => {
                            if (isImagePinned) {
                              setPinnedImageUrl(null);
                            } else {
                              setPinnedImageUrl(group.image_url || null);
                            }
                          }}
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
                        {group.title || `Questions ${group.questions[0]?.ordering || groupIndex + 1}-${group.questions[group.questions.length - 1]?.ordering || groupIndex + group.questions.length}`}
                      </h4>
                      {group.instruction && (
                        <p className="text-sm text-gray-600 mt-2 italic">{group.instruction}</p>
                      )}
                    </div>

                    {/* All Questions in this Group */}
                    <div className="space-y-6">
                      {group.questions.map((question, qIndex) => (
                        <div 
                          key={question.id} 
                          ref={(el) => { questionRefs.current[question.id] = el; }}
                          className={cn(
                            "bg-white rounded-lg p-6 border-2 transition-all duration-300",
                            selectedQuestionId === question.id
                              ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                              : "border-gray-100 hover:border-blue-200"
                          )}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-baseline space-x-2 flex-1">
                              <span className="font-semibold text-lg text-gray-900 flex-shrink-0">
                                {question.ordering || `${groupIndex + 1}.${qIndex + 1}`}.
                              </span>
                              <QuestionTextWithHighlight 
                                questionId={question.id}
                                questionText={question.question}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFlag(question.id)}
                              className={cn(
                                "ml-2 flex-shrink-0",
                                flaggedQuestions.has(question.id) ? "text-yellow-600" : "text-gray-400"
                              )}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Question Input */}
                          <div className="mt-4">
                            {renderQuestionInput(question)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {groupIndex < currentSection.question_groups.length - 1 && (
                      <Separator className="my-8" />
                    )}
                  </div>
                );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Navigation Panel */}
          <div className="w-full lg:w-80 p-6 bg-white border-l border-gray-200">
            <div className="space-y-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              {/* Section Navigation */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sections</h3>
                <div className="space-y-2">
                  {quiz.sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setCurrentSectionIndex(index);
                        // Reset pinned items when changing sections
                        setPinnedPassageId(null);
                        setPinnedImageUrl(null);
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-colors",
                        index === currentSectionIndex
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <div className="font-medium text-sm">{section.name}</div>
                      <div className="text-xs opacity-80 mt-1">
                        {section.total_questions} questions
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Question Navigation */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                  {allQuestions.map(({ question, sectionIndex }, index) => (
                    <button
                      key={question.id}
                      onClick={() => {
                        setCurrentSectionIndex(sectionIndex);
                        // Reset pinned items when changing sections
                        setPinnedPassageId(null);
                        setPinnedImageUrl(null);
                        setTimeout(() => scrollToQuestion(question.id), 100);
                      }}
                      className={cn(
                        "w-10 h-10 rounded text-sm font-medium transition-colors",
                        answers[question.id]
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

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-medium text-green-600">
                      {Object.keys(answers).length}/{totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flagged:</span>
                    <span className="font-medium text-yellow-600">
                      {flaggedQuestions.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium text-gray-600">
                      {totalQuestions - Object.keys(answers).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitQuiz}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={Object.keys(answers).length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Test ({Object.keys(answers).length}/{totalQuestions})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                <span>Exit Quiz?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to exit? Your progress will be lost and you will need to start over.
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmExit(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowConfirmExit(false);
                    if (onBack) {
                      onBack();
                    } else {
                      router.push("/student/dashboard/my-quizzes");
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Exit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuizDetailNew;

