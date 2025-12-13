"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Play, Pause, Rewind, FastForward, Volume2, VolumeX, Settings, ChevronDown, ChevronUp, Star, ArrowLeft, CheckCircle2, XCircle, Pin, PinOff } from "lucide-react"
import { IExercise } from "@/interface/exercise"
import { ICourseQuestion } from "@/interface/courseQuestion"
import { getExercisesByLessonId, getExerciseByLessonId, submitExercise, getExerciseSubmission } from "@/api/exercise"

interface UserAnswer {
  questionId: string
  answer: string | string[] | null
}

interface QuestionWithAnswer extends Omit<ICourseQuestion, 'correct_answer'> {
  correct_answer?: string
  alternative_answers?: string[]
}

export default function ExercisePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = params.id as string
  const sectionId = params.sectionId as string
  const lessonId = params.lessonId as string
  const exerciseId = params.exerciseId as string

  const [allExercises, setAllExercises] = useState<IExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isImagePinned, setIsImagePinned] = useState(false)
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [questionResults, setQuestionResults] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())
  const [hasLoadedSubmission, setHasLoadedSubmission] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch all exercises for the lesson
  const { data: exercisesData, isLoading: exercisesLoading } = useQuery({
    queryKey: ["exercises", lessonId],
    queryFn: () => getExercisesByLessonId(lessonId),
    enabled: !!lessonId,
  })

  // Validate if exerciseId is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  // Fetch current exercise details
  const { data: currentExerciseData, isLoading: exerciseLoading } = useQuery({
    queryKey: ["exercise", lessonId, exerciseId],
    queryFn: () => getExerciseByLessonId(lessonId, exerciseId),
    enabled: !!lessonId && !!exerciseId && isValidUUID(exerciseId),
  })

  // Fetch existing submission if any
  const { data: existingSubmission, isLoading: submissionLoading } = useQuery({
    queryKey: ["exercise-submission", lessonId, exerciseId],
    queryFn: () => getExerciseSubmission(lessonId, exerciseId),
    enabled: !!lessonId && !!exerciseId && isValidUUID(exerciseId),
    retry: false,
  })

  // Update exercises list when data is fetched
  useEffect(() => {
    if (exercisesData && Array.isArray(exercisesData)) {
      const sortedExercises = [...exercisesData].sort((a, b) => (a.ordering || 0) - (b.ordering || 0))
      setAllExercises(sortedExercises)
      
      // If exerciseId is not a valid UUID, try to find by index or use first exercise
      if (!isValidUUID(exerciseId)) {
        const index = parseInt(exerciseId) - 1
        if (index >= 0 && index < sortedExercises.length) {
          const targetExercise = sortedExercises[index]
          router.replace(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/exercises/${targetExercise.id}`, { scroll: false })
          return
        } else if (sortedExercises.length > 0) {
          // If invalid index, redirect to first exercise
          router.replace(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/exercises/${sortedExercises[0].id}`, { scroll: false })
          return
        }
      }
      
      const foundIndex = sortedExercises.findIndex((ex) => ex.id === exerciseId)
      if (foundIndex >= 0) {
        setCurrentExerciseIndex(foundIndex)
      } else if (sortedExercises.length > 0) {
        // If exercise not found, redirect to first exercise
        router.replace(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/exercises/${sortedExercises[0].id}`, { scroll: false })
      }
    }
  }, [exercisesData, exerciseId, courseId, sectionId, lessonId, router])

  // Use current exercise data from API or fallback to exercises list
  const exercise = currentExerciseData || allExercises[currentExerciseIndex] || null
  const questions = exercise?.questions || []

  useEffect(() => {
    if (existingSubmission && existingSubmission.totalQuestions > 0) {
      setShowResults(true)
      setScore({
        correct: existingSubmission.correctAnswers || 0,
        total: existingSubmission.totalQuestions || 0,
      })
      setQuestionResults(existingSubmission.questionResults || {})
      setHasLoadedSubmission(true)
      
      if (existingSubmission.answers) {
        const savedAnswers: Record<string, UserAnswer> = {}
        Object.entries(existingSubmission.answers).forEach(([questionId, answer]) => {
          savedAnswers[questionId] = {
            questionId,
            answer: answer as string | string[] | null,
          }
        })
        setUserAnswers(savedAnswers)
      }
    } else if (!submissionLoading && !existingSubmission) {
      setHasLoadedSubmission(false)
    }
  }, [existingSubmission, submissionLoading])

  useEffect(() => {
    // Don't reset if submission is still loading OR if we've already loaded a submission
    if (submissionLoading || hasLoadedSubmission) return
    
    if (exercise && !existingSubmission) {
      const initialAnswers: Record<string, UserAnswer> = {}
      const allQuestions = exercise.questions || []
      allQuestions.forEach((q) => {
        let defaultAnswer: string | string[] | null = null
        if (q.question_type === 'fill_blank') {
          defaultAnswer = ''
        } else if (q.question_type === 'multiple_choice' || q.question_type === 'droplist' || q.question_type === 'drop_list') {
          defaultAnswer = null
        }
        initialAnswers[q.id] = {
          questionId: q.id,
          answer: defaultAnswer,
        }
      })
      // Only update if there are new questions without answers
      setUserAnswers((prev) => {
        const updated = { ...prev }
        Object.entries(initialAnswers).forEach(([qId, answer]) => {
          if (!updated[qId]) {
            updated[qId] = answer
          }
        })
        return updated
      })
      setExpandedExplanations({})
      // Don't reset showResults here - let existingSubmission effect handle it
    }
  }, [exercise, existingSubmission, submissionLoading, hasLoadedSubmission])

  const handleExerciseChange = (index: number) => {
    if (index >= 0 && index < allExercises.length) {
      setCurrentExerciseIndex(index)
      const exercise = allExercises[index]
      router.replace(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/exercises/${exercise.id}`, { scroll: false })
    }
  }

  const skillType = exercise?.skill_type || 'general'
  const sharedAudioUrl = exercise?.audio_url
  const displayDuration = audioDuration > 0 ? audioDuration : 180

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleLoadedMetadata = () => {
      if (audio.duration) {
        setAudioDuration(audio.duration)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Set muted state
    audio.muted = isMuted

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [sharedAudioUrl, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(err => console.error("Error playing audio:", err))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  const handleSeek = (seconds: number) => {
    const audio = audioRef.current
    if (audio) {
      const duration = audio.duration || displayDuration
      audio.currentTime = Math.max(0, Math.min(seconds, duration))
      setCurrentTime(audio.currentTime)
    }
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
  }

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

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    if (showResults && !existingSubmission) return
    
    setIsSubmitting(true)
    try {
      const answers: Record<string, string | string[] | null> = {}
      questions.forEach((q) => {
        const userAnswer = userAnswers[q.id]?.answer
        answers[q.id] = userAnswer || null
      })

      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const response = await submitExercise(lessonId, exerciseId, answers, timeTaken)
      const submission = response?.data || response

      if (submission && submission.questionResults) {
        setQuestionResults(submission.questionResults)
        setScore({
          correct: submission.correctAnswers || 0,
          total: submission.totalQuestions || 0,
        })
        setShowResults(true)
        
        await queryClient.invalidateQueries({
          queryKey: ["exercise-submission", lessonId, exerciseId],
        })
      } else {
        throw new Error('Invalid submission response from server')
      }
    } catch (error) {
      console.error('Error submitting exercise:', error)
      // Show error message to user
      alert('Failed to submit exercise. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getQuestionResult = (questionId: string): boolean | null => {
    if (!showResults) return null
    return questionResults[questionId] ?? null
  }

  const handleTryAgain = () => {
    // Reset all states
    setShowResults(false)
    setQuestionResults({})
    setScore({ correct: 0, total: questions.length || 0 })
    setHasLoadedSubmission(false) // Reset flag to allow re-initialization
    
    // Reset answers to initial state
    const initialAnswers: Record<string, UserAnswer> = {}
    questions.forEach((q) => {
      let defaultAnswer: string | string[] | null = null
      if (q.question_type === 'fill_blank') {
        defaultAnswer = ''
      }
      initialAnswers[q.id] = {
        questionId: q.id,
        answer: defaultAnswer,
      }
    })
    setUserAnswers(initialAnswers)
    
    // Invalidate query to allow new submission
    queryClient.invalidateQueries({
      queryKey: ["exercise-submission", lessonId, exerciseId],
    })
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

              {/* Explanation Section */}
              {showResults && (question.explanation || (question as QuestionWithAnswer).correct_answer) && (
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
                      <h3 className="font-bold text-slate-800 mb-4">Explanation</h3>
                      <div className="prose max-w-none">
                        {(() => {
                          const questionWithAnswer = question as QuestionWithAnswer;
                          // Check if explanation is a JSON string that needs parsing
                          let explanationText = question.explanation;
                          let correctAnswer = questionWithAnswer.correct_answer;
                          
                          // Try to parse if it looks like JSON
                          if (explanationText && explanationText.trim().startsWith('{')) {
                            try {
                              const parsed = JSON.parse(explanationText);
                              explanationText = parsed.explanation || parsed.original_explanation || null;
                              if (!correctAnswer) {
                                correctAnswer = parsed.correct_answer;
                              }
                            } catch {
                              // If parsing fails, use as is
                            }
                          }
                          
                          // Display explanation if available, otherwise show correct answer
                          if (explanationText) {
                            return (
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {explanationText}
                                </p>
                                {correctAnswer && (
                                  <p className="text-slate-700 leading-relaxed mt-2 pt-2 border-t border-yellow-300">
                                    <strong>Correct Answer:</strong> {correctAnswer}
                                  </p>
                                )}
                              </div>
                            );
                          } else if (correctAnswer) {
                            return (
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-slate-700 leading-relaxed">
                                  <strong>Correct Answer:</strong> {correctAnswer}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'fill_blank':
        // Check if question_text contains blank placeholder (support various formats: _____, ____, ___, __, _)
        const findPlaceholder = (text: string): string | null => {
          if (!text) return null
          // Check for common placeholder patterns (longest first to match correctly)
          const patterns = ['_____', '____', '___', '__', '_']
          for (const pattern of patterns) {
            if (text.includes(pattern)) {
              return pattern
            }
          }
          return null
        }
        
        const placeholder = findPlaceholder(question.question_text || '')
        const hasBlankPlaceholder = !!placeholder
        
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
                    {hasBlankPlaceholder ? (
                      // If question has blank placeholder, split and render with input inline
                      <h3 className="text-xl font-bold text-slate-800 mb-4 leading-relaxed">
                        {question.question_text.split(placeholder!).map((part, partIndex, arr) => (
                          <span key={partIndex}>
                            {part}
                            {partIndex < arr.length - 1 && (
                              <span className="inline-block mx-2">
                                <input
                                  type="text"
                                  value={userAnswer?.toString() || ''}
                                  onChange={(e) => !showResults && handleAnswerChange(question.id, e.target.value)}
                                  disabled={showResults}
                                  className={`inline-block px-4 py-2 border-2 rounded-lg font-semibold text-slate-800 min-w-[120px] text-center transition-all ${
                                    showResults && questionResult !== null
                                      ? questionResult
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-red-500 bg-red-50'
                                      : 'border-blue-400 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                  } ${showResults ? 'cursor-default' : 'cursor-text'}`}
                                  placeholder="?"
                                />
                                {showResults && questionResult === false && (
                                  <span className="ml-2 text-sm text-red-600 font-semibold">
                                    (Correct answer: {(question as QuestionWithAnswer).correct_answer || 'N/A'})
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                        ))}
                      </h3>
                    ) : (
                      // If no blank placeholder, always show question text with input below
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 leading-relaxed">
                          {question.question_text || 'Complete the sentence'}
                        </h3>
                        <div className="mt-4">
                          <input
                            type="text"
                            value={userAnswer?.toString() || ''}
                            onChange={(e) => !showResults && handleAnswerChange(question.id, e.target.value)}
                            disabled={showResults}
                            className={`w-full px-4 py-3 border-2 rounded-lg font-semibold text-slate-800 transition-all ${
                              showResults && questionResult !== null
                                ? questionResult
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-blue-400 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            } ${showResults ? 'cursor-default' : 'cursor-text'}`}
                            placeholder="Enter your answer..."
                          />
                          {showResults && questionResult === false && (
                            <p className="mt-2 text-sm text-red-600 font-semibold">
                              Correct answer: {(question as QuestionWithAnswer).correct_answer || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
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

              {/* Explanation Section */}
              {showResults && (question.explanation || (question as QuestionWithAnswer).correct_answer) && (
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
                      <h3 className="font-bold text-slate-800 mb-4">Explanation</h3>
                      <div className="prose max-w-none">
                        {(() => {
                          const questionWithAnswer = question as QuestionWithAnswer;
                          // Check if explanation is a JSON string that needs parsing
                          let explanationText = question.explanation;
                          let correctAnswer = questionWithAnswer.correct_answer;
                          
                          // Try to parse if it looks like JSON
                          if (explanationText && explanationText.trim().startsWith('{')) {
                            try {
                              const parsed = JSON.parse(explanationText);
                              explanationText = parsed.explanation || parsed.original_explanation || null;
                              if (!correctAnswer) {
                                correctAnswer = parsed.correct_answer;
                              }
                            } catch {
                              // If parsing fails, use as is
                            }
                          }
                          
                          // Display explanation if available, otherwise show correct answer
                          if (explanationText) {
                            return (
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {explanationText}
                                </p>
                                {correctAnswer && (
                                  <p className="text-slate-700 leading-relaxed mt-2 pt-2 border-t border-yellow-300">
                                    <strong>Correct Answer:</strong> {correctAnswer}
                                  </p>
                                )}
                              </div>
                            );
                          } else if (correctAnswer) {
                            return (
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-slate-700 leading-relaxed">
                                  <strong>Correct Answer:</strong> {correctAnswer}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'droplist':
      case 'drop_list': // Support legacy format
        // Drop list question type - render as custom styled dropdown
        const selectedOption = question.question_options?.find(opt => opt.id === userAnswer?.toString())
        const correctOption = question.question_options?.find(opt => opt.is_correct)
        
        // Use questionResult from backend as source of truth (not local calculation)
        // questionResult is already set from backend submission result
        const actualIsCorrect = isCorrect // Use isCorrect from questionResult (backend)
        
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                    showResults && actualIsCorrect
                      ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                      : showResults && !actualIsCorrect
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
                    actualIsCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {actualIsCorrect ? (
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

              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={userAnswer?.toString() || ''}
                    onChange={(e) => !showResults && handleAnswerChange(question.id, e.target.value)}
                    disabled={showResults}
                    className={`w-full p-4 pr-12 rounded-xl border-2 transition-all duration-200 text-slate-700 font-medium appearance-none bg-white ${
                      showResults && actualIsCorrect
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : showResults && !actualIsCorrect
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <option value="">Select an option...</option>
                    {question.question_options?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.option_text}
                      </option>
                    ))}
                  </select>
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                    showResults && actualIsCorrect
                      ? 'text-green-600'
                      : showResults && !actualIsCorrect
                      ? 'text-red-600'
                      : 'text-slate-400'
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
                
                {/* Show selected option with feedback */}
                {showResults && selectedOption && (
                  <div className={`p-4 rounded-lg border-2 ${
                    actualIsCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {actualIsCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          actualIsCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          Your answer: <span className="font-semibold">{selectedOption.option_text}</span>
                        </p>
                        {!actualIsCorrect && correctOption && (
                          <p className="text-sm text-green-700 mt-1">
                            Correct answer: <span className="font-semibold">{correctOption.option_text}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation Section */}
              {showResults && (question.explanation || (question as QuestionWithAnswer).correct_answer) && (
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
                      <h3 className="font-bold text-slate-800 mb-4">Explanation</h3>
                      <div className="prose max-w-none">
                        {(() => {
                          const questionWithAnswer = question as QuestionWithAnswer;
                          // Check if explanation is a JSON string that needs parsing
                          let explanationText = question.explanation;
                          let correctAnswer = questionWithAnswer.correct_answer;
                          
                          // Try to parse if it looks like JSON
                          if (explanationText && explanationText.trim().startsWith('{')) {
                            try {
                              const parsed = JSON.parse(explanationText);
                              explanationText = parsed.explanation || parsed.original_explanation || null;
                              if (!correctAnswer) {
                                correctAnswer = parsed.correct_answer;
                              }
                            } catch {
                              // If parsing fails, use as is
                            }
                          }
                          
                          // Display explanation if available, otherwise show correct answer
                          if (explanationText) {
                            return (
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {explanationText}
                                </p>
                                {correctAnswer && (
                                  <p className="text-slate-700 leading-relaxed mt-2 pt-2 border-t border-yellow-300">
                                    <strong>Correct Answer:</strong> {correctAnswer}
                                  </p>
                                )}
                              </div>
                            );
                          } else if (correctAnswer) {
                            return (
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-slate-700 leading-relaxed">
                                  <strong>Correct Answer:</strong> {correctAnswer}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      default:
        // Fallback for unknown question types
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg bg-blue-100 text-blue-700 border-2 border-blue-200`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{question.question_text || 'Question'}</h3>
                  <p className="text-sm text-slate-500">Question type: {question.question_type}</p>
                  <p className="text-sm text-amber-600 mt-2">This question type is not yet supported in the UI.</p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  const renderAudioPlayer = () => {
    if (!sharedAudioUrl) return null

    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col items-center">
          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={sharedAudioUrl}
            preload="metadata"
            muted={isMuted}
            onLoadedMetadata={() => {
              if (audioRef.current && audioRef.current.duration) {
                setAudioDuration(audioRef.current.duration)
                setCurrentTime(0)
              }
            }}
          />

          <div className="flex items-center justify-center gap-8 mb-6">
            <button
              onClick={() => handleSeek(currentTime - 10)}
              className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 transition-all flex flex-col items-center justify-center relative shadow-sm hover:shadow-md group"
            >
              <Rewind className="w-6 h-6 text-slate-700 group-hover:text-slate-900" />
              <span className="text-xs text-slate-600 mt-1 font-medium">10</span>
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
              onClick={() => handleSeek(currentTime + 10)}
              className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 transition-all flex flex-col items-center justify-center relative shadow-sm hover:shadow-md group"
            >
              <FastForward className="w-6 h-6 text-slate-700 group-hover:text-slate-900" />
              <span className="text-xs text-slate-600 mt-1 font-medium">10</span>
            </button>
          </div>

          <div className="w-full space-y-3">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const percent = (e.clientX - rect.left) / rect.width
              const newTime = percent * displayDuration
              handleSeek(newTime)
            }}>
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / displayDuration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-slate-700 w-full">
              <span className="text-sm font-medium">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleMute}
                  className="cursor-pointer hover:scale-110 transition-transform text-slate-600 hover:text-slate-800"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <Settings className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform text-slate-600" />
              </div>
              <span className="text-sm font-medium">{formatTime(displayDuration)}</span>
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

  if (exercisesLoading || exerciseLoading || !exercise) {
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
    <div className={`min-h-screen bg-slate-50 ${isImagePinned ? 'fixed inset-0 z-50 lg:!ml-0' : ''}`}>
      {/* Header */}
      <div className={`sticky top-0 bg-white border-b border-slate-200 shadow-sm z-10 ${isImagePinned ? 'lg:!ml-0' : ''}`}>
        <div className={`${isImagePinned ? 'w-full' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/student/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Exercise Practice
              </h1>
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

          {/* Exercise Tabs */}
          {allExercises.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {allExercises.map((ex, index) => {
                const isActive = index === currentExerciseIndex
                const hasAnswer = ex.questions?.some((q) => userAnswers[q.id]?.answer)
                
                return (
                  <button
                    key={ex.id}
                    onClick={() => handleExerciseChange(index)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : hasAnswer
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span>Exercise {index + 1}</span>
                    {hasAnswer && !isActive && (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Score Summary */}
      {showResults && score.total > 0 && (
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
                    Score: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
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
                        answer: q.question_type === 'multiple_choice' || q.question_type === 'droplist' || q.question_type === 'drop_list' ? null : q.question_type === 'fill_blank' ? '' : null,
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
      {isImagePinned ? (() => {
        const content = exercise?.content && typeof exercise.content === 'object' 
          ? exercise.content as Record<string, unknown>
          : null;
        const imageUrl = content?.image_url as string | undefined;
        if (!imageUrl) return null;
        
        return (
          <div className="flex h-[calc(100vh-80px)] lg:pl-0">
            {/* Pinned Image - Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-slate-200 overflow-y-auto">
              <div className="w-full p-6">
                <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-slate-200 flex items-center justify-between z-10">
                  <h3 className="text-lg font-bold text-slate-800">Exercise Image</h3>
                  <button
                    onClick={() => setIsImagePinned(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <PinOff className="w-4 h-4" />
                    <span>Unpin</span>
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img src={imageUrl} alt="Exercise Image" className="w-full h-auto rounded-xl" />
                </div>
              </div>
            </div>

            {/* Questions - Right Side */}
            <div className="flex-1 lg:w-1/2 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Audio Player for Listening */}
                {skillType === 'listening' && sharedAudioUrl && renderAudioPlayer()}

                {/* Exercise Title and Instruction (without image since it's pinned) */}
                {exercise && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{exercise.title}</h2>
                    {exercise.instruction && (
                      <p className="text-slate-600 leading-relaxed">{exercise.instruction}</p>
                    )}
                    {exercise.content && typeof exercise.content === 'object' && (
                      (() => {
                        const content = exercise.content as Record<string, unknown>;
                        const passage = content?.passage as string | undefined;
                        return (
                          <>
                            {passage && (
                              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-2">Reading Passage</h3>
                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {passage}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()
                    )}
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-6">
                  {questions.length > 0 ? (
                    questions.map((question, index) => (
                      <div key={question.id}>
                        {renderQuestion(question, index)}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                      <p className="text-slate-600">No questions available for this exercise.</p>
                    </div>
                  )}
                </div>

                {/* Submit Button or Try Again Button */}
                <div className="mt-12 flex flex-col items-center gap-4 pb-8">
                  {!showResults ? (
                    <>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-10 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                      </button>
                      <p className="text-sm text-slate-500 font-medium">
                        Review your answers before submitting. After submission, correct answers and explanations will be shown.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-6">
                        <div className="text-center bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-4 rounded-xl border-2 border-blue-200">
                          <p className="text-sm text-blue-600 font-medium mb-1">Your Score</p>
                          <p className="text-3xl font-bold text-blue-700">{score.correct}/{score.total}</p>
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            {Math.round((score.correct / score.total) * 100)}%
                          </p>
                        </div>
                        <button
                          onClick={handleTryAgain}
                          className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          Try Again
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        Click &quot;Try Again&quot; to reset and attempt the exercise again.
                      </p>
                    </>
                  )}
                </div>

                {/* Exercise Selector */}
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
          </div>
        )
      })() : (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Audio Player for Listening */}
        {skillType === 'listening' && sharedAudioUrl && renderAudioPlayer()}

        {/* Exercise Title and Instruction */}
        {exercise && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{exercise.title}</h2>
            {exercise.instruction && (
              <p className="text-slate-600 leading-relaxed">{exercise.instruction}</p>
            )}
            {exercise.content && typeof exercise.content === 'object' && (
              (() => {
                const content = exercise.content as Record<string, unknown>;
                const passage = content?.passage as string | undefined;
                const imageUrl = content?.image_url as string | undefined;
                return (
                  <>
                    {passage && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-2">Reading Passage</h3>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {passage}
                        </div>
                      </div>
                    )}
                    {imageUrl && (
                      <div className="mt-4 relative group">
                        <img 
                          src={imageUrl} 
                          alt="Exercise reference" 
                          className="w-full rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => setIsImagePinned(!isImagePinned)}
                          className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm flex items-center gap-2 opacity-0 group-hover:opacity-100"
                        >
                          {isImagePinned ? (
                            <>
                              <PinOff className="w-3.5 h-3.5" />
                              <span>Unpin</span>
                            </>
                          ) : (
                            <>
                              <Pin className="w-3.5 h-3.5" />
                              <span>Pin</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={question.id}>
                {renderQuestion(question, index)}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <p className="text-slate-600">No questions available for this exercise.</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
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

        {/* Exercise Selector */}
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
      )}
    </div>
  )
}

