'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { gradeWritingByGemini, GradeWritingDto, WritingGradeResponse } from '@/api/writing';
import { Loader2, FileText, CheckCircle, AlertCircle, Lightbulb, PenTool, TrendingUp, Award, MessageSquare } from 'lucide-react';

export default function WritingPage() {
  const [formData, setFormData] = useState<GradeWritingDto>({
    studentAnswer: '',
    question: '',
    taskType: 'task_2',
    wordLimit: '',
    additionalInstructions: '',
  });
  
  const [result, setResult] = useState<WritingGradeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await gradeWritingByGemini(formData);
      console.log('Raw API response:', response);
      
      // Ensure all required fields have default values
      const safeResponse = {
        overallScore: response.overallScore || 0,
        taskAchievement: response.taskAchievement || 0,
        coherenceCohesion: response.coherenceCohesion || 0,
        lexicalResource: response.lexicalResource || 0,
        grammaticalRangeAccuracy: response.grammaticalRangeAccuracy || 0,
        detailedFeedback: response.detailedFeedback || 'No detailed feedback available.',
        suggestions: response.suggestions || [],
        strengths: response.strengths || [],
        weaknesses: response.weaknesses || [],
      };
      
      console.log('Safe response:', safeResponse);
      setResult(safeResponse);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while grading the writing');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 5) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 7) return 'Excellent';
    if (score >= 5) return 'Good';
    return 'Needs Improvement';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <PenTool className="h-8 w-8 text-blue-600" />
              IELTS Writing Assessment
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered writing evaluation with detailed feedback and improvement suggestions
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Assessment Tool</div>
            <div className="text-2xl font-bold text-blue-600">AI Grading</div>
            <div className="text-sm text-gray-500">Instant Results</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Form - Left Column */}
        <div className="xl:col-span-1">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Writing Information
              </CardTitle>
              <CardDescription className="text-blue-100">
                Enter your writing details for AI assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Task Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Writing Task Type
                  </label>
                  <Select
                    value={formData.taskType}
                    onValueChange={(value: 'task_1' | 'task_2') =>
                      setFormData({ ...formData, taskType: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task_1">
                        Task 1 - Describe visual information
                      </SelectItem>
                      <SelectItem value="task_2">
                        Task 2 - Essay writing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Question / Topic
                  </label>
                  <Textarea
                    placeholder="Enter the writing question or topic..."
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                {/* Student Answer */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Student&apos;s Writing
                  </label>
                  <Textarea
                    placeholder="Paste the student's writing here for assessment..."
                    value={formData.studentAnswer}
                    onChange={(e) =>
                      setFormData({ ...formData, studentAnswer: e.target.value })
                    }
                    className="min-h-[250px] resize-none"
                    required
                  />
                </div>

                {/* Word Limit */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Word Limit (Optional)
                  </label>
                  <Textarea
                    placeholder="e.g., 150-200 words for Task 1, 250+ words for Task 2"
                    value={formData.wordLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, wordLimit: e.target.value })
                    }
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Additional Instructions */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Additional Instructions (Optional)
                  </label>
                  <Textarea
                    placeholder="Enter any special instructions or requirements..."
                    value={formData.additionalInstructions}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalInstructions: e.target.value })
                    }
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !formData.question || !formData.studentAnswer}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Grading Writing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Grade Writing
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results - Right Column */}
        <div className="xl:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Overall Score */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Overall Band Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="relative inline-block">
                      <div className={`w-32 h-32 rounded-full ${getScoreColor(result.overallScore)} flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
                        {result.overallScore}
                      </div>
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <Badge variant="secondary" className={`text-sm font-semibold ${getScoreTextColor(result.overallScore)}`}>
                          {getScoreText(result.overallScore)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg text-gray-600 font-medium">
                        IELTS Band Score: {result.overallScore}/9
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Based on official IELTS criteria
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="h-5 w-5" />
                    Detailed Assessment
                  </CardTitle>
                  <CardDescription>
                    Breakdown of scores across all IELTS criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Task Achievement</span>
                        <Badge variant="outline" className="font-semibold">{result.taskAchievement}/9</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getScoreColor(result.taskAchievement)}`}
                          style={{ width: `${(result.taskAchievement / 9) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Coherence & Cohesion</span>
                        <Badge variant="outline" className="font-semibold">{result.coherenceCohesion}/9</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getScoreColor(result.coherenceCohesion)}`}
                          style={{ width: `${(result.coherenceCohesion / 9) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Lexical Resource</span>
                        <Badge variant="outline" className="font-semibold">{result.lexicalResource}/9</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getScoreColor(result.lexicalResource)}`}
                          style={{ width: `${(result.lexicalResource / 9) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Grammar Range & Accuracy</span>
                        <Badge variant="outline" className="font-semibold">{result.grammaticalRangeAccuracy}/9</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getScoreColor(result.grammaticalRangeAccuracy)}`}
                          style={{ width: `${(result.grammaticalRangeAccuracy / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Feedback */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <MessageSquare className="h-5 w-5" />
                    Detailed Feedback
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis of the writing performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                    {result.detailedFeedback ? (
                      <div className="text-gray-700 leading-relaxed text-sm">
                        <p className="mb-4">
                          {result.detailedFeedback}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-center py-8">No detailed feedback available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Weaknesses Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                {result.strengths && result.strengths.length > 0 && (
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {result.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Weaknesses */}
                {result.weaknesses && result.weaknesses.length > 0 && (
                  <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <AlertCircle className="h-5 w-5" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {result.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm leading-relaxed">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Lightbulb className="h-5 w-5" />
                      Improvement Suggestions
                    </CardTitle>
                    <CardDescription>
                      Actionable recommendations for better performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {result.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm leading-relaxed">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="shadow-lg border-0">
              <CardContent className="p-16 text-center">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No Assessment Results Yet
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Enter the writing information and click &quot;Grade Writing&quot; to see detailed AI-powered assessment results
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
