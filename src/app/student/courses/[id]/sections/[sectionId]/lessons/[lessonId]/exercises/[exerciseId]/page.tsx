"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Pause, Rewind, FastForward, Volume2, Settings, ChevronDown, ChevronUp, Star, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { IExercise } from "@/interface/exercise"
import { ICourseQuestion } from "@/interface/courseQuestion"
import { mockExercises } from "@/data/mockExercises"

interface UserAnswer {
  questionId: string
  answer: string | string[] | null
}

export default function ExercisePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const sectionId = params.sectionId as string
  const lessonId = params.lessonId as string
  const exerciseId = params.exerciseId as string

  const [allExercises, setAllExercises] = useState<IExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [questionResults, setQuestionResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load all mock exercises
    setAllExercises(mockExercises)
    
    // Find current exercise index
    const foundIndex = mockExercises.findIndex((ex) => ex.id === exerciseId)
    if (foundIndex >= 0) {
      setCurrentExerciseIndex(foundIndex)
    }
  }, [exerciseId])

  // Initialize answers when exercise changes
  useEffect(() => {
    const currentExercise = allExercises[currentExerciseIndex]
    if (currentExercise) {
      const initialAnswers: Record<string, UserAnswer> = {}
      currentExercise.questions?.forEach((q) => {
        initialAnswers[q.id] = {
          questionId: q.id,
          answer: q.question_type === 'multiple_choice' ? null : q.question_type === 'fill_blank' ? '' : null,
        }
      })
      setUserAnswers(initialAnswers)
      setExpandedExplanations({})
    }
  }, [currentExerciseIndex, allExercises])

  const handleExerciseChange = (index: number) => {
    if (index >= 0 && index < allExercises.length) {
      setCurrentExerciseIndex(index)
      const exercise = allExercises[index]
      router.replace(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/exercises/${exercise.id}`, { scroll: false })
    }
  }

  const exercise = allExercises[currentExerciseIndex] || null
  const questions = exercise?.questions || []
  const skillType = (exercise as any)?.skill_type || 'general'

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, answer },
    }))
  }

  const toggleExplanation = (questionId: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
  }

  const handleSubmit = () => {
    // Calculate score and results for each question
    const results: Record<string, boolean> = {}
    let correct = 0
    
    questions.forEach((q) => {
      const userAnswer = userAnswers[q.id]?.answer
      let isCorrect = false
      
      if (q.question_type === 'multiple_choice') {
        const correctOption = q.question_options?.find((opt) => opt.is_correct)
        isCorrect = correctOption ? userAnswer === correctOption.id : false
      } else if (q.question_type === 'fill_blank') {
        const correctAnswer = (q as any).correct_answer || ''
        isCorrect = userAnswer?.toString().toLowerCase().trim() === correctAnswer.toLowerCase().trim()
      }
      
      results[q.id] = isCorrect
      if (isCorrect) correct++
    })
    
    setQuestionResults(results)
    setScore({ correct, total: questions.length })
    setShowResults(true)
  }
  
  const getQuestionResult = (questionId: string): boolean | null => {
    if (!showResults) return null
    return questionResults[questionId] ?? null
  }

  const renderQuestion = (question: ICourseQuestion, index: number) => {
    const userAnswer = userAnswers[question.id]?.answer
    const questionResult = getQuestionResult(question.id)
    const isCorrect = questionResult === true
    const isIncorrect = questionResult === false

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                    showResults && isCorrect
                      ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                      : showResults && isIncorrect
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 leading-relaxed">{question.question_text}</h3>
                  </div>
                </div>
                {showResults && questionResult !== null && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${
                    isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {question.image_url && (
                <div className="mb-8 rounded-xl overflow-hidden border border-slate-200">
                  <img src={question.image_url} alt="Question" className="w-full h-auto rounded-xl" />
                </div>
              )}

              <div className="space-y-3">
                {question.question_options?.map((option, index) => {
                  const isSelected = userAnswer === option.id
                  const optionLabel = String.fromCharCode(65 + index) // A, B, C, D
                  const isCorrectOption = option.is_correct
                  
                  // Show correct/incorrect feedback after submit
                  const showCorrect = showResults && isCorrectOption
                  const showIncorrect = showResults && isSelected && !isCorrectOption
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => !showResults && handleAnswerChange(question.id, option.id!)}
                      disabled={showResults}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
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
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${
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
                          {showCorrect && <span className="ml-2 text-green-600 font-semibold">✓ Correct Answer</span>}
                        </p>
                        {showCorrect && (
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                        )}
                        {showIncorrect && (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                        {!showResults && isSelected && !showCorrect && !showIncorrect && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation Section - Chỉ hiển thị sau khi submit */}
              {showResults && question.explanation && (
                <div className="mt-6">
                  <button
                    onClick={() => toggleExplanation(question.id)}
                    className="w-full bg-blue-600 text-white rounded-xl p-4 flex items-center justify-between hover:bg-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">View Explanation</span>
                    </div>
                    {expandedExplanations[question.id] ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedExplanations[question.id] && (
                    <div className="bg-white rounded-xl p-6 mt-2 border-2 border-blue-200 shadow-lg">
                      <h3 className="font-bold text-slate-800 mb-4">Transcript & Explanation</h3>
                      <div className="prose max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                    showResults && isCorrect
                      ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                      : showResults && isIncorrect
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 leading-relaxed">
                      {question.question_text.split('_____').map((part, index, arr) => (
                        <span key={index}>
                          {part}
                          {index < arr.length - 1 && (
                            <span className="inline-block mx-2">
                              <input
                                type="text"
                                value={userAnswer?.toString() || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                disabled={showResults}
                                className={`inline-block px-4 py-2 border-2 rounded-lg font-semibold text-slate-800 min-w-[120px] text-center transition-all ${
                                  isCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : isIncorrect
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-blue-400 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                } ${showResults ? 'cursor-default' : 'cursor-text'}`}
                                placeholder="?"
                              />
                              {showResults && isIncorrect && (
                                <span className="ml-2 text-sm text-red-600 font-semibold">
                                  (Correct answer: {(question as any).correct_answer || 'N/A'})
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      ))}
                    </h3>
                  </div>
                </div>
                {showResults && questionResult !== null && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${
                    isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {question.image_url && (
                <div className="mb-8 rounded-xl overflow-hidden border border-slate-200">
                  <img src={question.image_url} alt="Question" className="w-full h-auto rounded-xl" />
                </div>
              )}

              {/* Explanation Section - Chỉ hiển thị sau khi submit */}
              {showResults && question.explanation && (
                <div className="mt-6">
                  <button
                    onClick={() => toggleExplanation(question.id)}
                    className="w-full bg-blue-600 text-white rounded-xl p-4 flex items-center justify-between hover:bg-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">View Explanation</span>
                    </div>
                    {expandedExplanations[question.id] ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedExplanations[question.id] && (
                    <div className="bg-white rounded-xl p-6 mt-2 border-2 border-blue-200 shadow-lg">
                      <h3 className="font-bold text-slate-800 mb-4">Transcript & Explanation</h3>
                      <div className="prose max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <p className="text-slate-700">{question.question_text}</p>
          </div>
        )
    }
  }

  const renderAudioPlayer = () => {
    const audioUrl = (exercise as any)?.audio_url || questions.find(q => q.audio_url)?.audio_url
    if (!audioUrl) return null
    
    // Get audio duration from first question with audio
    const audioQuestion = questions.find(q => q.audio_url)
    const audioDuration = audioQuestion?.audio_duration || 60

    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6 mb-6">
            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center relative"
            >
              <Rewind className="w-5 h-5 text-slate-700" />
              <span className="absolute text-xs text-slate-600 mt-12">10</span>
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center group"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-white" />
              ) : (
                <Play className="w-10 h-10 text-white ml-1" />
              )}
            </button>

            <button
              onClick={() => setCurrentTime(currentTime + 10)}
              className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center relative"
            >
              <FastForward className="w-5 h-5 text-slate-700" />
              <span className="absolute text-xs text-slate-600 mt-12">10</span>
            </button>
          </div>

          <div className="w-full space-y-3">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / audioDuration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-slate-700 w-full">
              <span className="text-sm font-medium">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform text-slate-600" />
                <Settings className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform text-slate-600" />
              </div>
              <span className="text-sm font-medium">{formatTime(audioDuration)}</span>
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

  if (!exercise || allExercises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exercise...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Exercise {currentExerciseIndex + 1}</h1>
            </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-blue-700 font-semibold text-sm">
                  {questions.length} Questions
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

      {/* Score Summary - Hiển thị khi đã submit */}
      {showResults && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl ${
                  score.correct === score.total 
                    ? 'bg-green-500 text-white' 
                    : score.correct >= score.total / 2
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {score.correct}/{score.total}
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-800">
                    {score.correct === score.total 
                      ? 'Perfect! All correct!' 
                      : score.correct >= score.total / 2
                      ? `Good job! ${score.correct} out of ${score.total} correct`
                      : `Keep trying! ${score.correct} out of ${score.total} correct`
                    }
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Score: {Math.round((score.correct / score.total) * 100)}%
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setQuestionResults({})
                    setExpandedExplanations({})
                    // Reset answers
                    const initialAnswers: Record<string, UserAnswer> = {}
                    questions.forEach((q) => {
                      initialAnswers[q.id] = {
                        questionId: q.id,
                        answer: q.question_type === 'multiple_choice' ? null : q.question_type === 'fill_blank' ? '' : null,
                      }
                    })
                    setUserAnswers(initialAnswers)
                  }}
                  className="px-5 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
                >
                  Try Again
                </button>
                {allExercises.length > 1 && currentExerciseIndex < allExercises.length - 1 ? (
                  <button
                    onClick={() => {
                      const nextIndex = currentExerciseIndex + 1
                      handleExerciseChange(nextIndex)
                      setShowResults(false)
                      setQuestionResults({})
                      setExpandedExplanations({})
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                  >
                    Next Exercise →
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    Finish Exercise
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Audio Player for Listening */}
        {skillType === 'listening' && (exercise as any)?.audio_url && renderAudioPlayer()}

        {/* All Questions - Hiển thị tất cả questions theo dạng dọc */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id}>
              {renderQuestion(question, index)}
            </div>
          ))}
        </div>

        {/* Submit Button - Chỉ hiển thị khi chưa submit */}
        {!showResults && (
          <div className="mt-12 flex flex-col items-center gap-4 pb-8">
            <button
              onClick={handleSubmit}
              className="px-10 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:scale-105"
            >
              Submit Answers
            </button>
            <p className="text-sm text-slate-500 font-medium">
              Review your answers before submitting. After submission, correct answers and explanations will be shown.
            </p>
          </div>
        )}


        {/* Exercise Selector - Thanh chọn 1, 2, 3, 4... */}
        {allExercises.length > 1 && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex flex-col items-center gap-4">
              <p className="text-slate-600 font-medium text-sm">Select Exercise</p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {allExercises.map((ex, index) => {
                  const isActive = index === currentExerciseIndex
                  const hasAnswer = ex.questions?.some((q) => userAnswers[q.id]?.answer)
                  
                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleExerciseChange(index)}
                      className={`w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg scale-110'
                          : hasAnswer
                          ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-600 border-2 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

