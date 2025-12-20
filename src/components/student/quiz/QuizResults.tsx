"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import WritingResults from "./WritingResults";

interface QuizResultsProps {
  quiz: {
    title: string;
    sections?: Array<{
      question_groups?: Array<{
        questions?: Array<any>;
      }>;
    }>;
  };
  sectionResult: {
    band_score: number | null;
    correct_answers: number | null;
    total_questions: number;
    detailed_answers?: any;
    grading_method?: string;
  };
  currentSection: {
    type: string;
    question_groups?: Array<{
      questions?: Array<any>;
    }>;
  };
  onBack: () => void;
  onReset: () => void;
}

export default function QuizResults({
  quiz,
  sectionResult,
  currentSection,
  onBack,
  onReset,
}: QuizResultsProps) {
  const router = useRouter();
  const correctAnswers = sectionResult.correct_answers || 0;
  
  // Backend returns total_questions for the current section only (not aggregated)
  // Fallback to currentSection if sectionResult.total_questions is not available
  const totalQuestionsFromSection = currentSection?.question_groups?.reduce(
    (sum, group) => sum + (group.questions?.length || 0),
    0
  ) || 0;
  // Use sectionResult.total_questions (from backend) - it's the total for this section only
  const totalQuestionsResult = sectionResult.total_questions || totalQuestionsFromSection || 0;
  
  const bandScore = sectionResult.band_score || 0;

  // Extract detailed feedback data for speaking section
  // Handle both direct detailed_answers and nested structure
  const detailedAnswers = sectionResult.detailed_answers as any;
  const isSpeaking = currentSection?.type === "speaking";
  const isWriting = currentSection?.type === "writing";
  
  // For speaking, detailed_answers is an array of question results
  // Each item has grading object with strengths, weaknesses, suggestions, detailedFeedback
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let suggestions: string[] = [];
  let overallFeedback = "";
  let criteriaScores: Record<string, number> = {};
  
  if (isSpeaking && detailedAnswers) {
    if (Array.isArray(detailedAnswers) && detailedAnswers.length > 0) {
      // If it's an array, aggregate data from all items
      const allStrengths: string[] = [];
      const allWeaknesses: string[] = [];
      const allSuggestions: string[] = [];
      const allFeedbacks: string[] = [];
      
      detailedAnswers.forEach((item: any) => {
        if (item?.grading) {
          if (Array.isArray(item.grading.strengths)) {
            allStrengths.push(...item.grading.strengths);
          }
          if (Array.isArray(item.grading.weaknesses)) {
            allWeaknesses.push(...item.grading.weaknesses);
          }
          if (Array.isArray(item.grading.suggestions)) {
            allSuggestions.push(...item.grading.suggestions);
          }
          if (item.grading.detailedFeedback) {
            allFeedbacks.push(item.grading.detailedFeedback);
          }
          
          // Extract criteria scores from grading object (use first item's scores)
          if (Object.keys(criteriaScores).length === 0) {
            if (item.grading.overallScore !== undefined) {
              criteriaScores.overall = item.grading.overallScore;
            }
            if (item.grading.fluencyCoherence !== undefined) {
              criteriaScores.fluencyCoherence = item.grading.fluencyCoherence;
            }
            if (item.grading.lexicalResource !== undefined) {
              criteriaScores.lexicalResource = item.grading.lexicalResource;
            }
            if (item.grading.grammaticalRangeAccuracy !== undefined) {
              criteriaScores.grammaticalRangeAccuracy = item.grading.grammaticalRangeAccuracy;
            }
            if (item.grading.pronunciation !== undefined) {
              criteriaScores.pronunciation = item.grading.pronunciation;
            }
          }
        }
      });
      
      strengths = allStrengths;
      weaknesses = allWeaknesses;
      suggestions = allSuggestions;
      overallFeedback = allFeedbacks.join("\n\n");
    } else if (detailedAnswers?.grading) {
      // If it's a single object with grading
      strengths = Array.isArray(detailedAnswers.grading.strengths) ? detailedAnswers.grading.strengths : [];
      weaknesses = Array.isArray(detailedAnswers.grading.weaknesses) ? detailedAnswers.grading.weaknesses : [];
      suggestions = Array.isArray(detailedAnswers.grading.suggestions) ? detailedAnswers.grading.suggestions : [];
      overallFeedback = detailedAnswers.grading.detailedFeedback || detailedAnswers.grading.feedback || "";
      
      if (detailedAnswers.grading.overallScore !== undefined) criteriaScores.overall = detailedAnswers.grading.overallScore;
      if (detailedAnswers.grading.fluencyCoherence !== undefined) criteriaScores.fluencyCoherence = detailedAnswers.grading.fluencyCoherence;
      if (detailedAnswers.grading.lexicalResource !== undefined) criteriaScores.lexicalResource = detailedAnswers.grading.lexicalResource;
      if (detailedAnswers.grading.grammaticalRangeAccuracy !== undefined) criteriaScores.grammaticalRangeAccuracy = detailedAnswers.grading.grammaticalRangeAccuracy;
      if (detailedAnswers.grading.pronunciation !== undefined) criteriaScores.pronunciation = detailedAnswers.grading.pronunciation;
    } else {
      // Fallback: try direct properties
      strengths = Array.isArray(detailedAnswers.strengths) ? detailedAnswers.strengths : [];
      weaknesses = Array.isArray(detailedAnswers.weaknesses) ? detailedAnswers.weaknesses : [];
      suggestions = Array.isArray(detailedAnswers.suggestions) ? detailedAnswers.suggestions : [];
      overallFeedback = detailedAnswers.overall_feedback || detailedAnswers.feedback || detailedAnswers.detailedFeedback || "";
      criteriaScores = detailedAnswers.overall_criteria_scores || detailedAnswers.criteria_scores || {};
    }
  }
  
  // Extract writing results
  const writingTask1 = detailedAnswers?.task1 || null;
  const writingTask2 = detailedAnswers?.task2 || null;
  const writingOverallScore = detailedAnswers?.overallScore || bandScore;
  
  // Check if we have any detailed feedback to show
  const hasDetailedFeedback = isSpeaking && (
    strengths.length > 0 || 
    weaknesses.length > 0 || 
    suggestions.length > 0 || 
    overallFeedback || 
    Object.keys(criteriaScores).length > 0
  );
  
  // Check if we have writing results
  const hasWritingResults = isWriting && (writingTask1 || writingTask2);

  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (score >= 5) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    return "bg-gradient-to-r from-red-500 to-pink-500";
  };

  // If writing section, show WritingResults component
  if (hasWritingResults) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="text-blue-600 border-blue-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Test
          </Button>
        </div>
        
        <WritingResults
          task1={writingTask1}
          task2={writingTask2}
          overallScore={writingOverallScore}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="text-blue-600 border-blue-600"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake Test
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Results */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-900">
                Test Completed!
              </CardTitle>
              <p className="text-gray-600">
                Here are your results for {quiz?.title || "this test"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Band Score
                  </h3>
                  <p className="text-4xl font-bold text-blue-600">
                    {bandScore.toFixed(1)}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">IELTS Band</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Correct Answers
                  </h3>
                  <p className="text-4xl font-bold text-green-600">
                    {correctAnswers}/{totalQuestionsResult}
                  </p>
                  <p className="text-sm text-green-700 mt-2">Questions</p>
                </div>
              </div>

              {/* Detailed Feedback for Speaking */}
              {hasDetailedFeedback && overallFeedback && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <MessageSquare className="h-5 w-5" />
                      Detailed Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {overallFeedback}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Show message if no detailed feedback available */}
              {isSpeaking && !hasDetailedFeedback && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <p className="text-sm text-yellow-800 text-center">
                      Detailed feedback is being processed. Please check back later.
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Detailed Scores for Speaking */}
          {isSpeaking && Object.keys(criteriaScores).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Detailed Scores
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Breakdown by criteria
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      label: "Fluency & Coherence",
                      score: criteriaScores.fluencyCoherence || 0,
                    },
                    {
                      label: "Lexical Resource",
                      score: criteriaScores.lexicalResource || 0,
                    },
                    {
                      label: "Grammar Range & Accuracy",
                      score: criteriaScores.grammaticalRangeAccuracy || 0,
                    },
                    {
                      label: "Pronunciation",
                      score: criteriaScores.pronunciation || 0,
                    },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {item.label}
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {item.score}/9
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreColor(item.score)}`}
                          style={{ width: `${(item.score / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {isSpeaking && strengths && strengths.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strengths.map((strength: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {isSpeaking && weaknesses && weaknesses.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weaknesses.map((weakness: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {isSpeaking && suggestions && suggestions.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-5 w-5" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestions.map((suggestion: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={onReset} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Test
            </Button>
            <Button
              onClick={onBack}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

