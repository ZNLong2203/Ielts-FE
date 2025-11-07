"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, CheckCircle2, XCircle } from "lucide-react"
import { ICourseQuestion } from "@/interface/courseQuestion"

interface MatchingHeadingExerciseProps {
  questions: ICourseQuestion[]
  userAnswers: Record<string, string | null>
  onAnswerChange: (questionId: string, answer: string) => void
  showResults?: boolean
  questionResults?: Record<string, boolean>
}

interface DraggableOption {
  id: string
  text: string
  isCorrect: boolean
}

function DraggableOptionItem({ option, isDragging }: { option: DraggableOption; isDragging: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: option.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group"
    >
      <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
      <span className="flex-1 text-slate-700 font-medium text-sm">{option.text}</span>
    </div>
  )
}

function DroppableParagraph({ 
  question, 
  droppedOption, 
  onRemove,
  showResults,
  isCorrect
}: { 
  question: ICourseQuestion
  droppedOption: DraggableOption | null
  onRemove: () => void
  showResults?: boolean
  isCorrect?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${question.id}`,
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
          showResults && isCorrect
            ? 'bg-green-100 text-green-700 border-2 border-green-300'
            : showResults && !isCorrect
            ? 'bg-red-100 text-red-700 border-2 border-red-300'
            : 'bg-blue-100 text-blue-700 border-2 border-blue-200'
        }`}>
          {question.question_text.replace('Paragraph ', '')}
        </div>
        <span className="text-slate-700 font-semibold">{question.question_text}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[60px] p-3 rounded-lg flex items-center justify-center transition-all ${
          isOver
            ? 'bg-blue-50 border-2 border-dashed border-blue-400'
            : 'bg-slate-50 border-2 border-dashed border-slate-300'
        }`}
      >
        {droppedOption ? (
          <div className="flex items-center gap-2 w-full">
            <div className={`flex-1 p-2 bg-white border-2 rounded-lg shadow-sm ${
              showResults && isCorrect
                ? 'border-green-400 bg-green-50'
                : showResults && !isCorrect
                ? 'border-red-400 bg-red-50'
                : 'border-blue-400'
            }`}>
              <span className="text-slate-700 font-medium text-sm">{droppedOption.text}</span>
            </div>
            {!showResults && (
              <button
                onClick={onRemove}
                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <div className="text-slate-400 text-center text-sm">
            <p className="font-medium">Drop heading here</p>
          </div>
        )}
      </div>
      {showResults && droppedOption && (
        <div className={`p-2 rounded-lg text-xs ${
          isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="font-semibold">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
          </div>
          {!isCorrect && question.question_options?.find(opt => opt.is_correct) && (
            <p className="mt-1 text-slate-600">
              Correct: {question.question_options.find(opt => opt.is_correct)?.option_text}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function MatchingHeadingExercise({
  questions,
  userAnswers,
  onAnswerChange,
  showResults = false,
  questionResults = {},
}: MatchingHeadingExerciseProps) {
  const [allOptions, setAllOptions] = useState<DraggableOption[]>([])
  const [droppedOptions, setDroppedOptions] = useState<Record<string, DraggableOption | null>>({})
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Get all unique options from all questions
    const optionsMap = new Map<string, DraggableOption>()
    questions.forEach((question) => {
      question.question_options?.forEach((opt) => {
        if (opt.id && opt.option_text && !optionsMap.has(opt.id)) {
          optionsMap.set(opt.id, {
            id: opt.id,
            text: opt.option_text,
            isCorrect: opt.is_correct || false,
          })
        }
      })
    })
    setAllOptions(Array.from(optionsMap.values()))

    // Initialize dropped options from user answers
    const initialDropped: Record<string, DraggableOption | null> = {}
    questions.forEach((question) => {
      const answer = userAnswers[question.id]
      if (answer) {
        const option = Array.from(optionsMap.values()).find(opt => opt.id === answer)
        if (option) {
          initialDropped[question.id] = option
        }
      }
    })
    setDroppedOptions(initialDropped)
  }, [questions, userAnswers])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedOption = allOptions.find((opt) => opt.id === active.id)
    if (!draggedOption) return

    // Check if dropped on a question drop zone
    const questionId = over.id.toString().replace('drop-', '')
    const targetQuestion = questions.find(q => q.id === questionId)
    
    if (targetQuestion) {
      // Remove from available options
      setAllOptions((prev) => prev.filter((opt) => opt.id !== active.id))
      
      // If there was a previous dropped option for this question, add it back to available
      const previousOption = droppedOptions[questionId]
      if (previousOption) {
        setAllOptions((prev) => [...prev, previousOption])
      }
      
      // Set new dropped option
      setDroppedOptions((prev) => ({
        ...prev,
        [questionId]: draggedOption,
      }))
      onAnswerChange(questionId, draggedOption.id)
    }
  }

  const handleRemove = (questionId: string) => {
    const removedOption = droppedOptions[questionId]
    if (removedOption) {
      setAllOptions((prev) => [...prev, removedOption])
      setDroppedOptions((prev) => ({
        ...prev,
        [questionId]: null,
      }))
      onAnswerChange(questionId, "")
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Headings - Left Side */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">List of Headings</h3>
          <SortableContext
            items={allOptions.map((opt) => opt.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {allOptions.map((option) => (
                <DraggableOptionItem
                  key={option.id}
                  option={option}
                  isDragging={activeId === option.id}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Paragraphs with Drop Zones - Right Side */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Match Headings to Paragraphs</h3>
          <div className="space-y-4">
            {questions.map((question) => (
              <DroppableParagraph
                key={question.id}
                question={question}
                droppedOption={droppedOptions[question.id] || null}
                onRemove={() => handleRemove(question.id)}
                showResults={showResults}
                isCorrect={questionResults[question.id] === true}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  )
}

