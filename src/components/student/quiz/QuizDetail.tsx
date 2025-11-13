"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  Volume2,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  RotateCcw,
  Send,
  BookOpen,
  FileText,
  Headphones,
  Mic,
  Timer,
  Target,
  Star,
  Loader2,
} from "lucide-react";

import { startMockTest, submitSectionAnswers, TestSectionSubmission, TestAnswerSubmission } from "@/api/mockTest";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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
  time_limit?: number;
  question_group_id?: string;
  question_group_title?: string;
  passage_reference?: string;
}

interface TransformedQuiz {
  id: string;
  title: string;
  description: string;
  section: string;
  duration: number;
  total_questions: number;
  instructions: string;
  questions: TransformedQuestion[];
  test_result_id?: string;
  current_section_id?: string;
  current_section_type?: string;
}

const QuizDetail = ({ quizId, onBack }: QuizDetailProps) => {
  const router = useRouter();
  const [testResultId, setTestResultId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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

  const startTestMutation = useMutation({
    mutationFn: (testId: string) => startMockTest(testId),
    onSuccess: (data) => {
      if (!data || !data.test_result_id || !data.test) {
        console.error("Invalid response data:", data);
        toast.error("Invalid test data received");
        return;
      }
      setTestResultId(data.test_result_id);
      const test = data.test;
      const firstSection = test.test_sections?.[0];
      if (firstSection) {
        setCurrentSectionId(firstSection.id);
        setTimeRemaining(firstSection.duration * 60);
      } else {
        toast.error("Test has no sections");
      }
      toast.success("Test started! Good luck! 🍀");
    },
    onError: (error: unknown) => {
      console.error("Start test error:", error);
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
    if (!test) return null;
    const firstSection = test.test_sections?.[0];
    if (!firstSection) return null;

    const questions: TransformedQuestion[] = [];
    
    firstSection.exercises?.forEach((exercise: {
      question_groups?: Array<{
        id: string;
        passage_reference?: string | null;
        group_title?: string | null;
        group_instruction?: string | null;
        image_url?: string | null;
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
    }) => {
      exercise.question_groups?.forEach((group) => {
        const groupQuestions = group.questions || [];
        
        groupQuestions.forEach((question) => {
          const transformed: TransformedQuestion = {
            id: question.id,
            type: question.question_type,
            question: question.question_text,
            audio_url: question.audio_url || undefined,
            image_url: question.image_url || group.image_url || undefined,
            reading_passage: question.reading_passage || undefined,
            points: question.points ? Number(question.points) : 1,
            question_group_id: group.id,
            question_group_title: group.group_title || undefined,
            passage_reference: group.passage_reference || undefined,
            options: question.question_options?.map((opt) => opt.option_text) || [],
            option_ids: question.question_options?.map((opt) => opt.id) || [],
          };
          questions.push(transformed);
        });
      });
    });

    return {
      id: test.id,
      title: test.title,
      description: test.description || "",
      section: firstSection.section_type,
      duration: firstSection.duration,
      total_questions: questions.length,
      instructions: firstSection.description || test.instructions || "",
      questions,
      test_result_id: startTestMutation.data.test_result_id,
      current_section_id: firstSection.id,
      current_section_type: firstSection.section_type,
    };
  }, [startTestMutation.data]);

  const quiz = transformedQuiz;
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const totalQuestions = quiz?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Get current question group info
  const getCurrentQuestionGroup = useMemo(() => {
    if (!quiz || !currentQuestion) return null;
    
    const currentGroupId = currentQuestion.question_group_id;
    if (!currentGroupId) return null;
    
    // Find all questions in the same group
    const groupQuestions = quiz.questions.filter(q => q.question_group_id === currentGroupId);
    const firstQuestionInGroup = groupQuestions[0];
    const groupIndex = quiz.questions.findIndex(q => q.id === firstQuestionInGroup.id);
    
    return {
      id: currentGroupId,
      title: currentQuestion.question_group_title,
      passage: currentQuestion.passage_reference,
      image: currentQuestion.image_url,
      startIndex: groupIndex,
      endIndex: groupIndex + groupQuestions.length - 1,
      isFirstInGroup: currentQuestionIndex === groupIndex,
    };
  }, [quiz, currentQuestion, currentQuestionIndex]);

  const currentGroup = getCurrentQuestionGroup;

  const handleSubmitQuizMemo = React.useCallback(async () => {
    if (!quiz || !testResultId || !currentSectionId || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeTaken = timeStarted ? Math.floor((Date.now() - timeStarted) / 1000) : 0;
      
      const answerSubmissions: TestAnswerSubmission[] = quiz.questions.map((q) => {
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
        test_section_id: currentSectionId,
        time_taken: timeTaken,
        answers: answerSubmissions,
      };

      await submitSectionMutation.mutateAsync(submissionData);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, testResultId, currentSectionId, isSubmitting, timeStarted, answers, submitSectionMutation]);

  useEffect(() => {
    if (!isStarted || isCompleted || timeRemaining <= 0 || !timeStarted) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timeStarted) / 1000);
      const remaining = (quiz?.duration || 0) * 60 - elapsed;
      
      if (remaining <= 0) {
        handleSubmitQuizMemo();
        return;
      }
      
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isCompleted, timeRemaining, timeStarted, quiz, handleSubmitQuizMemo]);

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

  const handleAnswerChange = (value: string | string[]) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmitQuiz = handleSubmitQuizMemo;

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
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
    toast.success("Quiz reset successfully!");
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const baseClasses = "space-y-4";
    const currentAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case "multiple_choice":
        return (
          <div className={baseClasses}>
            {/* Only show reading_passage if it's not already shown in group header */}
            {currentQuestion.reading_passage && !currentGroup?.passage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 whitespace-pre-line">
                  {currentQuestion.reading_passage}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line font-medium">
                {currentQuestion.question}
              </p>
            </div>
            <RadioGroup
              value={Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer || "")}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => {
                const optionValue = currentQuestion.option_ids?.[index] || String(index);
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem 
                      value={optionValue} 
                      id={`option-${index}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="cursor-pointer flex-1 text-sm leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case "fill_blank":
        return (
          <div className={baseClasses}>
            {/* Only show reading_passage if it's not already shown in group header */}
            {currentQuestion.reading_passage && !currentGroup?.passage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 whitespace-pre-line">
                  {currentQuestion.reading_passage}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line font-medium">
                {currentQuestion.question}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer-input" className="text-sm font-medium">
                Your Answer:
              </Label>
              <Input
                id="answer-input"
                value={Array.isArray(currentAnswer) 
                  ? currentAnswer.join(" ") 
                  : (currentAnswer as string) || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-3 border-2 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                Enter your answer exactly as requested in the question.
              </p>
            </div>
          </div>
        );

      case "true_false":
        return (
          <div className={baseClasses}>
            {/* Only show reading_passage if it's not already shown in group header */}
            {currentQuestion.reading_passage && !currentGroup?.passage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 whitespace-pre-line">
                  {currentQuestion.reading_passage}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line font-medium">
                {currentQuestion.question}
              </p>
            </div>
            <RadioGroup
              value={Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer as string) || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {["TRUE", "FALSE", "NOT GIVEN"].map((option) => (
                <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option} id={option.toLowerCase()} />
                  <Label htmlFor={option.toLowerCase()} className="cursor-pointer font-medium">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "matching":
        return (
          <div className={baseClasses}>
            {/* Only show reading_passage if it's not already shown in group header */}
            {currentQuestion.reading_passage && !currentGroup?.passage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 whitespace-pre-line">
                  {currentQuestion.reading_passage}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line font-medium">
                {currentQuestion.question}
              </p>
            </div>
            <RadioGroup
              value={Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer as string) || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => {
                const optionValue = currentQuestion.option_ids?.[index] || option;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={optionValue} id={`match-${index}`} />
                    <Label htmlFor={`match-${index}`} className="cursor-pointer font-medium">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case "essay":
        return (
          <div className={baseClasses}>
            {currentGroup?.image && (
              <div className="mb-4">
                <img 
                  src={currentGroup.image} 
                  alt="Task reference" 
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line font-medium">
                {currentQuestion.question}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="essay-answer" className="text-sm font-medium">
                Your Answer:
              </Label>
              <Textarea
                id="essay-answer"
                value={Array.isArray(currentAnswer) 
                  ? currentAnswer.join(" ") 
                  : (currentAnswer as string) || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your detailed answer here..."
                rows={12}
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
          </div>
        );

      case "speaking":
        return (
          <div className={baseClasses}>
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-orange-900 mb-2">Speaking Task</p>
              <p className="text-xs text-orange-700">
                {currentQuestion.question.includes("Describe") || currentQuestion.question.includes("Speak") 
                  ? "You have 1 minute to prepare and 2 minutes to speak"
                  : "Answer the question clearly and in detail"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line font-medium">
                {currentQuestion.question}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="speaking-answer" className="text-sm font-medium">
                Your Response (Practice):
              </Label>
              <Textarea
                id="speaking-answer"
                value={Array.isArray(currentAnswer) 
                  ? currentAnswer.join(" ") 
                  : (currentAnswer as string) || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your response here (for practice purposes)..."
                rows={6}
                className="w-full p-3 border-2 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">
                Note: In the actual IELTS test, you will speak your answer. This is for practice only.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className={baseClasses}>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-line font-medium">
                {currentQuestion.question}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="essay-answer" className="text-sm font-medium">
                Your Answer:
              </Label>
              <Textarea
                id="essay-answer"
                value={Array.isArray(currentAnswer) 
                  ? currentAnswer.join(" ") 
                  : (currentAnswer as string) || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your detailed answer here..."
                rows={8}
                className="w-full p-3 border-2 focus:border-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Write clearly and organize your thoughts</span>
                <span>{(Array.isArray(currentAnswer) ? currentAnswer.join(" ") : (currentAnswer as string) || "").length} characters</span>
              </div>
            </div>
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Quiz Info Card */}
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

            {/* Quiz Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Timer className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{quiz.duration}</p>
                <p className="text-sm text-blue-700">Minutes</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{quiz.total_questions}</p>
                <p className="text-sm text-green-700">Questions</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{quiz.questions.reduce((sum, q) => sum + q.points, 0)}</p>
                <p className="text-sm text-purple-700">Points</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Important Instructions
              </h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <p className="whitespace-pre-line">{quiz.instructions}</p>
              </div>
            </div>

            {/* Additional Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">✅ Before You Start:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Ensure you have a quiet environment</li>
                  <li>• Check your internet connection</li>
                  <li>• Have pen and paper ready</li>
                  <li>• Turn off notifications</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">⏰ During the Test:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Monitor your time carefully</li>
                  <li>• Flag difficult questions to review</li>
                  <li>• Read questions thoroughly</li>
                  <li>• Do not spend too long on one question</li>
                </ul>
              </div>
            </div>

            {/* Start Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Results Card */}
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
            {/* Score Summary */}
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

            {/* Performance Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600">Answered</p>
                  <p className="font-semibold">{answeredQuestions}/{totalQuestions}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600">Flagged</p>
                  <p className="font-semibold">{flaggedQuestions.size}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600">Time Used</p>
                  <p className="font-semibold">{formatTime((quiz.duration * 60) - timeRemaining)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-600">Section</p>
                  <p className="font-semibold capitalize">{quiz.section}</p>
                </div>
              </div>
            </div>

            {/* Band Score Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Your Band Score: {bandScore.toFixed(1)}</h4>
              <p className="text-sm text-blue-800">
                {bandScore >= 8.5 ? "Excellent! You have a very high level of English proficiency." :
                 bandScore >= 7.0 ? "Good work! You have a good command of English with some minor errors." :
                 bandScore >= 6.0 ? "Competent user. You have an effective command of English despite some inaccuracies." :
                 bandScore >= 5.0 ? "Modest user. You have a partial command of English and can cope with overall meaning." :
                 "Keep practicing! Focus on improving your English skills in this section."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => {/* Implement review answers */}}
                variant="outline"
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Review Answers
              </Button>
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

  if (!quiz || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setShowConfirmExit(true)}
              className="text-gray-600"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">{quiz.section.toUpperCase()} Section</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Progress */}
            <div className="text-center hidden sm:block">
              <p className="text-sm text-gray-600">Progress</p>
              <p className="font-semibold text-gray-900">
                {currentQuestionIndex + 1} / {totalQuestions}
              </p>
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">Time Remaining</p>
              <p className={cn("font-mono font-bold text-lg", getTimeColor())}>
                <Clock className="h-4 w-4 inline mr-1" />
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Question Panel */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1}</h2>
                  {currentQuestion.question_group_title && (
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.question_group_title}
                    </Badge>
                  )}
                  {flaggedQuestions.has(currentQuestion.id) && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                      <Flag className="h-3 w-3 mr-1" />
                      Flagged
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {currentQuestion.audio_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-xs"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      Audio
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFlag}
                    className={cn(
                      "text-xs",
                      flaggedQuestions.has(currentQuestion.id) 
                        ? "bg-yellow-50 text-yellow-700" 
                        : ""
                    )}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question Group Header (for Reading/Listening) */}
              {currentGroup && currentGroup.isFirstInGroup && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-900">
                      {currentGroup.title || `Questions ${currentGroup.startIndex + 1}-${currentGroup.endIndex + 1}`}
                    </h3>
                    <Badge className="bg-blue-600 text-white">
                      Questions {currentGroup.startIndex + 1}-{currentGroup.endIndex + 1}
                    </Badge>
                  </div>
                  {currentGroup.passage && (
                    <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {currentGroup.passage}
                      </p>
                    </div>
                  )}
                  {currentGroup.image && (
                    <div className="mt-4">
                      <img 
                        src={currentGroup.image} 
                        alt="Question reference" 
                        className="w-full rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Audio Player for Listening Questions */}
              {currentQuestion.audio_url && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Audio for this question</p>
                      <p className="text-xs text-blue-700">Click play to listen to the audio</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-white"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Question Content */}
              {renderQuestion()}

              {/* Question Info */}
              <Separator />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
                  </span>
                  {currentQuestion.time_limit && (
                    <span className="flex items-center space-x-1">
                      <Timer className="h-4 w-4" />
                      <span>~{Math.round(currentQuestion.time_limit / 60)} min</span>
                    </span>
                  )}
                </div>
                <span className="capitalize">{currentQuestion.type.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Panel */}
        <div className="w-full lg:w-80 p-6 bg-white border-l border-gray-200">
          <div className="space-y-6">
            {/* Question Navigation */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Question Navigation</h3>
              <div className="grid grid-cols-8 lg:grid-cols-5 gap-2">
                {quiz.questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(index)}
                    className={cn(
                      "w-10 h-10 rounded text-sm font-medium transition-colors",
                      index === currentQuestionIndex
                        ? "bg-blue-600 text-white"
                        : answers[q.id]
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : flaggedQuestions.has(q.id)
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-3">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                  Answered
                </span>
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
                  Flagged
                </span>
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
                  Skipped
                </span>
              </div>
            </div>

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

            {/* Navigation Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  size="sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

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
                    Submit Quiz ({Object.keys(answers).length}/{totalQuestions})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                    onBack?.();
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

export default QuizDetail;