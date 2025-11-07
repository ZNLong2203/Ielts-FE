"use client"

import { useState } from "react"
import { Mic, MicOff } from "lucide-react"

interface Part3DiscussionProps {
  question: string
  followUpQuestions?: string[]
  onRecordingChange?: (isRecording: boolean) => void
  onAnswerSubmit?: (answer: string) => void
}

export function Part3Discussion({
  question,
  followUpQuestions = [],
  onRecordingChange,
  onAnswerSubmit,
}: Part3DiscussionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [answer, setAnswer] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const handleToggleRecording = () => {
    const newState = !isRecording
    setIsRecording(newState)
    onRecordingChange?.(newState)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < followUpQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnswer("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Part 3: Discussion</h3>
        
        {/* Main Question */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg mb-4">
          <p className="text-slate-700 font-medium">{question}</p>
        </div>

        {/* Follow-up Questions */}
        {followUpQuestions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-600 mb-2">Follow-up Questions:</p>
            <div className="space-y-2">
              {followUpQuestions.map((q, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 ${
                    index === currentQuestionIndex
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p className="text-sm text-slate-700">{q}</p>
                </div>
              ))}
            </div>
            {currentQuestionIndex < followUpQuestions.length - 1 && (
              <button
                onClick={handleNextQuestion}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
              >
                Next Question
              </button>
            )}
          </div>
        )}

        {/* Recording Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Start Recording</span>
                </>
              )}
            </button>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-medium">Recording...</span>
              </div>
            )}
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here (optional)..."
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 min-h-[120px]"
          />
          <button
            onClick={() => onAnswerSubmit?.(answer)}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  )
}

