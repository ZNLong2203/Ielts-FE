"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  getWritingSubmissionForGrading,
  submitWritingGrading,
  SubmitGradingDto,
  WritingSubmissionDetail,
} from "@/api/mockTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Save, User, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const WritingGradingDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sectionResultId = params.sectionResultId as string;

  const [task1Score, setTask1Score] = useState<number>(0);
  const [task1TaskAchievement, setTask1TaskAchievement] = useState<number>(0);
  const [task1CoherenceCohesion, setTask1CoherenceCohesion] = useState<number>(0);
  const [task1LexicalResource, setTask1LexicalResource] = useState<number>(0);
  const [task1GrammaticalRange, setTask1GrammaticalRange] = useState<number>(0);
  const [task1Feedback, setTask1Feedback] = useState<string>("");

  const [task2Score, setTask2Score] = useState<number>(0);
  const [task2TaskAchievement, setTask2TaskAchievement] = useState<number>(0);
  const [task2CoherenceCohesion, setTask2CoherenceCohesion] = useState<number>(0);
  const [task2LexicalResource, setTask2LexicalResource] = useState<number>(0);
  const [task2GrammaticalRange, setTask2GrammaticalRange] = useState<number>(0);
  const [task2Feedback, setTask2Feedback] = useState<string>("");

  const [generalFeedback, setGeneralFeedback] = useState<string>("");

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ["writingSubmission", sectionResultId],
    queryFn: () => getWritingSubmissionForGrading(sectionResultId),
  });

  const submitMutation = useMutation({
    mutationFn: (gradingData: SubmitGradingDto) =>
      submitWritingGrading(sectionResultId, gradingData),
    onSuccess: () => {
      toast.success("Grading submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["pendingWritingSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["gradedWritingSubmissions"] });
      router.push("/teacher/dashboard/writing-grading");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to submit grading");
    },
  });

  // Parse response - backend returns {success: true, data: {...}}
  const submissionData = submission 
    ? ((submission as { data?: WritingSubmissionDetail } & WritingSubmissionDetail)?.data || (submission as WritingSubmissionDetail))
    : null;

  // Parse detailed_answers - it might be a JSON string or object
  interface DetailedAnswers {
    tasks?: Array<{
      task_type: string;
      question_id: string;
      question_text?: string;
      student_answer?: string;
      word_count?: number;
      image_url?: string;
      overall_score?: number;
      task_achievement_score?: number;
      coherence_cohesion_score?: number;
      lexical_resource_score?: number;
      grammatical_range_accuracy_score?: number;
      detailed_feedback?: string;
    }>;
    overallScore?: number;
    teacher_feedback?: string;
  }

  let detailedAnswers: DetailedAnswers | null = null;
  if (submissionData?.detailed_answers) {
    if (typeof submissionData.detailed_answers === 'string') {
      try {
        detailedAnswers = JSON.parse(submissionData.detailed_answers) as DetailedAnswers;
      } catch (e) {
        console.error("Failed to parse detailed_answers:", e);
      }
    } else {
      detailedAnswers = submissionData.detailed_answers as DetailedAnswers;
    }
  }

  const tasks = detailedAnswers?.tasks || [];
  const task1 = tasks.find((t) => t.task_type === "task_1");
  const task2 = tasks.find((t) => t.task_type === "task_2");

  // Check if submission is already graded
  const isGraded = submissionData?.graded_at != null;
  const bandScore = submissionData?.band_score || submissionData?.teacher_score;
  const generalFeedbackText = submissionData?.teacher_feedback || detailedAnswers?.teacher_feedback;

  // Load existing scores and feedback if already graded
  useEffect(() => {
    if (isGraded && detailedAnswers) {
      if (task1) {
        setTask1Score(task1.overall_score || 0);
        setTask1TaskAchievement(task1.task_achievement_score || 0);
        setTask1CoherenceCohesion(task1.coherence_cohesion_score || 0);
        setTask1LexicalResource(task1.lexical_resource_score || 0);
        setTask1GrammaticalRange(task1.grammatical_range_accuracy_score || 0);
        setTask1Feedback(task1.detailed_feedback || "");
      }
      if (task2) {
        setTask2Score(task2.overall_score || 0);
        setTask2TaskAchievement(task2.task_achievement_score || 0);
        setTask2CoherenceCohesion(task2.coherence_cohesion_score || 0);
        setTask2LexicalResource(task2.lexical_resource_score || 0);
        setTask2GrammaticalRange(task2.grammatical_range_accuracy_score || 0);
        setTask2Feedback(task2.detailed_feedback || "");
      }
      if (generalFeedbackText) {
        setGeneralFeedback(generalFeedbackText);
      }
    }
  }, [isGraded, detailedAnswers, task1, task2, generalFeedbackText]);

  const handleSubmit = () => {
    if (!task1Score || !task2Score) {
      toast.error("Please provide scores for both tasks");
      return;
    }

    const gradingData: SubmitGradingDto = {
      task1_score: task1Score,
      task1_task_achievement: task1TaskAchievement || undefined,
      task1_coherence_cohesion: task1CoherenceCohesion || undefined,
      task1_lexical_resource: task1LexicalResource || undefined,
      task1_grammatical_range_accuracy: task1GrammaticalRange || undefined,
      task1_feedback: task1Feedback || undefined,
      task2_score: task2Score,
      task2_task_achievement: task2TaskAchievement || undefined,
      task2_coherence_cohesion: task2CoherenceCohesion || undefined,
      task2_lexical_resource: task2LexicalResource || undefined,
      task2_grammatical_range_accuracy: task2GrammaticalRange || undefined,
      task2_feedback: task2Feedback || undefined,
      general_feedback: generalFeedback || undefined,
    };

    submitMutation.mutate(gradingData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !submission || !submissionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load submission</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  console.log("[WritingGradingDetailPage] Raw submission:", submission);
  console.log("[WritingGradingDetailPage] Parsed submissionData:", submissionData);
  console.log("[WritingGradingDetailPage] detailed_answers:", submissionData.detailed_answers);
  console.log("[WritingGradingDetailPage] test_sections:", submissionData.test_sections);

  // Get questions from exercises to display full question text
  interface Question {
    id: string;
    question_text?: string;
    image_url?: string;
  }

  interface QuestionGroup {
    questions?: Question[];
    image_url?: string;
  }

  interface Exercise {
    question_groups?: QuestionGroup[];
    content?: string | {
      questionImage?: string;
      chart_url?: string;
      image_url?: string;
    };
  }

  const exercises = (submissionData.test_sections?.exercises || []) as Exercise[];
  const allQuestions = exercises.flatMap((ex) =>
    ex.question_groups?.flatMap((qg) => qg.questions || []) || []
  );

  // Match tasks with questions to get full question details
  const task1Question = task1
    ? allQuestions.find((q) => q.id === task1.question_id)
    : null;
  const task2Question = task2
    ? allQuestions.find((q) => q.id === task2.question_id)
    : null;

  const getTask1ImageUrl = (): string | undefined => {
    if (!task1Question) {
      return undefined;
    }

    let questionGroup: QuestionGroup | undefined;
    let exercise: Exercise | undefined;

    for (const ex of exercises) {
      for (const qg of ex.question_groups || []) {
        if (qg.questions?.some((q) => q.id === task1Question.id)) {
          questionGroup = qg;
          exercise = ex;
          break;
        }
      }
      if (questionGroup) break;
    }

    if (questionGroup?.image_url) {
      return questionGroup.image_url;
    }

    if (exercise?.content) {
      try {
        const exerciseContent =
          typeof exercise.content === 'string'
            ? JSON.parse(exercise.content)
            : exercise.content;
        
        if (exerciseContent.questionImage) {
          return exerciseContent.questionImage;
        }
        if (exerciseContent.chart_url) {
          return exerciseContent.chart_url;
        }
        if (exerciseContent.image_url) {
          return exerciseContent.image_url;
        }
      } catch (e) {
        console.warn("Failed to parse exercise content for imageUrl:", e);
      }
    }

    if (task1Question.image_url) {
      return task1Question.image_url;
    }

    if (task1?.image_url) {
      return task1.image_url;
    }

    return undefined;
  };

  const task1ImageUrl = getTask1ImageUrl();

  console.log("[WritingGradingDetailPage] Detailed answers parsed:", detailedAnswers);
  console.log("[WritingGradingDetailPage] Tasks:", tasks);
  console.log("[WritingGradingDetailPage] Task1:", task1);
  console.log("[WritingGradingDetailPage] Task2:", task2);
  console.log("[WritingGradingDetailPage] All questions:", allQuestions);
  console.log("[WritingGradingDetailPage] Task1 question:", task1Question);
  console.log("[WritingGradingDetailPage] Task2 question:", task2Question);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isGraded ? "View Writing Submission" : "Grade Writing Submission"}
        </h1>
        {isGraded && bandScore != null && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-600">Overall Band Score:</span>
                <span className="ml-2 text-2xl font-bold text-green-600">
                  {typeof bandScore === 'number' 
                    ? bandScore.toFixed(1)
                    : parseFloat(String(bandScore)).toFixed(1)}
                </span>
              </div>
              {(submissionData as WritingSubmissionDetail).graded_at && (
                <div className="text-sm text-gray-600">
                  Graded on: {format(new Date((submissionData as WritingSubmissionDetail).graded_at!), "MMM dd, yyyy 'at' HH:mm")}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{submissionData.test_results?.users?.full_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{submissionData.test_results?.mock_tests?.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>
              {submissionData.created_at
                ? `Submitted ${format(new Date(submissionData.created_at), "MMM dd, yyyy 'at' HH:mm")}`
                : "Submitted recently"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs for Task 1 and Task 2 */}
      <Tabs defaultValue="task1" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="task1" className="text-base font-medium">
            Task 1
          </TabsTrigger>
          <TabsTrigger value="task2" className="text-base font-medium">
            Task 2
          </TabsTrigger>
        </TabsList>

        {/* Task 1 Tab */}
        <TabsContent value="task1">
          {task1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Task 1</CardTitle>
                <CardDescription>
                  {task1Question?.question_text || task1.question_text || "Writing Task 1"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question/Image Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Question / Task Instructions</Label>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {task1Question?.question_text || task1.question_text || "No question text available"}
                      </p>
                      {task1ImageUrl && (
                        <div className="mt-4">
                          <img
                            src={task1ImageUrl}
                            alt="Task 1 Image"
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Answer Section */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">Student Answer</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border min-h-[200px] whitespace-pre-wrap text-gray-800">
                    {task1.student_answer || "No answer submitted"}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Word count: {task1.word_count || 0}
                  </p>
                </div>

                {/* Scores Section */}
                {isGraded ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-3">Task 1 Scores</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Overall Score</Label>
                          <div className="text-lg font-bold text-green-600">
                            {task1Score ? (typeof task1Score === 'number' ? task1Score.toFixed(1) : parseFloat(String(task1Score)).toFixed(1)) : "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Task Achievement</Label>
                          <div className="text-lg font-semibold">
                            {task1TaskAchievement || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Coherence & Cohesion</Label>
                          <div className="text-lg font-semibold">
                            {task1CoherenceCohesion || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Lexical Resource</Label>
                          <div className="text-lg font-semibold">
                            {task1LexicalResource || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Grammatical Range & Accuracy</Label>
                          <div className="text-lg font-semibold">
                            {task1GrammaticalRange || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {task1Feedback && (
                      <div>
                        <Label className="text-base font-semibold mb-2 block">Feedback</Label>
                        <div className="p-4 bg-gray-50 rounded-lg border min-h-[100px] whitespace-pre-wrap text-gray-800">
                          {task1Feedback}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Overall Score (0-9) *</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task1Score || ""}
                          onChange={(e) => setTask1Score(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Task Achievement</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task1TaskAchievement || ""}
                          onChange={(e) => setTask1TaskAchievement(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Coherence & Cohesion</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task1CoherenceCohesion || ""}
                          onChange={(e) => setTask1CoherenceCohesion(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Lexical Resource</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task1LexicalResource || ""}
                          onChange={(e) => setTask1LexicalResource(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Grammatical Range & Accuracy</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task1GrammaticalRange || ""}
                          onChange={(e) => setTask1GrammaticalRange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Feedback</Label>
                      <Textarea
                        value={task1Feedback}
                        onChange={(e) => setTask1Feedback(e.target.value)}
                        rows={4}
                        placeholder="Provide detailed feedback for Task 1..."
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No Task 1 submission found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Task 2 Tab */}
        <TabsContent value="task2">
          {task2 ? (
            <Card>
              <CardHeader>
                <CardTitle>Task 2</CardTitle>
                <CardDescription>
                  {task2Question?.question_text || task2.question_text || "Writing Task 2"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Question / Task Instructions</Label>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {task2Question?.question_text || task2.question_text || "No question text available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Answer Section */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">Student Answer</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border min-h-[200px] whitespace-pre-wrap text-gray-800">
                    {task2.student_answer || "No answer submitted"}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Word count: {task2.word_count || 0}
                  </p>
                </div>

                {/* Scores Section */}
                {isGraded ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-3">Task 2 Scores</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Overall Score</Label>
                          <div className="text-lg font-bold text-green-600">
                            {task2Score ? (typeof task2Score === 'number' ? task2Score.toFixed(1) : parseFloat(String(task2Score)).toFixed(1)) : "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Task Achievement</Label>
                          <div className="text-lg font-semibold">
                            {task2TaskAchievement || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Coherence & Cohesion</Label>
                          <div className="text-lg font-semibold">
                            {task2CoherenceCohesion || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Lexical Resource</Label>
                          <div className="text-lg font-semibold">
                            {task2LexicalResource || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Grammatical Range & Accuracy</Label>
                          <div className="text-lg font-semibold">
                            {task2GrammaticalRange || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {task2Feedback && (
                      <div>
                        <Label className="text-base font-semibold mb-2 block">Feedback</Label>
                        <div className="p-4 bg-gray-50 rounded-lg border min-h-[100px] whitespace-pre-wrap text-gray-800">
                          {task2Feedback}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Overall Score (0-9) *</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task2Score || ""}
                          onChange={(e) => setTask2Score(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Task Achievement</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task2TaskAchievement || ""}
                          onChange={(e) => setTask2TaskAchievement(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Coherence & Cohesion</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task2CoherenceCohesion || ""}
                          onChange={(e) => setTask2CoherenceCohesion(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Lexical Resource</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task2LexicalResource || ""}
                          onChange={(e) => setTask2LexicalResource(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Grammatical Range & Accuracy</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={task2GrammaticalRange || ""}
                          onChange={(e) => setTask2GrammaticalRange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Feedback</Label>
                      <Textarea
                        value={task2Feedback}
                        onChange={(e) => setTask2Feedback(e.target.value)}
                        rows={4}
                        placeholder="Provide detailed feedback for Task 2..."
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No Task 2 submission found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* General Feedback */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>General Feedback</CardTitle>
          <CardDescription>Overall comments and suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          {isGraded ? (
            <div className="p-4 bg-gray-50 rounded-lg border min-h-[100px] whitespace-pre-wrap text-gray-800">
              {generalFeedback || "No general feedback provided"}
            </div>
          ) : (
            <Textarea
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              rows={4}
              placeholder="Provide general feedback for the entire writing test..."
            />
          )}
        </CardContent>
      </Card>

      {/* Submit Button - Only show if not graded */}
      {!isGraded && (
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || !task1Score || !task2Score}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Submit Grading
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WritingGradingDetailPage;

