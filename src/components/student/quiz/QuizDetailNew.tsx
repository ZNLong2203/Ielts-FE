"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, X, ArrowLeft, Loader2, BookOpen, FileText, Headphones, Mic } from "lucide-react";

import { startMockTest, submitSectionAnswers, TestSectionSubmission, TestAnswerSubmission, getTestResultReview } from "@/api/mockTest";
import { uploadAudio } from "@/api/file";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import QuizResults from "./QuizResults";
import QuizHeader from "./QuizHeader";
import PinnedPassagePanel from "./PinnedPassagePanel";
import QuizInstructions from "./QuizInstructions";
import QuizNavigation from "./QuizNavigation";
import QuizQuestionGroup from "./QuizQuestionGroup";
import QuizExercise from "./QuizExercise";
import TestResultReview from "./TestResultReview";
import GradingMethodDialog from "./GradingMethodDialog";
import PendingTeacherGrading from "./PendingTeacherGrading";

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
  matching_options?: Array<{
    id: string;
    option_text: string;
    ordering: number;
  }>;
}

interface Paragraph {
  id: string;
  label: string;
  content: string;
}

interface Exercise {
  id: string;
  title: string;
  instruction?: string;
  content?: string; // JSON string containing passage, image_url, audio_url, etc.
  audio_url?: string;
  passage?: string;
  passageTitle?: string;
  paragraphs?: Paragraph[];
  image_url?: string;
  question_groups: QuestionGroup[];
  total_questions: number;
}

