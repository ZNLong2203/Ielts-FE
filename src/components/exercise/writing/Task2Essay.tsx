"use client"

import { useState } from "react"
import { FileText, Lightbulb, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react"

interface Task2EssayProps {
  essayType: 'opinion' | 'discussion' | 'problem-solution' | 'advantages-disadvantages' | 'two-part'
  question: string
  userAnswer: string
  onAnswerChange: (answer: string) => void
  wordCount?: number
  minWords?: number
}

export function Task2Essay({
  essayType,
  question,
  userAnswer,
  onAnswerChange,
  wordCount = 0,
  minWords = 250,
}: Task2EssayProps) {
  const getEssayTypeInfo = () => {
    switch (essayType) {
      case 'opinion':
        return {
          icon: <Lightbulb className="w-6 h-6" />,
          name: 'Opinion Essay',
          tips: [
            'State your opinion clearly in the introduction',
            'Support your opinion with reasons and examples',
            'Address counterarguments if relevant',
            'Restate your opinion in the conclusion'
          ]
        }
      case 'discussion':
        return {
          icon: <MessageSquare className="w-6 h-6" />,
          name: 'Discussion Essay',
          tips: [
            'Present both sides of the argument',
            'Give your opinion if asked',
            'Use balanced language',
            'Conclude by summarizing both views'
          ]
        }
      case 'problem-solution':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          name: 'Problem-Solution Essay',
          tips: [
            'Identify the problem clearly',
            'Propose practical solutions',
            'Explain how solutions address the problem',
            'Consider potential challenges'
          ]
        }
      case 'advantages-disadvantages':
        return {
          icon: <CheckCircle2 className="w-6 h-6" />,
          name: 'Advantages-Disadvantages Essay',
          tips: [
            'Present both advantages and disadvantages',
            'Use clear structure',
            'Provide examples for each point',
            'Give your opinion if asked'
          ]
        }
      case 'two-part':
        return {
          icon: <FileText className="w-6 h-6" />,
          name: 'Two-Part Question Essay',
          tips: [
            'Answer both parts of the question',
            'Ensure balanced coverage',
            'Connect the two parts logically',
            'Provide examples for each part'
          ]
        }
      default:
        return {
          icon: <FileText className="w-6 h-6" />,
          name: 'Essay',
          tips: []
        }
    }
  }

  const typeInfo = getEssayTypeInfo()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          {typeInfo.icon}
          <h3 className="text-lg font-bold text-slate-800">Task 2: {typeInfo.name}</h3>
        </div>
        
        {/* Question */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-4">
          <p className="text-slate-700 font-medium">{question}</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
          <p className="text-sm text-slate-700 font-medium">
            Write at least {minWords} words. Give reasons for your answer and include any relevant examples from your own knowledge or experience.
          </p>
        </div>

        {/* Word Count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-600">Word Count: {wordCount}</span>
          <span className={`text-sm font-semibold ${
            wordCount >= minWords ? 'text-green-600' : 'text-red-600'
          }`}>
            {wordCount >= minWords ? '✓ Minimum reached' : `Need ${minWords - wordCount} more words`}
          </span>
        </div>

        {/* Answer Textarea */}
        <textarea
          value={userAnswer}
          onChange={(e) => {
            onAnswerChange(e.target.value)
            // Word count would be calculated in parent component
          }}
          placeholder="Write your essay here..."
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 min-h-[400px]"
        />

        {/* Tips */}
        {typeInfo.tips.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-yellow-800 mb-2">Tips for {typeInfo.name}:</p>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              {typeInfo.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

