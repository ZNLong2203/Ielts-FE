"use client"

import { useState } from "react"
import { Mic, MicOff, Play, Pause } from "lucide-react"

interface Part1InterviewProps {
  question: string
  onRecordingChange?: (isRecording: boolean) => void
  onAnswerSubmit?: (answer: string) => void
}

export function Part1Interview({
  question,
  onRecordingChange,
  onAnswerSubmit,
}: Part1InterviewProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [answer, setAnswer] = useState("")

  const handleToggleRecording = () => {
    const newState = !isRecording
    setIsRecording(newState)
    onRecordingChange?.(newState)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Part 1: Introduction & Interview</h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
          <p className="text-slate-700 font-medium">{question}</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[120px]"
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

