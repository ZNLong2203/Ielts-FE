"use client"

import { ICourseQuestion } from "@/interface/courseQuestion"

interface FlowChartCompletionProps {
  question: ICourseQuestion
  userAnswer: string | null
  onAnswerChange: (answer: string) => void
  showResults?: boolean
  isCorrect?: boolean
}

export function FlowChartCompletion({
  question,
  userAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect = false,
}: FlowChartCompletionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{question.question_text}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1 border-2 border-slate-300 rounded-lg p-3 bg-slate-50">
              <span className="text-slate-600">Step 1</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-0.5 h-6 bg-slate-300"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={showResults}
                className={`w-full px-4 py-3 border-2 rounded-lg font-medium text-slate-800 transition-all ${
                  showResults && isCorrect
                    ? 'border-green-500 bg-green-50'
                    : showResults && !isCorrect
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                } ${showResults ? 'cursor-default' : ''}`}
                placeholder="Enter step 2..."
              />
            </div>
          </div>
        </div>
        {showResults && question.explanation && (
          <div className={`mt-4 p-4 rounded-lg ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className="text-sm text-slate-700">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}

