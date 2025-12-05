"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Headphones, 
  FileText, 
  Mic,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Target
} from "lucide-react";
import { ITestResult, ISectionResult, IQuestionReview, IMockTestQuestion, IMockTestExercise } from "@/interface/mockTest";
import { cn } from "@/lib/utils";

interface TestResultReviewProps {
  testResult: ITestResult;
  onBack?: () => void;
}

const TestResultReview = ({ testResult, onBack }: TestResultReviewProps) => {
  // Auto-expand first section by default
  const firstSectionId = testResult.section_results && testResult.section_results.length > 0
    ? testResult.section_results[0].id
    : null;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    firstSectionId ? new Set([firstSectionId]) : new Set(),
  );
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Track active exercise per section (for exercise tabs)
  const [activeExerciseBySection, setActiveExerciseBySection] = useState<Record<string, string>>({});

  // Ensure first section is expanded on mount
  useEffect(() => {
    if (firstSectionId && expandedSections.size === 0) {
      setExpandedSections(new Set([firstSectionId]));
    }
  }, [firstSectionId, expandedSections.size]);

  // Initialize active exercise for each section when results load
  useEffect(() => {
    const sectionResults = testResult.section_results;
    if (!sectionResults) return;

    setActiveExerciseBySection((prev) => {
      const next = { ...prev };
      sectionResults.forEach((sectionResult) => {
        const exercises = sectionResult.test_sections?.exercises || [];
        if (exercises.length > 0 && !next[sectionResult.id]) {
          next[sectionResult.id] = exercises[0].id;
        }
      });
      return next;
    });
  }, [testResult.section_results]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType.toLowerCase()) {
      case "reading":
        return <BookOpen className="h-5 w-5" />;
      case "listening":
        return <Headphones className="h-5 w-5" />;
      case "writing":
        return <FileText className="h-5 w-5" />;
      case "speaking":
        return <Mic className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getSectionColor = (sectionType: string) => {
    switch (sectionType.toLowerCase()) {
      case "reading":
        return "bg-green-50 text-green-700 border-green-200";
      case "listening":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "writing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "speaking":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatAnswer = (answer: string | string[] | null, question?: IQuestionReview['question']): string => {
    if (!answer) return "No answer";
    
    // For multiple choice, convert option IDs to option text
    if (question?.question_type === "multiple_choice" && question?.question_options) {
      const answerIds = Array.isArray(answer) ? answer : [answer];
      const optionTexts = answerIds.map(id => {
        const option = question.question_options?.find(opt => opt.id === id);
        return option ? option.option_text : id;
      });
      return optionTexts.join(", ");
    }
    
    // For matching, convert matching option ID to option text
    // Note: matching_options are typically in the question_group, not the question itself
    if (question?.question_type === "matching") {
      const answerId = Array.isArray(answer) ? answer[0] : answer;
      // Try to find matching option from question_group if available
      const questionWithGroup = question as IMockTestQuestion & { question_group?: { matching_options?: Array<{ id: string; option_text: string }> } };
      const matchingOptions = questionWithGroup.question_group?.matching_options;
      if (matchingOptions) {
        const matchingOption = matchingOptions.find((opt: { id: string; option_text: string }) => opt.id === answerId);
        return matchingOption ? matchingOption.option_text : (answerId || "No answer");
      }
      return answerId || "No answer";
    }
    
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    return answer;
  };
  
  const parseExplanation = (explanation: string | object | null | undefined): string => {
    if (!explanation) return "";
    if (typeof explanation === 'string') {
      // Try to parse JSON string
      try {
        const parsed = JSON.parse(explanation);
        if (parsed && typeof parsed === 'object' && 'correct_answer' in parsed) {
          return `Correct answer: ${parsed.correct_answer}`;
        }
        return explanation;
      } catch {
        return explanation;
      }
    }
    if (typeof explanation === 'object' && explanation !== null && 'correct_answer' in explanation) {
      return `Correct answer: ${(explanation as { correct_answer: string }).correct_answer}`;
    }
    return String(explanation);
  };

  const renderQuestionReview = (review: IQuestionReview, index: number) => {
    const { question, is_correct, user_answer, correct_answer, explanation, points_earned, max_points } = review;
    
    if (!question) return null;

    const isExpanded = expandedQuestions.has(question.id);
    const isCorrect = is_correct === true;
    const isIncorrect = is_correct === false;
    const isUnanswered = is_correct === null;

    return (
      <Card key={question.id} className={cn(
        "mb-4 transition-all",
        isCorrect && "border-green-300 bg-green-50/30",
        isIncorrect && "border-red-300 bg-red-50/30",
        isUnanswered && "border-gray-300 bg-gray-50/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                isCorrect && "bg-green-500 text-white",
                isIncorrect && "bg-red-500 text-white",
                isUnanswered && "bg-gray-400 text-white"
              )}>
                {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : 
                 isIncorrect ? <XCircle className="h-5 w-5" /> : 
                 index + 1}
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold text-gray-900 mb-2">
                  Question {index + 1}
                </CardTitle>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {question.question_text}
                </div>
              </div>
            </div>
            <Badge 
              variant={isCorrect ? "default" : isIncorrect ? "destructive" : "secondary"}
              className="ml-2"
            >
              {points_earned}/{max_points} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* User Answer */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Your Answer</div>
            <div className={cn(
              "text-sm font-medium",
              isCorrect && "text-green-700",
              isIncorrect && "text-red-700",
              isUnanswered && "text-gray-500 italic"
            )}>
              {formatAnswer(user_answer, question)}
            </div>
          </div>

          {/* Correct Answer */}
          {(isIncorrect || isUnanswered) && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-xs font-semibold text-green-700 uppercase mb-1">Correct Answer</div>
              <div className="text-sm font-medium text-green-800">
                {formatAnswer(correct_answer, question)}
              </div>
            </div>
          )}

          {/* Options for multiple choice */}
          {question.question_type === "multiple_choice" && question.question_options && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase">Options</div>
              {question.question_options.map((option, optIndex) => {
                const isSelected = Array.isArray(user_answer) 
                  ? user_answer.includes(option.id)
                  : user_answer === option.id;
                const isCorrectOption = Array.isArray(correct_answer)
                  ? correct_answer.includes(option.id)
                  : correct_answer === option.id;
                
                return (
                  <div
                    key={option.id}
                    className={cn(
                      "p-2 rounded border text-sm",
                      isCorrectOption && "bg-green-100 border-green-300 font-semibold",
                      isSelected && !isCorrectOption && "bg-red-100 border-red-300",
                      isSelected && isCorrectOption && "bg-green-200 border-green-400"
                    )}
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + optIndex)}.
                    </span>
                    {option.option_text}
                    {isCorrectOption && (
                      <Badge variant="default" className="ml-2 bg-green-600">
                        Correct
                      </Badge>
                    )}
                    {isSelected && !isCorrectOption && (
                      <Badge variant="destructive" className="ml-2">
                        Your choice
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanation */}
          {explanation && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-xs font-semibold text-blue-700 uppercase mb-1">Explanation</div>
              <div className="text-sm text-blue-900 whitespace-pre-wrap">
                {parseExplanation(explanation)}
              </div>
            </div>
          )}

          {/* Expand button for more details */}
          {question.reading_passage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleQuestion(question.id)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Passage
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Passage
                </>
              )}
            </Button>
          )}

          {/* Reading Passage */}
          {isExpanded && question.reading_passage && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Reading Passage</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {question.reading_passage}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderExerciseReview = (exercise: IMockTestExercise, exerciseIndex: number, questionReviews: IQuestionReview[]) => {
    // Get questions for this exercise from question_reviews
    // Questions are linked to exercises through question_groups
    const exerciseQuestions = questionReviews.filter(review => {
      const questionWithGroup = review.question as (IMockTestQuestion & { question_group?: { id: string }; exercise?: { id: string } }) | null;
      const questionGroupId = questionWithGroup?.question_group?.id;
      return exercise.question_groups?.some(g => g.id === questionGroupId);
    });

    if (exerciseQuestions.length === 0) return null;

    return (
      <div key={exercise.id} className="mb-6">
        {/* Exercise Header */}
        <div className="border-b-2 border-blue-200 pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{exercise.title || `Exercise ${exerciseIndex + 1}`}</h3>
              {exercise.instruction && (
                <p className="text-sm text-gray-600 mt-1">{exercise.instruction}</p>
              )}
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              {exerciseQuestions.length} {exerciseQuestions.length === 1 ? 'question' : 'questions'}
            </div>
          </div>
        </div>

        {/* Exercise Passage (for Reading) */}
        {exercise.content?.reading_passage && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {exercise.content.reading_passage.title && (
              <h4 className="font-semibold text-gray-900 mb-2">{exercise.content.reading_passage.title}</h4>
            )}
            {exercise.content.reading_passage.paragraphs && exercise.content.reading_passage.paragraphs.length > 0 ? (
              <div className="space-y-3">
                {exercise.content.reading_passage.paragraphs.map((para: { label?: string; content: string }, idx: number) => (
                  <p key={idx} className="text-sm text-gray-700 whitespace-pre-wrap">
                    {para.label && <span className="font-semibold">{para.label}: </span>}
                    {para.content}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {exercise.content.reading_passage.content}
              </p>
            )}
          </div>
        )}

        {/* Exercise Audio Player (for Listening) */}
        {exercise.audio_url && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
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

        {/* Questions grouped by question groups */}
        {exercise.question_groups && exercise.question_groups.length > 0 ? (
          exercise.question_groups.map((group, groupIndex: number) => {
            const groupQuestions = exerciseQuestions.filter(review => {
              const questionWithGroup = review.question as (IMockTestQuestion & { question_group?: { id: string } }) | null;
              const questionGroupId = questionWithGroup?.question_group?.id;
              return group.id === questionGroupId;
            });
            
            if (groupQuestions.length === 0) return null;

            return (
              <div key={group.id} className="mb-6">
                {/* Question Group Header */}
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {group.group_title || `Questions ${groupQuestions[0]?.question?.ordering || groupIndex + 1}-${groupQuestions[groupQuestions.length - 1]?.question?.ordering || groupIndex + groupQuestions.length}`}
                  </h4>
                  {group.group_instruction && (
                    <p className="text-sm text-gray-600 mt-2 italic">{group.group_instruction}</p>
                  )}
                </div>

                {/* Questions in this group */}
                <div className="space-y-4">
                  {groupQuestions.map((review) => {
                    // Find the index within the entire exercise
                    const exerciseQuestionIndex = exerciseQuestions.findIndex(r => r.question?.id === review.question?.id);
                    return renderQuestionReview(review, exerciseQuestionIndex);
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Fallback: render all questions without grouping
          <div className="space-y-4">
            {exerciseQuestions.map((review, index) => renderQuestionReview(review, index))}
          </div>
        )}
      </div>
    );
  };

  const renderSectionReview = (sectionResult: ISectionResult) => {
    const section = sectionResult.test_sections;
    if (!section) return null;

    const isExpanded = expandedSections.has(sectionResult.id);
    const questionReviews = sectionResult.question_reviews || [];
    const correctCount = questionReviews.filter(r => r.is_correct === true).length;
    const totalCount = questionReviews.length;

    // Group questions by exercises
    const exercises = section.exercises || [];
    const activeExerciseId =
      activeExerciseBySection[sectionResult.id] || exercises[0]?.id || null;
    const activeExerciseIndex = activeExerciseId
      ? exercises.findIndex((ex) => ex.id === activeExerciseId)
      : -1;

    return (
      <Card key={sectionResult.id} className="mb-6 border border-gray-200 shadow-md">
        <CardHeader className="bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-3 rounded-lg", getSectionColor(section.section_type))}>
                {getSectionIcon(section.section_type)}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {section.section_name}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1 text-blue-600" />
                    Band Score: <span className="font-bold ml-1 text-blue-600">
                      {typeof sectionResult.band_score === 'string' 
                        ? parseFloat(sectionResult.band_score).toFixed(1) 
                        : (sectionResult.band_score?.toFixed(1) || '0.0')}
                    </span>
                  </span>
                  <span className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                    {correctCount}/{totalCount} Correct
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {Math.floor((sectionResult.time_taken || 0) / 60)}m {(sectionResult.time_taken || 0) % 60}s
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection(sectionResult.id)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="bg-gray-50">
            <div className="space-y-6">
              {/* Exercise tabs */}
              {exercises.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {exercises.map((exercise, idx) => {
                    const isActive = exercise.id === activeExerciseId;
                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() =>
                          setActiveExerciseBySection((prev) => ({
                            ...prev,
                            [sectionResult.id]: exercise.id,
                          }))
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-colors",
                          isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                        )}
                      >
                        {exercise.title
                          ? `Exercise ${idx + 1}`
                          : `Exercise ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active exercise content */}
              {exercises.length > 0 && activeExerciseId ? (
                renderExerciseReview(
                  exercises[activeExerciseIndex === -1 ? 0 : activeExerciseIndex],
                  activeExerciseIndex === -1 ? 0 : activeExerciseIndex,
                  questionReviews,
                )
              ) : questionReviews.length > 0 ? (
                // Fallback: render all questions without exercise grouping
                <div className="space-y-4">
                  {questionReviews.map((review, index) => renderQuestionReview(review, index))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No question reviews available
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  // Convert band_score to number (it might be a string from database)
  const overallBandScore = typeof testResult.band_score === 'string' 
    ? parseFloat(testResult.band_score) || 0
    : (testResult.band_score || 0);
  const totalCorrect = testResult.section_results?.reduce((sum, sr) => sum + (sr.correct_answers || 0), 0) || 0;
  const totalQuestions = testResult.section_results?.reduce((sum, sr) => sum + (sr.total_questions || 0), 0) || 0;

  // Debug: Log data structure
  console.log('TestResultReview - testResult:', testResult);
  console.log('TestResultReview - section_results:', testResult.section_results);
  console.log('TestResultReview - section_results length:', testResult.section_results?.length);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-6 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold mb-2">
                  Test Results Review
                </CardTitle>
                <div className="text-blue-100">
                  {testResult.mock_tests?.title || "Mock Test"}
                </div>
              </div>
              {onBack && (
                <Button variant="secondary" onClick={onBack} className="bg-white text-blue-600 hover:bg-blue-50">
                  Back to Tests
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="bg-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Overall Band Score</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{overallBandScore.toFixed(1)}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Correct Answers</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{totalCorrect}/{totalQuestions}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Time Taken</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {testResult.time_taken ? `${Math.floor(testResult.time_taken / 60)}m` : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Reviews */}
        <div className="space-y-4">
          {testResult.section_results && Array.isArray(testResult.section_results) && testResult.section_results.length > 0 ? (
            testResult.section_results.map((sectionResult) => renderSectionReview(sectionResult))
          ) : (
            <Card className="border border-gray-200 shadow-md">
              <CardContent className="py-12 text-center">
                <div className="text-gray-400 mb-2">
                  <BookOpen className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium mb-1">No section results available</p>
                <p className="text-sm text-gray-500">
                  {testResult.section_results === undefined 
                    ? "Section results data is missing. Please check the API response."
                    : "Please complete the test sections to see detailed reviews."}
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  Debug: section_results is {testResult.section_results === undefined ? 'undefined' : `array with ${testResult.section_results.length} items`}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultReview;

