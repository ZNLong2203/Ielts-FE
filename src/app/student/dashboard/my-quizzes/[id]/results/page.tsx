"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import QuizResults from "@/components/student/quiz/QuizResults";
import { Loader2 } from "lucide-react";
import { getMockTest, getTestResult } from "@/api/mockTest";

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.id as string;
  const resultId = searchParams.get("resultId");
  
  const [quiz, setQuiz] = useState<any>(null);
  const [sectionResult, setSectionResult] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch quiz data
        const quizData = await getMockTest(quizId);
        setQuiz(quizData);

        // If resultId is provided, fetch specific result
        if (resultId) {
          const result = await getTestResult(resultId);
          // Extract section result from the response
          // This depends on your API structure
          if (result.section_results && result.section_results.length > 0) {
            // Get the first section result or the most recent one
            const latestSectionResult = result.section_results[result.section_results.length - 1];
            setSectionResult({
              band_score: latestSectionResult.band_score,
              correct_answers: latestSectionResult.correct_answers,
              total_questions: latestSectionResult.total_questions,
              detailed_answers: latestSectionResult.detailed_answers,
            });
            // Set current section based on result
            if (latestSectionResult.test_section) {
              setCurrentSection(latestSectionResult.test_section);
            }
          }
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

  // Default section if not provided
  const section = currentSection || { type: "speaking" };

  return (
    <QuizResults
      quiz={quiz}
      sectionResult={sectionResult}
      currentSection={section}
      onBack={() => router.push("/student/dashboard/my-quizzes")}
      onReset={() => router.push(`/student/dashboard/my-quizzes/${quizId}`)}
    />
  );
}

