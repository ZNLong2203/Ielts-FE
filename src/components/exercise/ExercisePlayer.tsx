"use client"

import { useState, useEffect } from "react"
import { IExercise } from "@/interface/exercise"
import { ICourseQuestion } from "@/interface/courseQuestion"
import { X, Play, Pause, Rewind, FastForward, Volume2, Settings, ChevronDown, ChevronUp, Star } from "lucide-react"

interface ExercisePlayerProps {
  exercise: IExercise
  onClose: () => void
}

interface UserAnswer {
  questionId: string
  answer: string | string[] | null
}

export default function ExercisePlayer({ exercise, onClose }: ExercisePlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const questions = exercise.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const skillType = (exercise as any).skill_type || 'general'

  // Initialize answers
  useEffect(() => {
    const initialAnswers: Record<string, UserAnswer> = {}
    questions.forEach((q) => {
      initialAnswers[q.id] = {
        questionId: q.id,
        answer: q.question_type === 'multiple_choice' ? null : q.question_type === 'fill_blank' ? '' : null,
      }
    })
    setUserAnswers(initialAnswers)
  }, [questions])

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, answer },
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(false)
    }
  }

  const handleSubmit = () => {
    // Calculate score
    let correct = 0
    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id]?.answer
      if (q.question_type === 'multiple_choice') {
        const correctOption = q.question_options?.find((opt) => opt.is_correct)
        if (correctOption && userAnswer === correctOption.id) {
          correct++
        }
      } else if (q.question_type === 'fill_blank') {
        const correctAnswer = (q as any).correct_answer || ''
        if (userAnswer?.toString().toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
          correct++
        }
      }
    })
    setScore({ correct, total: questions.length })
    setShowResults(true)
  }

  const renderQuestion = (question: ICourseQuestion) => {
    const userAnswer = userAnswers[question.id]?.answer

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-bold text-lg">{question.ordering || currentQuestionIndex + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 leading-relaxed">{question.question_text}</h3>
                </div>
              </div>

              {question.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img src={question.image_url} alt="Question" className="w-full h-auto rounded-xl" />
                </div>
              )}

              <div className="space-y-3">
                {question.question_options?.map((option, index) => {
                  const isSelected = userAnswer === option.id
                  const optionLabel = String.fromCharCode(65 + index) // A, B, C, D
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerChange(question.id, option.id!)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span className="font-bold text-sm">{optionLabel}</span>
                        </div>
                        <p className="text-slate-700 font-medium flex-1">{option.option_text}</p>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white font-bold text-lg">{question.ordering || currentQuestionIndex + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 leading-relaxed">
                    {question.question_text.split('_____').map((part, index, arr) => (
                      <span key={index}>
                        {part}
                        {index < arr.length - 1 && (
                          <input
                            type="text"
                            value={userAnswer?.toString() || ''}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="inline-block mx-2 px-4 py-2 border-2 border-blue-400 rounded-lg bg-blue-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold text-slate-800 min-w-[120px] text-center"
                            placeholder="?"
                          />
                        )}
                      </span>
                    ))}
                  </h3>
                </div>
              </div>

              {question.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img src={question.image_url} alt="Question" className="w-full h-auto rounded-xl" />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <p className="text-slate-700">{question.question_text}</p>
          </div>
        )
    }
  }

  const renderAudioPlayer = () => {
    const audioUrl = exercise.audio_url || (currentQuestion?.audio_url)
    if (!audioUrl) return null

    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 shadow-xl mb-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6 mb-6">
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <Rewind className="w-5 h-5 text-white" />
              <span className="absolute text-xs text-white mt-12">10</span>
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-purple-600" />
              ) : (
                <Play className="w-10 h-10 text-purple-600 ml-1" />
              )}
            </button>

            <button
              onClick={() => setCurrentTime(currentTime + 10)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <FastForward className="w-5 h-5 text-white" />
              <span className="absolute text-xs text-white mt-12">10</span>
            </button>
          </div>

          <div className="w-full space-y-3">
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / (currentQuestion?.audio_duration || 60)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-white">
              <span className="text-sm font-medium">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
                <Settings className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-medium">{formatTime(currentQuestion?.audio_duration || 60)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (showResults) {
    const percentage = (score.correct / score.total) * 100
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              <span className="text-white text-4xl font-bold">{percentage}%</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              {percentage >= 70 ? 'Tuyệt vời!' : percentage >= 50 ? 'Tốt lắm!' : 'Cố gắng thêm nhé!'}
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Bạn đã trả lời đúng {score.correct}/{score.total} câu hỏi
            </p>
            
            <div className="space-y-4 mb-8">
              {questions.map((q, index) => {
                const userAnswer = userAnswers[q.id]?.answer
                let isCorrect = false
                
                if (q.question_type === 'multiple_choice') {
                  const correctOption = q.question_options?.find((opt) => opt.is_correct)
                  isCorrect = correctOption?.id === userAnswer
                } else if (q.question_type === 'fill_blank') {
                  const correctAnswer = (q as any).correct_answer || ''
                  isCorrect = userAnswer?.toString().toLowerCase().trim() === correctAnswer.toLowerCase().trim()
                }

                return (
                  <div key={q.id} className={`p-4 rounded-xl border-2 ${
                    isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 mb-1">
                          Câu {index + 1}: {q.question_text}
                        </p>
                        <p className="text-sm text-slate-600">
                          {isCorrect ? '✓ Đáp án đúng' : `✗ Đáp án sai. Đáp án đúng: ${(q as any).correct_answer || 'N/A'}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowResults(false)
                  setCurrentQuestionIndex(0)
                  setShowExplanation(false)
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Làm lại
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{exercise.title}</h1>
                {exercise.instruction && (
                  <p className="text-sm text-slate-600 mt-1">{exercise.instruction}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-blue-700 font-semibold text-sm">
                  Câu {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
              {skillType && (
                <div className={`px-4 py-2 rounded-full font-semibold text-sm capitalize ${
                  skillType === 'reading' ? 'bg-green-100 text-green-700' :
                  skillType === 'listening' ? 'bg-purple-100 text-purple-700' :
                  skillType === 'writing' ? 'bg-orange-100 text-orange-700' :
                  skillType === 'speaking' ? 'bg-pink-100 text-pink-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {skillType === 'reading' ? 'Reading' :
                   skillType === 'listening' ? 'Listening' :
                   skillType === 'writing' ? 'Writing' :
                   skillType === 'speaking' ? 'Speaking' : 'General'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Audio Player for Listening */}
        {skillType === 'listening' && renderAudioPlayer()}

        {/* Question */}
        {currentQuestion && renderQuestion(currentQuestion)}

        {/* Explanation Section */}
        {currentQuestion?.explanation && (
          <div className="mt-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full bg-blue-600 text-white rounded-xl p-4 flex items-center justify-between hover:bg-blue-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Giải thích đáp án</span>
              </div>
              {showExplanation ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {showExplanation && (
              <div className="bg-white rounded-xl p-6 mt-2 border-2 border-blue-200 shadow-lg">
                <h3 className="font-bold text-slate-800 mb-4">Transcript, Giải thích đáp án</h3>
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              currentQuestionIndex === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            ← Câu trước
          </button>

          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 w-8'
                    : userAnswers[questions[index].id]?.answer
                    ? 'bg-green-400'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Câu sau →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

