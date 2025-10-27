'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TranscribeAndGradeResponse } from '@/api/speaking';
import { Award, TrendingUp, MessageSquare, CheckCircle, AlertCircle, Lightbulb, ArrowLeft } from 'lucide-react';

export default function SpeakingResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TranscribeAndGradeResponse | null>(null);

  useEffect(() => {
    const savedResult = localStorage.getItem('speakingResult');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      router.push('/student/learn/speaking');
    }
  }, [router]);

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

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/learn/speaking')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Speaking Test
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Speaking Assessment Results</h1>
              <p className="text-gray-600 text-sm mt-1">AI-powered transcription and grading analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Results */}
        <div className="lg:col-span-2 space-y-6">
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
                  <div className={`w-32 h-32 rounded-full ${getScoreColor(result.grading.overallScore)} flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
                    {result.grading.overallScore}
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary" className="text-sm font-semibold">
                      {getScoreText(result.grading.overallScore)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-lg text-gray-600 font-medium">
                    IELTS Band Score: {result.grading.overallScore}/9
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Based on official IELTS criteria
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcription */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Transcription
              </CardTitle>
              <CardDescription>
                Speech-to-text conversion of your recording
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[120px]">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {result.transcription}
                </p>
              </div>
              {result.audioUrl && (
                <div className="mt-4">
                  <audio controls src={result.audioUrl} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          {result.grading.detailedFeedback && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <MessageSquare className="h-5 w-5" />
                  Detailed Feedback
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of your speaking performance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {result.grading.detailedFeedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Detailed Scores */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detailed Scores
              </CardTitle>
              <CardDescription>
                Breakdown by criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  { label: 'Fluency & Coherence', score: result.grading.fluencyCoherence },
                  { label: 'Lexical Resource', score: result.grading.lexicalResource },
                  { label: 'Grammar Range & Accuracy', score: result.grading.grammaticalRangeAccuracy },
                  { label: 'Pronunciation', score: result.grading.pronunciation },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <Badge variant="outline" className="font-semibold">{item.score}/9</Badge>
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

          {/* Strengths */}
          {result.grading.strengths && result.grading.strengths.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {result.grading.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {result.grading.weaknesses && result.grading.weaknesses.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {result.grading.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {result.grading.suggestions && result.grading.suggestions.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-5 w-5" />
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {result.grading.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

