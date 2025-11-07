"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Clock, Play, Pause } from "lucide-react"

interface Part2CueCardProps {
  topic: string
  points: string[]
  preparationTime?: number // in seconds, default 60
  speakingTime?: number // in seconds, default 120
  onRecordingChange?: (isRecording: boolean) => void
  onAnswerSubmit?: (answer: string) => void
}

export function Part2CueCard({
  topic,
  points,
  preparationTime = 60,
  speakingTime = 120,
  onRecordingChange,
  onAnswerSubmit,
}: Part2CueCardProps) {
  const [isPreparing, setIsPreparing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [prepTimeLeft, setPrepTimeLeft] = useState(preparationTime)
  const [speakTimeLeft, setSpeakTimeLeft] = useState(speakingTime)
  const [answer, setAnswer] = useState("")

  useEffect(() => {
    if (isPreparing && prepTimeLeft > 0) {
      const timer = setTimeout(() => setPrepTimeLeft(prepTimeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isPreparing && prepTimeLeft === 0) {
      setIsPreparing(false)
      setIsSpeaking(true)
    }
  }, [isPreparing, prepTimeLeft])

  useEffect(() => {
    if (isSpeaking && speakTimeLeft > 0) {
      const timer = setTimeout(() => setSpeakTimeLeft(speakTimeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isSpeaking && speakTimeLeft === 0) {
      setIsSpeaking(false)
      onRecordingChange?.(false)
    }
  }, [isSpeaking, speakTimeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartPreparation = () => {
    setIsPreparing(true)
    setPrepTimeLeft(preparationTime)
  }

  const handleStartSpeaking = () => {
    setIsSpeaking(true)
    setIsPreparing(false)
    setSpeakTimeLeft(speakingTime)
    onRecordingChange?.(true)
  }

  const handleStopRecording = () => {
    setIsSpeaking(false)
    onRecordingChange?.(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Part 2: Long Turn (Cue Card)</h3>
        
        {/* Topic Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
          <h4 className="text-xl font-bold text-slate-800 mb-4">{topic}</h4>
          <div className="space-y-2">
            {points.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-slate-700 font-medium">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation Phase */}
        {!isPreparing && !isSpeaking && (
          <div className="space-y-4">
            <button
              onClick={handleStartPreparation}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              <span>Start Preparation ({preparationTime}s)</span>
            </button>
          </div>
        )}

        {/* Preparation Timer */}
        {isPreparing && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-yellow-700">{formatTime(prepTimeLeft)}</span>
            </div>
            <p className="text-center text-slate-700 font-medium">Preparation Time</p>
            {prepTimeLeft === 0 && (
              <button
                onClick={handleStartSpeaking}
                className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-5 h-5" />
                <span>Start Speaking ({speakingTime}s)</span>
              </button>
            )}
          </div>
        )}

        {/* Speaking Phase */}
        {isSpeaking && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Mic className="w-8 h-8 text-red-600" />
              <span className="text-3xl font-bold text-red-700">{formatTime(speakTimeLeft)}</span>
            </div>
            <p className="text-center text-slate-700 font-medium">Speaking Time</p>
            <button
              onClick={handleStopRecording}
              className="w-full mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <MicOff className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          </div>
        )}

        {/* Answer Textarea */}
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here (optional)..."
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[150px]"
        />
        <button
          onClick={() => onAnswerSubmit?.(answer)}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Submit Answer
        </button>
      </div>
    </div>
  )
}

