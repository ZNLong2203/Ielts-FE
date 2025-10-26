'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Lightbulb
} from 'lucide-react'
import { WritingGradeResponse } from '@/api/writing'

type TabType = 'overview' | 'strengths' | 'improvements' | 'upgraded' | 'sample'

export default function DetailedResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<WritingGradeResponse | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [taskType, setTaskType] = useState<'task_1' | 'task_2'>('task_1')

  useEffect(() => {
    const savedResult = localStorage.getItem('writingResult')
    if (savedResult) {
      const parsed = JSON.parse(savedResult)
      setResult(parsed)
      setTaskType(parsed.taskType || 'task_2')
    } else {
      router.push('/student/learn/writing')
    }
  }, [router])

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-gray-500">Loading results...</div>
      </div>
    )
  }

  const currentMetrics = taskType === 'task_1' 
    ? result.detailedMetrics?.task1 
    : result.detailedMetrics?.task2

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-600'
    if (score >= 5) return 'text-blue-600'
    return 'text-orange-600'
  }

  const getLevelColor = (level: string) => {
    if (level.includes('Excellent')) return 'bg-emerald-100 text-emerald-700 border-emerald-300'
    if (level.includes('Very Good')) return 'bg-blue-100 text-blue-700 border-blue-300'
    if (level.includes('Good')) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    return 'bg-orange-100 text-orange-700 border-orange-300'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-blue-700"
            onClick={() => router.push('/student/learn/writing')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Kết quả chi tiết</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="bg-white text-blue-600 hover:bg-slate-100"
            onClick={() => router.push('/student/learn/writing')}
          >
            Hoàn thành
          </Button>
        </div>
      </div>

      <div className="flex gap-6 px-6 py-6">
        {/* Left Sidebar - Question */}
        <div className="w-1/3 bg-white rounded-lg border border-slate-200 p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-600">Writing Task {taskType === 'task_1' ? '1' : '2'}</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              {"< Câu trước"}
            </Button>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400">▼</span>
              <span className="font-semibold text-gray-700">Question</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {result.question || 'Write an essay responding to the question below.'}
            </p>
            
            {/* Task-specific data table for Task 1 */}
            {taskType === 'task_1' && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-3 py-2 text-sm font-semibold">
                  New York City (all five districts)
                </div>
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-r border-slate-200">Year</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Population</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="px-3 py-2 text-sm text-gray-700">1800</td>
                      <td className="px-3 py-2 text-sm text-gray-700">79,216</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-3 py-2 text-sm text-gray-700">1900</td>
                      <td className="px-3 py-2 text-sm text-gray-700">3,437,202</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-sm text-gray-700">2000</td>
                      <td className="px-3 py-2 text-sm text-gray-700">8,009,185</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 justify-end"
          >
            {"Câu tiếp >"}
          </Button>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1">

          {/* Criteria Tabs */}
          <div className="bg-white border border-slate-200 rounded-t-lg mb-6">
            <div className="flex gap-2 p-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('strengths')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'strengths'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ưu điểm
              </button>
              <button
                onClick={() => setActiveTab('improvements')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'improvements'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cần cải thiện
              </button>
              <button
                onClick={() => setActiveTab('upgraded')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'upgraded'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bài nâng cấp
              </button>
              <button
                onClick={() => setActiveTab('sample')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'sample'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bài mẫu
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          <Card className="border-slate-200">
            <CardContent className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className={`text-5xl font-bold inline-block ${getScoreColor(currentMetrics?.score || result.overallScore)}`}>
                      {currentMetrics?.score?.toFixed(1) || result.overallScore.toFixed(1)}
                    </div>
                  </div>

                  {/* Score Description */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {currentMetrics?.scoreDescription || 'Overall score based on all assessment criteria'}
                    </p>
                  </div>

                  {/* Criteria Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Chi tiết đánh giá</h3>
                    {currentMetrics?.criteriaBreakdown && (
                      <div className="grid grid-cols-1 gap-4">
                        {Object.entries(currentMetrics.criteriaBreakdown).map(([key, value]) => (
                          <div key={key} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-semibold text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <Badge className={getLevelColor(value.level)}>
                                {value.level}
                              </Badge>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${value.score}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600">{value.feedback}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'strengths' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Điểm mạnh</h3>
                  
                  {/* Collocations */}
                  {currentMetrics?.collocations && currentMetrics.collocations.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge className="bg-emerald-600 text-white">
                          {currentMetrics.collocations.length} Collocations
                        </Badge>
                        <Badge className="bg-blue-600 text-white">
                          {currentMetrics.topicSpecificWords?.length || 0} Topic specific words
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {currentMetrics.collocations.map((col, idx) => (
                          <div key={idx} className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-emerald-700 text-sm mb-1">{col.phrase}</div>
                                <div className="text-xs text-gray-600">{col.context}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'improvements' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Cần cải thiện</h3>
                  
                  {/* Lexical Errors */}
                  {currentMetrics?.lexicalErrors && currentMetrics.lexicalErrors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-red-600 text-white">
                          {currentMetrics.lexicalErrors.length} Lexical errors
                        </Badge>
                        <Badge className="bg-orange-600 text-white">
                          {currentMetrics.grammaticalErrors?.length || 0} Grammatical errors
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {currentMetrics.lexicalErrors.map((error, idx) => (
                          <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                            <div className="text-sm text-gray-700">
                              <span className="line-through text-red-600 font-medium">{error.original}</span>
                              {' → '}
                              <span className="text-emerald-600 font-semibold">{error.corrected}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{error.context}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {currentMetrics?.improvements && currentMetrics.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Đề xuất cải thiện</h4>
                      <div className="space-y-2">
                        {currentMetrics.improvements.map((improvement, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'upgraded' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Bài nâng cấp</h3>
                  {result.upgradedEssay ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {result.upgradedEssay}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No upgraded essay available</p>
                  )}
                </div>
              )}

              {activeTab === 'sample' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Bài mẫu</h3>
                  {result.sampleAnswer ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {result.sampleAnswer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sample answer available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
