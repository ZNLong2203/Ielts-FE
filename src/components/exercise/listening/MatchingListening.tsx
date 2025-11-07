"use client"

import { useState } from "react"
import { ICourseQuestion } from "@/interface/courseQuestion"
import { CheckCircle2, XCircle } from "lucide-react"

interface MatchingListeningProps {
  question: ICourseQuestion
  userAnswer: string | null
  onAnswerChange: (answer: string) => void
  showResults?: boolean
  isCorrect?: boolean
}

export function MatchingListening({
  question,
  userAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect = false,
}: MatchingListeningProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{question.question_text}</h3>
        <div className="space-y-3">
          {question.question_options?.map((option, index) => {
            const isSelected = userAnswer === option.id
            const optionLabel = String.fromCharCode(65 + index) // A, B, C, D
            const isCorrectOption = option.is_correct
            const showCorrect = showResults && isCorrectOption
            const showIncorrect = showResults && isSelected && !isCorrectOption
            
            return (
              <button
                key={option.id}
                onClick={() => !showResults && onAnswerChange(option.id!)}
                disabled={showResults}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  showCorrect
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : showIncorrect
                    ? 'border-red-500 bg-red-50 shadow-sm'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${
                    showCorrect
                      ? 'bg-green-500 text-white'
                      : showIncorrect
                      ? 'bg-red-500 text-white'
                      : isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className="text-sm">{optionLabel}</span>
                  </div>
                  <p className={`font-medium flex-1 ${
                    showCorrect ? 'text-green-700 font-semibold' : 
                    showIncorrect ? 'text-red-700' : 
                    'text-slate-700'
                  }`}>
                    {option.option_text}
                  </p>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                </div>
              </button>
            )
          })}
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

