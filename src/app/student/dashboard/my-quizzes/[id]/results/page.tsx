"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import QuizResults from "@/components/student/quiz/QuizResults";
import TestResultReview from "@/components/student/quiz/TestResultReview";
import { Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMockTest, getTestResult, getTestResultReview } from "@/api/mockTest";
import { IMockTest, IMockTestSectionDetail } from "@/interface/mockTest";
import { useQuery } from "@tanstack/react-query";

interface SectionResultData {
  band_score: number | null;
  correct_answers: number | null;
  total_questions: number;
  detailed_answers?: unknown;
  grading_method?: string;
  message?: string;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const resultId = searchParams.get("resultId");
  
  const [quiz, setQuiz] = useState<IMockTest | null>(null);
  const [sectionResult, setSectionResult] = useState<SectionResultData | null>(null);
  const [currentSection, setCurrentSection] = useState<{ type: string; question_groups?: Array<{ questions?: Array<unknown> }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  // Fetch test result review when showReview is true
  const { data: testResultReview, isLoading: isLoadingReview } = useQuery({
    queryKey: ["test-result-review", resultId],
    queryFn: () => resultId ? getTestResultReview(resultId) : null,
    enabled: !!resultId && showReview,
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch quiz data
        const quizData = await getMockTest(quizId);
        setQuiz(quizData);

        // If resultId is provided, fetch specific result
        if (resultId) {
          const result = await getTestResult(resultId);
          console.log("Test result response:", result);
          console.log("Section results:", result.section_results);
          
          // Extract section result from the response
          if (result.section_results && result.section_results.length > 0) {
            // Get the most recent section result (last one)
            const latestSectionResult = result.section_results[result.section_results.length - 1];
            
            // Extract section result data
            console.log("Latest section result:", latestSectionResult);
            console.log("Detailed answers (raw):", latestSectionResult.detailed_answers);
            
            // Parse detailed_answers if it's a string
            let parsedDetailedAnswers = latestSectionResult.detailed_answers;
            if (typeof parsedDetailedAnswers === 'string') {
              try {
                parsedDetailedAnswers = JSON.parse(parsedDetailedAnswers);
                console.log("Detailed answers (parsed):", parsedDetailedAnswers);
              } catch (e) {
                console.warn("Failed to parse detailed_answers:", e);
              }
            }
            
            setSectionResult({
              band_score: latestSectionResult.band_score,
              correct_answers: latestSectionResult.correct_answers,
              total_questions: latestSectionResult.total_questions,
              detailed_answers: parsedDetailedAnswers,
              grading_method: latestSectionResult.grading_method,
              message: latestSectionResult.message,
            });
            
            // Set current section - try to get from test_sections in section_result, 
            // or find matching section from quiz data
            let section: IMockTestSectionDetail | null = null;
            if (latestSectionResult.test_sections) {
              // Use section from result
              section = latestSectionResult.test_sections as IMockTestSectionDetail;
            } else if (latestSectionResult.test_section_id && quizData.test_sections) {
              // Find matching section from quiz
              section = quizData.test_sections.find(
                (s) => s.id === latestSectionResult.test_section_id
              ) || null;
            }
            
            // Fallback to last section if not found
            if (!section && quizData.test_sections && quizData.test_sections.length > 0) {
              section = quizData.test_sections[quizData.test_sections.length - 1]; // Use last section as fallback
            }
            
            // Map section_type to type for QuizResults component
            if (section) {
              setCurrentSection({
                type: section.section_type,
                question_groups: section.exercises?.flatMap(ex => ex.question_groups || []) || [],
              });
            }
          } else {
            console.warn("No section_results found in result:", result);
            // Try to get from sessionStorage as fallback
            if (resultId) {
              const savedResult = sessionStorage.getItem(`quiz-section-result-${resultId}`);
              if (savedResult) {
                try {
                  const parsedResult = JSON.parse(savedResult);
                  setSectionResult({
                    band_score: parsedResult.band_score,
                    correct_answers: parsedResult.correct_answers,
                    total_questions: parsedResult.total_questions,
                    detailed_answers: parsedResult.detailed_answers,
                    grading_method: parsedResult.grading_method,
                    message: parsedResult.message,
                  });
                  console.log("Loaded section result from sessionStorage");
                  
                  // Set current section from quiz data if available
                  if (quizData.test_sections && quizData.test_sections.length > 0) {
                    const section = quizData.test_sections[quizData.test_sections.length - 1];
                    setCurrentSection({
                      type: section.section_type,
                      question_groups: section.exercises?.flatMap(ex => ex.question_groups || []) || [],
                    });
                  }
                } catch (e) {
                  console.error("Error parsing saved result:", e);
                }
              }
            }
          }
        } else {
          console.warn("No resultId provided in query params");
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchResults();
    }
  }, [quizId, resultId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !sectionResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">No results found</p>
          <p className="text-sm text-gray-500 mt-2">
            {!quiz && "Quiz data not loaded. "}
            {!sectionResult && "Section result not found. "}
            {resultId && `Result ID: ${resultId}`}
          </p>
          <button
            onClick={() => router.push("/student/dashboard/my-quizzes")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Show detailed review if available and loaded
  if (showReview && testResultReview && resultId && !isLoadingReview) {
    return (
      <TestResultReview
        testResult={testResultReview}
        onBack={() => {
          setShowReview(false);
          router.push(`/student/dashboard/my-quizzes/${quizId}/results?resultId=${resultId}`);
        }}
      />
    );
  }

  // Default section if not provided - try to get from quiz test_sections
  const section = currentSection || (quiz?.test_sections?.[quiz.test_sections.length - 1] ? {
    type: quiz.test_sections[quiz.test_sections.length - 1].section_type,
    question_groups: quiz.test_sections[quiz.test_sections.length - 1].exercises?.flatMap(ex => ex.question_groups || []) || [],
  } : null) || { type: "speaking", question_groups: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizResults
        quiz={quiz}
        sectionResult={sectionResult}
        currentSection={section}
        onBack={() => router.push("/student/dashboard/my-quizzes")}
        onReset={() => router.push(`/student/dashboard/my-quizzes/${quizId}`)}
      />
      {resultId && section && section.type !== "speaking" && section.type !== "writing" && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Review Your Answers
                  </h3>
                  <p className="text-sm text-gray-600">
                    View detailed explanations for each question, see correct answers, and understand your mistakes.
                  </p>
                </div>
                <Button
                  onClick={() => setShowReview(true)}
                  disabled={isLoadingReview}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Detailed Review
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

