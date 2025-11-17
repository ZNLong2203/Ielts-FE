import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Lightbulb, 
  AlertCircle,
  CheckCircle2,
  Award
} from 'lucide-react';

interface DetailedMetrics {
  criteriaBreakdown?: Record<string, {
    score: number;
    level: string;
    feedback: string;
  }>;
  collocations?: Array<{ phrase: string; context: string }>;
  topicSpecificWords?: string[];
  lexicalErrors?: Array<{ original: string; corrected: string; context?: string }>;
  grammaticalErrors?: Array<{ original: string; corrected: string; context?: string }>;
  improvements?: string[];
}

interface WritingTaskDetails {
  score: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  detailedFeedback?: string;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  detailedMetrics?: {
    task1?: DetailedMetrics;
    task2?: DetailedMetrics;
  };
  upgradedEssay?: string;
  sampleAnswer?: string;
}

interface WritingResultsProps {
  task1?: WritingTaskDetails | null;
  task2?: WritingTaskDetails | null;
  overallScore: number;
}

type TabType = 'overview' | 'strengths' | 'improvements' | 'upgraded' | 'sample';

const WritingResults: React.FC<WritingResultsProps> = ({ task1, task2, overallScore }) => {
  const [activeTask, setActiveTask] = useState<'task1' | 'task2'>(
    task1 ? 'task1' : 'task2'
  );
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const currentTask = activeTask === 'task1' ? task1 : task2;
  const currentMetrics: DetailedMetrics | undefined = activeTask === 'task1' 
    ? (currentTask?.detailedMetrics?.task1 as DetailedMetrics | undefined)
    : (currentTask?.detailedMetrics?.task2 as DetailedMetrics | undefined);

  if (!task1 && !task2) {
    return null;
  }

  // Safety check: if currentTask is null/undefined, return null
  if (!currentTask) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-600';
    if (score >= 5) return 'text-blue-600';
    return 'text-orange-600';
  };


  const getLevelColor = (level: string) => {
    if (level?.includes('Excellent')) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (level?.includes('Very Good')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (level?.includes('Good')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score - Always show first */}
      <Card className="shadow-xl border-l-4 border-l-blue-600 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Overall Writing Score
                </CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">IELTS Band Score</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getScoreColor(overallScore)} mb-1`}>
                {overallScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 font-medium">Band Score</div>
            </div>
          </div>
          
          {/* Task Scores Breakdown */}
          {(task1 || task2) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {task1 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-gray-700">Task 1</span>
                      <span className={`text-base font-bold ${getScoreColor(task1.score || 0)}`}>
                        {(task1?.score || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                  {task2 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-sm font-medium text-gray-700">Task 2</span>
                      <span className={`text-base font-bold ${getScoreColor(task2.score || 0)}`}>
                        {(task2?.score || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                {task1 && task2 && (
                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    Weight: Task 1 (33%) + Task 2 (67%)
                  </div>
                )}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Detailed Analysis - Show if both tasks exist, otherwise show single task */}
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Detailed Analysis
            </CardTitle>
            {currentTask && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">
                  {activeTask === 'task1' ? 'Task 1' : 'Task 2'}
                </span>
                <div className={`px-3 py-1 rounded-full font-bold text-base ${getScoreColor(currentTask.score || 0)} bg-white border-2 ${
                  activeTask === 'task1' ? 'border-blue-500' : 'border-indigo-500'
                }`}>
                  {(currentTask.score || 0).toFixed(1)}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Task Selection - Only show if both tasks exist */}
          {(task1 && task2) && (
            <div className="mb-8">
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTask('task1')}
                  className={`flex-1 group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    activeTask === 'task1'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-base">Task 1</span>
                      {activeTask === 'task1' && (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className={`text-sm ${activeTask === 'task1' ? 'text-blue-100' : 'text-gray-500'}`}>
                      Academic Writing
                    </div>
                    <div className={`mt-2 text-lg font-bold ${
                      activeTask === 'task1' 
                        ? 'text-white' 
                        : getScoreColor(task1?.score || 0)
                    }`}>
                      {(task1?.score || 0).toFixed(1)}
                    </div>
                  </div>
                  {activeTask === 'task1' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTask('task2')}
                  className={`flex-1 group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    activeTask === 'task2'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-base">Task 2</span>
                      {activeTask === 'task2' && (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className={`text-sm ${activeTask === 'task2' ? 'text-indigo-100' : 'text-gray-500'}`}>
                      Essay Writing
                    </div>
                    <div className={`mt-2 text-lg font-bold ${
                      activeTask === 'task2' 
                        ? 'text-white' 
                        : getScoreColor(task2?.score || 0)
                    }`}>
                      {(task2?.score || 0).toFixed(1)}
                    </div>
                  </div>
                  {activeTask === 'task2' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-400"></div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Task Details Tabs */}
          {currentTask && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
                <TabsTrigger value="upgraded">Upgraded</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Score Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                    IELTS Assessment Criteria
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600">
                          {activeTask === 'task1' ? 'Task Achievement' : 'Task Response'}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(currentTask.taskAchievement || 0)}`}>
                        {(currentTask.taskAchievement || 0).toFixed(1)}
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            (currentTask.taskAchievement || 0) >= 7 ? 'bg-emerald-500' :
                            (currentTask.taskAchievement || 0) >= 5 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${((currentTask.taskAchievement || 0) / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600">Coherence & Cohesion</div>
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(currentTask.coherenceCohesion || 0)}`}>
                        {(currentTask.coherenceCohesion || 0).toFixed(1)}
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            (currentTask.coherenceCohesion || 0) >= 7 ? 'bg-emerald-500' :
                            (currentTask.coherenceCohesion || 0) >= 5 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${((currentTask.coherenceCohesion || 0) / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600">Lexical Resource</div>
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(currentTask.lexicalResource || 0)}`}>
                        {(currentTask.lexicalResource || 0).toFixed(1)}
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            (currentTask.lexicalResource || 0) >= 7 ? 'bg-emerald-500' :
                            (currentTask.lexicalResource || 0) >= 5 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${((currentTask.lexicalResource || 0) / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-600">Grammar Range & Accuracy</div>
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(currentTask.grammaticalRangeAccuracy || 0)}`}>
                        {(currentTask.grammaticalRangeAccuracy || 0).toFixed(1)}
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            (currentTask.grammaticalRangeAccuracy || 0) >= 7 ? 'bg-emerald-500' :
                            (currentTask.grammaticalRangeAccuracy || 0) >= 5 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${((currentTask.grammaticalRangeAccuracy || 0) / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Feedback */}
                {currentTask.detailedFeedback && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Detailed Feedback</h3>
                    </div>
                    <div className="bg-white border-l-4 border-l-blue-500 border border-gray-200 rounded-r-lg p-5 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {currentTask.detailedFeedback}
                      </p>
                    </div>
                  </div>
                )}

                {/* Criteria Breakdown */}
                {currentMetrics?.criteriaBreakdown && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                      Detailed Criteria Assessment
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(currentMetrics.criteriaBreakdown).map(([key, value]) => (
                        <div key={key} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-semibold text-gray-800 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {value.level && (
                              <Badge className={`${getLevelColor(value.level)} border`}>
                                {value.level}
                              </Badge>
                            )}
                          </div>
                          {value.score && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-gray-500">Score</span>
                                <span className={`text-sm font-bold ${getScoreColor(value.score)}`}>
                                  {value.score.toFixed(0)}/9
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all ${
                                    value.score >= 7 ? 'bg-emerald-500' :
                                    value.score >= 5 ? 'bg-blue-500' : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${(value.score / 9) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {value.feedback && (
                            <p className="text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-100">
                              {value.feedback}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="strengths" className="space-y-6 mt-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Strengths</h3>
                </div>
                
                {/* Strengths List */}
                {currentTask.strengths && currentTask.strengths.length > 0 && (
                  <div className="space-y-3">
                    {currentTask.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-white border-l-4 border-l-emerald-500 border border-gray-200 rounded-r-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="mt-0.5">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed flex-1">{strength}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Collocations */}
                {currentMetrics?.collocations && currentMetrics.collocations.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-emerald-600 text-white px-3 py-1 text-xs font-semibold">
                        {currentMetrics.collocations.length} Collocations
                      </Badge>
                      {currentMetrics.topicSpecificWords && currentMetrics.topicSpecificWords.length > 0 && (
                        <Badge className="bg-blue-600 text-white px-3 py-1 text-xs font-semibold">
                          {currentMetrics.topicSpecificWords.length} Topic-specific Words
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {currentMetrics.collocations.map((col: { phrase: string; context: string }, idx: number) => (
                        <div key={idx} className="bg-white border-l-4 border-l-emerald-500 border border-gray-200 rounded-r-lg px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-semibold text-emerald-700 text-sm mb-1.5">{col.phrase}</div>
                          <div className="text-xs text-gray-600 leading-relaxed italic">{col.context}</div>
                        </div>
                      ))}
                    </div>
                    {currentMetrics.topicSpecificWords && currentMetrics.topicSpecificWords.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Topic-Specific Vocabulary:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentMetrics.topicSpecificWords.map((word: string, idx: number) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 text-xs">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="improvements" className="space-y-6 mt-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Areas for Improvement</h3>
                </div>
                
                {/* Weaknesses List */}
                {currentTask.weaknesses && currentTask.weaknesses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {currentTask.weaknesses.map((weakness, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-white border-l-4 border-l-orange-500 border border-gray-200 rounded-r-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="mt-0.5">
                          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed flex-1">{weakness}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lexical Errors */}
                {currentMetrics?.lexicalErrors && currentMetrics.lexicalErrors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-red-600 text-white px-3 py-1 text-xs font-semibold">
                        {currentMetrics.lexicalErrors.length} Lexical Errors
                      </Badge>
                      {currentMetrics.grammaticalErrors && currentMetrics.grammaticalErrors.length > 0 && (
                        <Badge className="bg-orange-600 text-white px-3 py-1 text-xs font-semibold">
                          {currentMetrics.grammaticalErrors.length} Grammatical Errors
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      {currentMetrics.lexicalErrors.map((error: { original: string; corrected: string; context?: string }, idx: number) => (
                        <div key={idx} className="bg-white border-l-4 border-l-red-500 border border-gray-200 rounded-r-lg p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="text-red-600 font-bold text-lg">×</div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-800 mb-1">
                                <span className="line-through text-red-600 font-medium decoration-2">{error.original}</span>
                                <span className="mx-2 text-gray-400">→</span>
                                <span className="text-emerald-600 font-semibold">{error.corrected}</span>
                              </div>
                              {error.context && (
                                <div className="text-xs text-gray-500 mt-2 italic bg-gray-50 px-2 py-1 rounded">
                                  {error.context}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grammatical Errors */}
                {currentMetrics?.grammaticalErrors && currentMetrics.grammaticalErrors.length > 0 && (
                  <div className="mb-6">
                    <div className="space-y-3">
                      {currentMetrics.grammaticalErrors.map((error: { original: string; corrected: string; context?: string }, idx: number) => (
                        <div key={idx} className="bg-white border-l-4 border-l-orange-500 border border-gray-200 rounded-r-lg p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="text-orange-600 font-bold text-lg">×</div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-800 mb-1">
                                <span className="line-through text-orange-600 font-medium decoration-2">{error.original}</span>
                                <span className="mx-2 text-gray-400">→</span>
                                <span className="text-emerald-600 font-semibold">{error.corrected}</span>
                              </div>
                              {error.context && (
                                <div className="text-xs text-gray-500 mt-2 italic bg-gray-50 px-2 py-1 rounded">
                                  {error.context}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {currentTask.suggestions && currentTask.suggestions.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg">Improvement Suggestions</h4>
                    </div>
                    <div className="space-y-3">
                      {currentTask.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-white border-l-4 border-l-blue-500 border border-gray-200 rounded-r-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="mt-0.5">
                            <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed flex-1">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upgraded" className="space-y-6 mt-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Upgraded Essay</h3>
                </div>
                {currentTask.upgradedEssay ? (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Improved Version
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                      {currentTask.upgradedEssay}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                    <p className="text-gray-500">No upgraded essay available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          </CardContent>
        </Card>
    </div>
  );
};

export default WritingResults;


