"use client"

import { ICourseQuestion } from "@/interface/courseQuestion"
import { CheckCircle2, XCircle } from "lucide-react"

interface TrueFalseNotGivenProps {
  question: ICourseQuestion
  userAnswer: string | null
  onAnswerChange: (answer: string) => void
  showResults?: boolean
  isCorrect?: boolean
}

const options = [
  { id: 'true', label: 'True', value: 'True' },
  { id: 'false', label: 'False', value: 'False' },
  { id: 'not_given', label: 'Not Given', value: 'Not Given' },
]

export function TrueFalseNotGiven({
  question,
  userAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect = false,
}: TrueFalseNotGivenProps) {
  const correctAnswer = question.correct_answer?.toLowerCase() || ''
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{question.question_text}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {options.map((option) => {
            const isSelected = userAnswer === option.id
            const isCorrectOption = correctAnswer === option.id || correctAnswer === option.value.toLowerCase()
            const showCorrect = showResults && isCorrectOption
            const showIncorrect = showResults && isSelected && !isCorrectOption
            
            return (
              <button
                key={option.id}
                onClick={() => !showResults && onAnswerChange(option.id)}
                disabled={showResults}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  showCorrect
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : showIncorrect
                    ? 'border-red-500 bg-red-50 shadow-sm'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className={`font-bold text-lg ${
                    showCorrect ? 'text-green-700' : 
                    showIncorrect ? 'text-red-700' : 
                    'text-slate-700'
                  }`}>
                    {option.label}
                  </span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
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