interface TestSection {
  id: string;
  name: string;
  type: string;
  description?: string;
  duration: number;
  ordering: number;
  exercises: Exercise[];
  question_groups: QuestionGroup[]; // Keep for backward compatibility
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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showGradingMethodDialog, setShowGradingMethodDialog] = useState(false);
  const [selectedGradingMethod, setSelectedGradingMethod] = useState<'ai' | 'teacher' | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [showInstructions, setShowInstructions] = useState(false);
  const [sectionResult, setSectionResult] = useState<{
    band_score: number | null;
    correct_answers: number | null;
    total_questions: number;
    detailed_answers?: unknown;
    grading_method?: string;
    message?: string;
  } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [isPendingTeacherGrading, setIsPendingTeacherGrading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [pinnedPassageId, setPinnedPassageId] = useState<string | null>(null);
  const [pinnedImageUrl, setPinnedImageUrl] = useState<string | null>(null);
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(true);
  const questionRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Speaking question states
  const [speakingAudios, setSpeakingAudios] = useState<{ [key: string]: { blob: Blob; url: string } }>({});
  const [speakingRecording, setSpeakingRecording] = useState<{ [key: string]: boolean }>({});
  const mediaRecorderRefs = React.useRef<{ [key: string]: MediaRecorder | null }>({});
  const audioChunksRefs = React.useRef<{ [key: string]: Blob[] }>({});
  const streamRefs = React.useRef<{ [key: string]: MediaStream | null }>({});
  const fileInputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>({});

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
      const resultData = response.data;
      setSectionResult(resultData);
      
      // Check if this is teacher grading (pending)
      if (resultData.grading_method === 'teacher' && !resultData.band_score) {
        setIsPendingTeacherGrading(true);
        setIsCompleted(true);
        setIsStarted(false);
        toast.success(resultData.message || 'Your writing has been submitted for teacher grading. You will receive an email notification when grading is complete.', {
          duration: 6000,
        });
        setShowReview(false);
      } else {
        // AI grading - navigate to results page
        setIsPendingTeacherGrading(false);
        setIsCompleted(true);
        setIsStarted(false);
        toast.success(`Section completed! Band Score: ${resultData.band_score || 'N/A'}`, {
          duration: 5000,
        });
        setShowReview(false);
        
        // Save section result to sessionStorage for fallback
        if (resultData) {
          sessionStorage.setItem(`quiz-section-result-${testResultId}`, JSON.stringify(resultData));
        }
        
        // Navigate to results page
        if (testResultId && quizId) {
          router.push(`/student/dashboard/my-quizzes/${quizId}/results?resultId=${testResultId}`);
        }
      }
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || "Failed to submit answers");
      setIsSubmitting(false);
    },
  });

  // Fetch test result review when test is completed
  const { data: testResultReview, isLoading: isLoadingReview } = useQuery({
    queryKey: ["test-result-review", testResultId],
    queryFn: () => testResultId ? getTestResultReview(testResultId) : null,
    enabled: !!testResultId && isCompleted && showReview,
  });

  useEffect(() => {
    if (quizId && !startTestMutation.data && !startTestMutation.isPending) {
      // Use setTimeout to avoid calling mutation during render
      const timer = setTimeout(() => {
        startTestMutation.mutate(quizId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [quizId, startTestMutation]);

  // Cleanup audio URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(speakingAudios).forEach(audio => {
        if (audio?.url) {
          URL.revokeObjectURL(audio.url);
        }
      });
      // Stop any active recordings and streams
      Object.keys(mediaRecorderRefs.current).forEach(questionId => {
        const recorder = mediaRecorderRefs.current[questionId];
        if (recorder && recorder.state !== 'inactive') {
          recorder.stop();
        }
        const stream = streamRefs.current[questionId];
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      });
    };
  }, [speakingAudios]);

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
          id: string;
          title: string;
          instruction?: string | null;
          content?: string | null; // JSON string
          audio_url?: string | null;
          ordering: number;
          question_groups?: Array<{
            id: string;
            passage_reference?: string | null;
            group_title?: string | null;
            group_instruction?: string | null;
            image_url?: string | null;
            question_type: string;
            ordering: number;
            matching_options?: Array<{
              id: string;
              option_text: string;
              ordering: number;
            }>;
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
        const exercises: Exercise[] = [];
        const allQuestionGroups: QuestionGroup[] = [];
        
        section.exercises
          ?.sort((a, b) => a.ordering - b.ordering)
          .forEach((exercise) => {
            // Parse exercise content (JSON string)
            let exerciseContent: Record<string, unknown> = {};
            if (exercise.content) {
              try {
                exerciseContent = typeof exercise.content === 'string' 
                  ? JSON.parse(exercise.content) as Record<string, unknown>
                  : (exercise.content as Record<string, unknown>);
              } catch (e) {
                console.warn('Failed to parse exercise content:', e);
              }
            }

            const questionGroups: QuestionGroup[] = [];
            
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

                const groupData: QuestionGroup = {
                  id: group.id,
                  title: group.group_title || undefined,
                  instruction: group.group_instruction || undefined,
                  passage_reference: group.passage_reference || undefined,
                  image_url: group.image_url || undefined,
                  type: group.question_type,
                  questions,
                  matching_options: group.matching_options?.map(mo => ({
                    id: mo.id,
                    option_text: mo.option_text,
                    ordering: mo.ordering,
                  })),
                };

                questionGroups.push(groupData);
                allQuestionGroups.push(groupData);
              });

            const exerciseTotalQuestions = questionGroups.reduce((sum, g) => sum + g.questions.length, 0);

            // Extract reading passage data (for reading exercises)
            const readingPassage = exerciseContent.reading_passage as {
              title?: string;
              content?: string;
              paragraphs?: Array<{ id: string; label: string; content: string }>;
            } | undefined;

            exercises.push({
              id: exercise.id,
              title: exercise.title,
              instruction: exercise.instruction || undefined,
              content: exercise.content || undefined,
              audio_url: exercise.audio_url || (exerciseContent.audio_url as string) || undefined,
              passage: readingPassage?.content || (exerciseContent.passage as string) || undefined,
              passageTitle: readingPassage?.title || undefined,
              paragraphs: readingPassage?.paragraphs || undefined,
              image_url: (exerciseContent.chart_url as string) || (exerciseContent.image_url as string) || undefined,
              question_groups: questionGroups,
              total_questions: exerciseTotalQuestions,
            });
          });

        const totalQuestions = allQuestionGroups.reduce((sum, g) => sum + g.questions.length, 0);

        return {
          id: section.id,
          name: section.section_name,
          type: section.section_type,
          description: section.description,
          duration: section.duration,
          ordering: section.ordering,
          exercises: exercises,
          question_groups: allQuestionGroups, // Keep for backward compatibility
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

  const isQuestionAnswered = useCallback((questionId: string, questionType?: string) => {
    // For speaking questions, check if audio exists
    if (questionType === "speaking") {
      return !!speakingAudios[questionId];
    }
    // For other question types, check answers
    return !!answers[questionId];
  }, [answers, speakingAudios]);

  // Calculate total answered questions (including speaking)
  const answeredCount = useMemo(() => {
    if (!quiz) return 0;
    const allQuestions = quiz.sections.flatMap(s => 
      s.exercises && s.exercises.length > 0
        ? s.exercises.flatMap(e => e.question_groups.flatMap(g => g.questions))
        : s.question_groups.flatMap(g => g.questions) // Fallback for backward compatibility
    );
    return allQuestions.filter(q => isQuestionAnswered(q.id, q.type)).length;
  }, [quiz, isQuestionAnswered]);

  const proceedWithSubmission = useCallback(async (gradingMethod: 'ai' | 'teacher' = 'ai') => {
    if (!quiz || !testResultId || !currentSection || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeTaken = timeStarted ? Math.floor((Date.now() - timeStarted) / 1000) : 0;
      
      // Only submit questions from the current section, not all sections
      const currentSectionQuestions = currentSection.exercises && currentSection.exercises.length > 0
        ? currentSection.exercises.flatMap((e) =>
            e.question_groups.flatMap((g) => g.questions || [])
          )
        : currentSection.question_groups.flatMap((g) => g.questions || []); // Fallback
      
      // Debug: Log all answers before submission
      console.log('[Frontend] All answers before submission:', answers);
      console.log('[Frontend] Current section questions:', currentSectionQuestions.map(q => ({ id: q.id, type: q.type })));
      
      const answerSubmissions: TestAnswerSubmission[] = currentSectionQuestions.map((q) => {
        const userAnswer = answers[q.id];
        
        // Debug: Log each question's answer
        if (q.type === 'multiple_choice') {
          console.log(`[Frontend] Question ${q.id} (${q.type}): answer =`, userAnswer);
        }
        
        const answerData: {
          fill_blank_answers?: string;
          multiple_choice_answers?: string[];
          true_false_answers?: string;
          matching_answers?: string;
          essay_answers?: string;
        } = {};
        
        switch (q.type) {
          case "multiple_choice":
            const mcAnswer = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
            answerData.multiple_choice_answers = mcAnswer ? [mcAnswer] : [];
            console.log(`[Frontend] Question ${q.id} multiple_choice_answers:`, answerData.multiple_choice_answers);
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
          case "essay":
            answerData.essay_answers = Array.isArray(userAnswer) ? userAnswer.join(" ") : (userAnswer || "");
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
        grading_method: currentSection.type === "writing" ? gradingMethod : undefined,
      };

      // For speaking section, upload audio files first, then submit
      if (currentSection.type === "speaking") {
        const sectionQuestions = currentSection.question_groups.flatMap((g: any) => g.questions);
        const audioFilesToUpload: Array<{ questionId: string; blob: Blob; questionText: string }> = [];
        
        for (const q of sectionQuestions) {
          const audio = speakingAudios[q.id];
          if (audio?.blob) {
            audioFilesToUpload.push({
              questionId: q.id,
              blob: audio.blob,
              questionText: q.question,
            });
          }
        }
        
        // Validate that at least one question has audio
        if (audioFilesToUpload.length === 0) {
          toast.error("Please record or upload audio for at least one speaking question before submitting");
          setIsSubmitting(false);
          return;
        }

        // Upload all audio files in parallel
        toast.loading("Uploading audio files...", { id: "upload-audio" });
        try {
          const uploadPromises = audioFilesToUpload.map(async ({ questionId, blob, questionText }) => {
            const audioFile = new File([blob], `speaking-${questionId}.webm`, {
              type: blob.type || 'audio/webm',
            });
            const uploadResult = await uploadAudio(audioFile);
            
            if (!uploadResult || !uploadResult.url) {
              console.error('Invalid upload result:', uploadResult);
              throw new Error(`Failed to upload audio for question ${questionId}: Invalid response`);
            }
            
            const audioUrl = String(uploadResult.url);
            
            return {
              question_id: String(questionId),
              audio_url: audioUrl,
              question_text: String(questionText),
            };
          });

          const audioData = await Promise.all(uploadPromises);
          
          const validatedAudioData = audioData.map(item => {
            const audioUrl = item.audio_url ? String(item.audio_url) : '';
            if (!audioUrl) {
              console.error('Missing audio_url in item:', item);
            }
            return {
              question_id: String(item.question_id),
              audio_url: audioUrl,
              question_text: String(item.question_text),
            };
          });
          
          submissionData.speaking_audio_data = validatedAudioData;
          toast.success("Audio files uploaded successfully!", { id: "upload-audio" });
        } catch (error) {
          toast.error("Failed to upload audio files. Please try again.", { id: "upload-audio" });
          setIsSubmitting(false);
          return;
        }
      }

      await submitSectionMutation.mutateAsync(submissionData);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, testResultId, currentSection, isSubmitting, timeStarted, answers, submitSectionMutation, speakingAudios, isQuestionAnswered]);

  const handleSubmitQuiz = useCallback(async (skipConfirm = false) => {
    if (!quiz || !testResultId || !currentSection || isSubmitting) return;
    
    // Calculate answered count on the fly to avoid dependency issues
    const allQuestions = quiz.sections.flatMap(s => 
      s.exercises && s.exercises.length > 0
        ? s.exercises.flatMap(e => e.question_groups.flatMap(g => g.questions))
        : s.question_groups.flatMap(g => g.questions) // Fallback for backward compatibility
    );
    const currentAnsweredCount = allQuestions.filter(q => isQuestionAnswered(q.id, q.type)).length;
    const currentTotalQuestions = quiz.total_questions || 0;
    
    // Show confirmation if not all questions are answered and not skipping confirm
    if (!skipConfirm && currentAnsweredCount < currentTotalQuestions) {
      setShowSubmitConfirm(true);
      return;
    }
    
    // For writing section, always show grading method selection dialog (reset selected method for each submission)
    if (currentSection.type === "writing" && !skipConfirm) {
      setSelectedGradingMethod(null); // Reset to force showing dialog
      setShowGradingMethodDialog(true);
      return;
    }
    
    // Proceed with submission using selected grading method (default to 'ai' if not set)
    proceedWithSubmission(selectedGradingMethod || 'ai');
  }, [quiz, testResultId, currentSection, isSubmitting, isQuestionAnswered, selectedGradingMethod, proceedWithSubmission]);

  useEffect(() => {
    if (!isStarted || isCompleted || !timeStarted) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timeStarted) / 1000);
      const remaining = (quiz?.duration || 0) * 60 - elapsed;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        handleSubmitQuiz(true); // Skip confirmation when time runs out
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
    
    // Cleanup speaking audio URLs to prevent memory leaks
    Object.values(speakingAudios).forEach(audio => {
      if (audio?.url) {
        URL.revokeObjectURL(audio.url);
      }
    });
    setSpeakingAudios({});
    setSpeakingRecording({});
    // Stop any active recordings and streams
    Object.keys(mediaRecorderRefs.current).forEach(questionId => {
      const recorder = mediaRecorderRefs.current[questionId];
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      const stream = streamRefs.current[questionId];
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });
    mediaRecorderRefs.current = {};
    audioChunksRefs.current = {};
    streamRefs.current = {};
    
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

  // Speaking question handlers
  const startSpeakingRecording = async (questionId: string) => {
    try {
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Your browser does not support audio recording. Please use a modern browser.');
        return;
      }

      // Check if MediaRecorder is available
      if (typeof MediaRecorder === 'undefined') {
        toast.error('MediaRecorder is not supported in your browser.');
        return;
      }

      // Stop any existing recording for this question
      const existingRecorder = mediaRecorderRefs.current[questionId];
      const existingStream = streamRefs.current[questionId];
      if (existingRecorder && existingRecorder.state !== 'inactive') {
        existingRecorder.stop();
      }
      if (existingStream) {
        existingStream.getTracks().forEach(track => track.stop());
        streamRefs.current[questionId] = null;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Store stream reference
      streamRefs.current[questionId] = stream;
      
      // Check if MediaRecorder supports the stream's codec
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          // Use default
          mimeType = '';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRefs.current[questionId] = mediaRecorder;
      audioChunksRefs.current[questionId] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRefs.current[questionId].push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Recording error occurred. Please try again.');
        setSpeakingRecording(prev => ({ ...prev, [questionId]: false }));
        if (streamRefs.current[questionId]) {
          streamRefs.current[questionId]?.getTracks().forEach(track => track.stop());
          streamRefs.current[questionId] = null;
        }
      };

      mediaRecorder.onstop = () => {
        const chunks = audioChunksRefs.current[questionId];
        if (chunks && chunks.length > 0) {
          const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setSpeakingAudios(prev => ({ ...prev, [questionId]: { blob, url } }));
        }
        if (streamRefs.current[questionId]) {
          streamRefs.current[questionId]?.getTracks().forEach(track => track.stop());
          streamRefs.current[questionId] = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setSpeakingRecording(prev => ({ ...prev, [questionId]: true }));
    } catch (err: any) {
      console.error('Error starting recording:', err);
      
      // Handle specific error types
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        toast.error('Microphone is already in use by another application. Please close it and try again.');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        toast.error('Microphone does not meet the required constraints. Please try a different microphone.');
      } else {
        toast.error(`Failed to start recording: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const stopSpeakingRecording = (questionId: string) => {
    const mediaRecorder = mediaRecorderRefs.current[questionId];
    if (mediaRecorder && speakingRecording[questionId]) {
      mediaRecorder.stop();
      setSpeakingRecording(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleSpeakingFileUpload = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSpeakingAudios(prev => ({ ...prev, [questionId]: { blob: file, url } }));
    }
  };

  const clearSpeakingAudio = (questionId: string) => {
    const audio = speakingAudios[questionId];
    if (audio?.url) {
      URL.revokeObjectURL(audio.url);
    }
    setSpeakingAudios(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
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

  if (showInstructions && !isCompleted) {
    // Ensure quiz exists and has all required properties
    if (!quiz) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading quiz information...</p>
          </div>
        </div>
      );
    }

    const quizForInstructions = {
      title: quiz.title || "IELTS Test",
      section: quiz.section || quiz.sections?.[0]?.type || "reading",
      description: quiz.description || "",
      instructions: quiz.instructions || "",
    };
    
    return (
      <QuizInstructions
        quiz={quizForInstructions}
        onBack={() => {
          if (onBack) {
            onBack();
          } else {
            router.push("/student/dashboard/my-quizzes");
          }
        }}
        onStart={handleStartQuiz}
      />
    );
  }

  // Show detailed review if available and loaded
  if (isCompleted && showReview && testResultReview && testResultId && !isLoadingReview) {
    return (
      <TestResultReview
        testResult={testResultReview}
        onBack={() => {
          setShowReview(false);
          if (onBack) {
            onBack();
          } else {
            router.push("/student/dashboard/my-quizzes");
          }
        }}
      />
    );
  }

  // Show pending teacher grading message if writing was submitted for teacher grading
  if (isCompleted && isPendingTeacherGrading && quiz && currentSection) {
    return (
      <PendingTeacherGrading
        quizTitle={quiz.title}
        sectionName={currentSection.name || "Writing Section"}
        onBack={() => {
          if (onBack) {
            onBack();
          } else {
            router.push("/student/dashboard/my-quizzes");
          }
        }}
      />
    );
  }

  // Note: Results are now shown in a separate results page
  // This check is kept for pending teacher grading or when navigation hasn't happened yet
  if (isCompleted && sectionResult && quiz && currentSection && !isPendingTeacherGrading) {
    // Show loading state while navigating
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading results...</p>
        </div>
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
  const allQuestions = quiz.sections.flatMap((s, si) => {
    if (s.exercises && s.exercises.length > 0) {
      // New structure: exercises -> question_groups -> questions
      return s.exercises.flatMap((e, ei) =>
        e.question_groups.flatMap((g, gi) =>
          g.questions.map((q, qi) => ({ 
            question: q, 
            sectionIndex: si, 
            exerciseIndex: ei,
            groupIndex: gi, 
            questionIndex: qi 
          }))
        )
      );
    } else {
      // Fallback: question_groups -> questions (backward compatibility)
      return s.question_groups.flatMap((g, gi) =>
        g.questions.map((q, qi) => ({ 
          question: q, 
          sectionIndex: si, 
          groupIndex: gi, 
          questionIndex: qi 
        }))
      );
    }
  });

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      (pinnedPassageId || pinnedImageUrl) && "fixed inset-0 z-50 bg-gray-50"
    )}>
      {/* Header */}
      <QuizHeader
        quizTitle={quiz.title}
        sectionName={currentSection.name}
        timeRemaining={timeRemaining}
        onExit={() => {
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
        isPinned={!!(pinnedPassageId || pinnedImageUrl)}
      />

      {/* Main Content */}
      {(pinnedPassageId || pinnedImageUrl) ? (
        // Layout khi có pinned item - Full screen
        <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)]">
          {/* Pinned Passage/Image Panel - Left Side 50% */}
          <PinnedPassagePanel
            pinnedPassageId={pinnedPassageId}
            pinnedImageUrl={pinnedImageUrl}
            currentSection={currentSection}
            currentExercise={currentSection.exercises && currentSection.exercises.length > 0 
              ? currentSection.exercises[currentExerciseIndex] 
              : null}
            onUnpin={() => {
              setPinnedPassageId(null);
              setPinnedImageUrl(null);
            }}
          />

          {/* Section Content - Right Side with Questions */}
          <div className="flex-1 flex flex-col overflow-hidden lg:w-1/2">
            <div className="flex-1 overflow-y-auto p-6">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{currentSection.name}</CardTitle>
                    <Badge className="bg-blue-600 text-white">
                      {currentSection.exercises && currentSection.exercises.length > 0
                        ? `Section ${currentExerciseIndex + 1} of ${currentSection.exercises.length}`
                        : `Section ${currentSectionIndex + 1} of ${quiz.sections.length}`}
                    </Badge>
                  </div>
                  {currentSection.description && (
                    <p className="text-sm text-gray-600 mt-2">{currentSection.description}</p>
                  )}
                </CardHeader>

              <CardContent className="space-y-8">
                {currentSection.exercises && currentSection.exercises.length > 0 ? (
                  (() => {
                    const currentExercise = currentSection.exercises[currentExerciseIndex];
                    if (!currentExercise) return null;
                    return (
                      <QuizExercise
                        key={currentExercise.id}
                        exercise={currentExercise}
                        exerciseIndex={currentExerciseIndex}
                        currentAnswer={(questionId) => answers[questionId]}
                        flaggedQuestions={flaggedQuestions}
                        selectedQuestionId={selectedQuestionId}
                        onAnswerChange={(questionId, answer) => {
                          console.log(`[Frontend] Answer changed for question ${questionId}:`, answer);
                          setAnswers((prev) => {
                            const updated = { ...prev, [questionId]: answer };
                            console.log(`[Frontend] Updated answers state:`, updated);
                            return updated;
                          });
                        }}
                        onToggleFlag={toggleFlag}
                        onPinPassage={(passageId) =>
                          setPinnedPassageId(passageId || null)
                        }
                        onPinImage={setPinnedImageUrl}
                        pinnedPassageId={pinnedPassageId}
                        pinnedImageUrl={pinnedImageUrl}
                        questionRefs={questionRefs}
                        speakingAudios={speakingAudios}
                        speakingRecording={speakingRecording}
                        onStartRecording={startSpeakingRecording}
                        onStopRecording={stopSpeakingRecording}
                        onFileUpload={handleSpeakingFileUpload}
                        onClearAudio={clearSpeakingAudio}
                        fileInputRefs={fileInputRefs}
                        isLastExercise={false}
                      />
                    );
                  })()
                ) : (
                  // Fallback: Display by question_groups (backward compatibility)
                  currentSection.question_groups.map((group, groupIndex) => (
                    <QuizQuestionGroup
                      key={group.id}
                      group={group}
                      groupIndex={groupIndex}
                      currentAnswer={(questionId) => answers[questionId]}
                      flaggedQuestions={flaggedQuestions}
                      selectedQuestionId={selectedQuestionId}
                      onAnswerChange={(questionId, answer) => {
                        console.log(`[Frontend] Answer changed for question ${questionId}:`, answer);
                        setAnswers((prev) => {
                          const updated = { ...prev, [questionId]: answer };
                          console.log(`[Frontend] Updated answers state:`, updated);
                          return updated;
                        });
                      }}
                      onToggleFlag={toggleFlag}
                      onPinImage={setPinnedImageUrl}
                      pinnedImageUrl={pinnedImageUrl}
                      questionRefs={questionRefs}
                      speakingAudios={speakingAudios}
                      speakingRecording={speakingRecording}
                      onStartRecording={startSpeakingRecording}
                      onStopRecording={stopSpeakingRecording}
                      onFileUpload={handleSpeakingFileUpload}
                      onClearAudio={clearSpeakingAudio}
                      fileInputRefs={fileInputRefs}
                      isLastGroup={
                        groupIndex === currentSection.question_groups.length - 1
                      }
                    />
                  ))
                )}
              </CardContent>
              </Card>
            </div>

            {/* Navigation Panel - Bottom */}
            <QuizNavigation
              sections={quiz.sections}
              allQuestions={allQuestions}
              currentSectionIndex={currentSectionIndex}
              currentExerciseIndex={currentExerciseIndex}
              answeredCount={answeredCount}
              totalQuestions={totalQuestions}
              flaggedQuestions={flaggedQuestions}
              isSubmitting={isSubmitting}
              isNavigationExpanded={isNavigationExpanded}
              isQuestionAnswered={isQuestionAnswered}
              onSectionChange={(index) => {
                setCurrentSectionIndex(index);
                setCurrentExerciseIndex(0); // Reset to first exercise when changing section
                setPinnedPassageId(null);
                setPinnedImageUrl(null);
              }}
              onExerciseChange={(sectionIndex, exerciseIndex) => {
                setCurrentSectionIndex(sectionIndex);
                setCurrentExerciseIndex(exerciseIndex);
                setPinnedPassageId(null);
                setPinnedImageUrl(null);
              }}
              onQuestionClick={(questionId, sectionIndex) => {
                setCurrentSectionIndex(sectionIndex);
                // Find which exercise contains this question
                const section = quiz.sections[sectionIndex];
                if (section?.exercises && section.exercises.length > 0) {
                  const exerciseIndex = section.exercises.findIndex(ex =>
                    ex.question_groups.some(g => g.questions.some(q => q.id === questionId))
                  );
                  if (exerciseIndex >= 0) {
                    setCurrentExerciseIndex(exerciseIndex);
                  }
                }
                setPinnedPassageId(null);
                setPinnedImageUrl(null);
                setTimeout(() => scrollToQuestion(questionId), 100);
              }}
              onSubmit={() => handleSubmitQuiz()}
              onToggleNavigation={() => setIsNavigationExpanded(!isNavigationExpanded)}
              isPinned={true}
            />
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
                  {currentSection.exercises && currentSection.exercises.length > 0
                    ? `Section ${currentExerciseIndex + 1} of ${currentSection.exercises.length}`
                    : `Section ${currentSectionIndex + 1} of ${quiz.sections.length}`}
                </Badge>
                </div>
                {currentSection.description && (
                  <p className="text-sm text-gray-600 mt-2">{currentSection.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-8">
                {currentSection.exercises && currentSection.exercises.length > 0 ? (
                  // Display only current exercise (new structure)
                  (() => {
                    const currentExercise = currentSection.exercises[currentExerciseIndex];
                    if (!currentExercise) return null;
                    return (
                      <QuizExercise
                        key={currentExercise.id}
                        exercise={currentExercise}
                        exerciseIndex={currentExerciseIndex}
                        currentAnswer={(questionId) => answers[questionId]}
                        flaggedQuestions={flaggedQuestions}
                        selectedQuestionId={selectedQuestionId}
                        onAnswerChange={(questionId, answer) =>
                          setAnswers((prev) => ({ ...prev, [questionId]: answer }))
                        }
                        onToggleFlag={toggleFlag}
                        onPinPassage={(passageId) =>
                          setPinnedPassageId(passageId || null)
                        }
                        onPinImage={setPinnedImageUrl}
                        pinnedPassageId={pinnedPassageId}
                        pinnedImageUrl={pinnedImageUrl}
                        questionRefs={questionRefs}
                        speakingAudios={speakingAudios}
                        speakingRecording={speakingRecording}
                        onStartRecording={startSpeakingRecording}
                        onStopRecording={stopSpeakingRecording}
                        onFileUpload={handleSpeakingFileUpload}
                        onClearAudio={clearSpeakingAudio}
                        fileInputRefs={fileInputRefs}
                        isLastExercise={false}
                      />
                    );
                  })()
                ) : (
                  // Fallback: Display by question_groups (backward compatibility)
                  currentSection.question_groups.map((group, groupIndex) => (
                    <QuizQuestionGroup
                      key={group.id}
                      group={group}
                      groupIndex={groupIndex}
                      currentAnswer={(questionId) => answers[questionId]}
                      flaggedQuestions={flaggedQuestions}
                      selectedQuestionId={selectedQuestionId}
                      onAnswerChange={(questionId, answer) =>
                        setAnswers((prev) => ({ ...prev, [questionId]: answer }))
                      }
                      onToggleFlag={toggleFlag}
                      onPinImage={setPinnedImageUrl}
                      pinnedImageUrl={pinnedImageUrl}
                      questionRefs={questionRefs}
                      speakingAudios={speakingAudios}
                      speakingRecording={speakingRecording}
                      onStartRecording={startSpeakingRecording}
                      onStopRecording={stopSpeakingRecording}
                      onFileUpload={handleSpeakingFileUpload}
                      onClearAudio={clearSpeakingAudio}
                      fileInputRefs={fileInputRefs}
                      isLastGroup={
                        groupIndex === currentSection.question_groups.length - 1
                      }
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navigation Panel */}
          <QuizNavigation
            sections={quiz.sections}
            allQuestions={allQuestions}
            currentSectionIndex={currentSectionIndex}
            currentExerciseIndex={currentExerciseIndex}
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            flaggedQuestions={flaggedQuestions}
            isSubmitting={isSubmitting}
            isNavigationExpanded={isNavigationExpanded}
            isQuestionAnswered={isQuestionAnswered}
            onSectionChange={(index) => {
              setCurrentSectionIndex(index);
              setCurrentExerciseIndex(0); // Reset to first exercise when changing section
              setPinnedPassageId(null);
              setPinnedImageUrl(null);
            }}
            onExerciseChange={(sectionIndex, exerciseIndex) => {
              setCurrentSectionIndex(sectionIndex);
              setCurrentExerciseIndex(exerciseIndex);
              setPinnedPassageId(null);
              setPinnedImageUrl(null);
            }}
            onQuestionClick={(questionId, sectionIndex) => {
              setCurrentSectionIndex(sectionIndex);
              // Find which exercise contains this question
              const section = quiz.sections[sectionIndex];
              if (section?.exercises && section.exercises.length > 0) {
                const exerciseIndex = section.exercises.findIndex(ex =>
                  ex.question_groups.some(g => g.questions.some(q => q.id === questionId))
                );
                if (exerciseIndex >= 0) {
                  setCurrentExerciseIndex(exerciseIndex);
                }
              }
              setPinnedPassageId(null);
              setPinnedImageUrl(null);
              setTimeout(() => scrollToQuestion(questionId), 100);
            }}
            onSubmit={() => handleSubmitQuiz()}
            onToggleNavigation={() => setIsNavigationExpanded(!isNavigationExpanded)}
            isPinned={false}
          />
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                Incomplete Test Submission
              </AlertDialogTitle>
            </div>
            <div className="text-gray-600 space-y-3 pt-2">
              <p>
                You have answered <span className="font-semibold text-orange-600">{answeredCount} out of {totalQuestions}</span> questions.
              </p>
              <p>
                Are you sure you want to submit your test now? You will not be able to make any changes after submission.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Unanswered questions will be marked as incorrect.
                </p>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Continue Test
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSubmitConfirm(false);
                handleSubmitQuiz(true);
              }}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
            >
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grading Method Selection Dialog for Writing */}
      <GradingMethodDialog
        open={showGradingMethodDialog}
        onOpenChange={(open) => {
          setShowGradingMethodDialog(open);
          if (!open) {
            setSelectedGradingMethod(null); // Reset when dialog closes without selection
          }
        }}
        onSelect={(method) => {
          setSelectedGradingMethod(method);
          proceedWithSubmission(method);
        }}
      />

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

