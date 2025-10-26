'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Eye } from 'lucide-react'
import { WritingGradeResponse } from '@/api/writing'

export default function WritingResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<WritingGradeResponse | null>(null)
  const [taskType, setTaskType] = useState<'task_1' | 'task_2'>('task_2')

  useEffect(() => {
    // Get result from localStorage or params
    const savedResult = localStorage.getItem('writingResult')
    if (savedResult) {
      const parsed = JSON.parse(savedResult)
      setResult(parsed)
      setTaskType(parsed.taskType || 'task_2')
    } else {
      router.push('/student/learn/writing')
    }
  }, [router])

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-600'
    if (score >= 5) return 'text-blue-600'
    return 'text-orange-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 7) return 'bg-emerald-50 border-emerald-200'
    if (score >= 5) return 'bg-blue-50 border-blue-200'
    return 'bg-orange-50 border-orange-200'
  }

  const handleViewDetails = () => {
    router.push(`/student/learn/writing/detailed-results`)
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500">Loading results...</div>
        </div>
      </div>
    )
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
          <h1 className="text-xl font-bold">
            Kết quả {taskType === 'task_1' ? 'Task 1' : 'Task 2'}
          </h1>
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


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Congratulations Card */}
        <Card className="mb-6 border-2 border-slate-200 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">P</span>
                </div>
                <span className="text-gray-500">23/10/2025</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-gray-700 mb-2">Congratulations!</div>
              <div className="text-2xl font-bold text-slate-900 mb-2">
                Nguyễn Ngọc Long
              </div>
              {/* <div className="text-sm text-gray-600">
                has completed Writing Test &quot;IELTS Handbook 20 - Test 1&quot;
              </div> */}
            </div>

            {/* Overall Score */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-bold ${getScoreColor(result.overallScore || 0)}`}>
                  {(result.overallScore || 0).toFixed(1)}
                </span>
                <span className="text-xl text-gray-600 font-medium">Overall</span>
              </div>
            </div>

            {/* Task Scores - Display only for the current task type */}
            <div className="grid grid-cols-1 gap-6">
              <div className={`p-6 rounded-xl border-2 ${getScoreBgColor(result.overallScore || 0)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-3xl font-bold ${getScoreColor(result.overallScore || 0)}`}>
                    {(result.overallScore || 0).toFixed(1)}
                  </div>
                  <span className="text-gray-700 font-semibold">
                    {taskType === 'task_1' ? 'Writing Task 1' : 'Writing Task 2'}
                  </span>
                </div>
                
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    {taskType === 'task_1' ? 'Task Achievement' : 'Task Response'}: {(result.taskAchievement || 0).toFixed(1)}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Coherence and Cohesion: {(result.coherenceCohesion || 0).toFixed(1)}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Lexical Resource: {(result.lexicalResource || 0).toFixed(1)}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Grammatical Range and Accuracy: {(result.grammaticalRangeAccuracy || 0).toFixed(1)}
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="text-right mt-6 text-sm text-gray-500">
              {/* by prepedu.com */}
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleViewDetails}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            <Eye className="mr-2 h-5 w-5" />
            Xem kết quả chi tiết
          </Button>
        </div>
      </div>
    </div>
  )
}
