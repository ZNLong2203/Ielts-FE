"use client"

import { ICourseQuestion } from "@/interface/courseQuestion"

interface DiagramLabelProps {
  question: ICourseQuestion
  userAnswer: string | null
  onAnswerChange: (answer: string) => void
  showResults?: boolean
  isCorrect?: boolean
}

export function DiagramLabel({
  question,
  userAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect = false,
}: DiagramLabelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{question.question_text}</h3>
        {question.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden border-2 border-slate-200">
            <img src={question.image_url} alt="Diagram" className="w-full h-auto" />
          </div>
        )}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Label the diagram:
          </label>
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
            placeholder="Enter label..."
          />
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

