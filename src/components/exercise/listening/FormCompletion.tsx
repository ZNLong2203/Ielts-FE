"use client"

import { useState } from "react"
import { ICourseQuestion } from "@/interface/courseQuestion"

interface FormCompletionProps {
  question: ICourseQuestion
  userAnswer: string | null
  onAnswerChange: (answer: string) => void
  showResults?: boolean
  isCorrect?: boolean
}

export function FormCompletion({
  question,
  userAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect = false,
}: FormCompletionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{question.question_text}</h3>
        <div className="space-y-4">
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
            placeholder="Type your answer here..."
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

