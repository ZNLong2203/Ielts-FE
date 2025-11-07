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
import { useTextHighlight } from "@/hooks/useTextHighlight"

interface DragDropExerciseProps {
  question: ICourseQuestion
  userAnswer: string | null
  onAnswerChange: (answer: string) => void
  showResults?: boolean
  isCorrect?: boolean
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
      className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group"
    >
      <GripVertical className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
      <span className="flex-1 text-slate-700 font-medium">{option.text}</span>
    </div>
  )
}

function DroppableArea({ 
  question, 
  droppedOption, 
  onRemove 
}: { 
  question: ICourseQuestion
  droppedOption: DraggableOption | null
  onRemove: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${question.id}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] p-4 rounded-xl flex items-center justify-center transition-all ${
        isOver
          ? 'bg-blue-50 border-2 border-dashed border-blue-400'
          : 'bg-slate-50 border-2 border-dashed border-slate-300'
      }`}
    >
      {droppedOption ? (
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 p-3 bg-white border-2 border-blue-400 rounded-lg shadow-sm">
            <span className="text-slate-700 font-medium">{droppedOption.text}</span>
          </div>
          <button
            onClick={onRemove}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="text-slate-400 text-center">
          <p className="font-medium">Drop heading here</p>
          <p className="text-sm mt-1">{question.question_text}</p>
        </div>
      )}
    </div>
  )
}

export function DragDropExercise({
  question,
  userAnswer,
  onAnswerChange,
  showResults = false,
  isCorrect = false,
}: DragDropExerciseProps) {
  const [availableOptions, setAvailableOptions] = useState<DraggableOption[]>([])
  const [droppedOption, setDroppedOption] = useState<DraggableOption | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const questionId = `question-${question.id}`
  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } = useTextHighlight(questionId)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // Initialize options from question_options
    const options: DraggableOption[] = (question.question_options || [])
      .filter(opt => opt.id && opt.option_text)
      .map((opt) => ({
        id: opt.id!,
        text: opt.option_text!,
        isCorrect: opt.is_correct || false,
      }))
    setAvailableOptions(options)

    // Set dropped option if user has answered
    if (userAnswer) {
      const answeredOption = options.find((opt) => opt.id === userAnswer)
      if (answeredOption) {
        setDroppedOption(answeredOption)
        setAvailableOptions(options.filter((opt) => opt.id !== userAnswer))
      }
    }
  }, [question, userAnswer])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedOption = availableOptions.find((opt) => opt.id === active.id)
    if (!draggedOption) return

    // If dropped on the droppable area
    if (over.id === `drop-${question.id}`) {
      // Remove from available options
      setAvailableOptions((prev) => prev.filter((opt) => opt.id !== active.id))
      
      // If there was a previous dropped option, add it back to available
      if (droppedOption) {
        setAvailableOptions((prev) => [...prev, droppedOption])
      }
      
      // Set new dropped option
      setDroppedOption(draggedOption)
      onAnswerChange(draggedOption.id)
    }
  }

  const handleRemove = () => {
    if (droppedOption) {
      setAvailableOptions((prev) => [...prev, droppedOption])
      setDroppedOption(null)
      onAnswerChange("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Text with Highlight Support */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Question</h3>
          <button
            onClick={clearAllHighlights}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            Clear Highlights
          </button>
        </div>
        <div
          id={questionId}
          onMouseUp={toggleHighlight}
          className="text-slate-700 leading-relaxed select-text cursor-text font-medium text-lg"
          style={{ userSelect: 'text' }}
        >
          {renderHighlightedText(question.question_text)}
        </div>
        {highlights.length > 0 && (
          <p className="mt-2 text-sm text-slate-500">
            {highlights.length} highlight{highlights.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Drag and Drop Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Available Headings</h3>
            <SortableContext
              items={availableOptions.map((opt) => opt.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {availableOptions.map((option) => (
                  <DraggableOptionItem
                    key={option.id}
                    option={option}
                    isDragging={activeId === option.id}
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          {/* Droppable Area */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Your Answer</h3>
            <DroppableArea
              question={question}
              droppedOption={droppedOption}
              onRemove={handleRemove}
            />
            
            {/* Results */}
            {showResults && droppedOption && (
              <div className={`p-4 rounded-xl border-2 ${
                isCorrect
                  ? 'bg-green-50 border-green-400'
                  : 'bg-red-50 border-red-400'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-bold ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {question.explanation && (
                  <p className="text-slate-700 text-sm mt-2">{question.explanation}</p>
                )}
                {!isCorrect && (
                  <p className="text-slate-600 text-sm mt-2">
                    Correct answer: {question.question_options?.find(opt => opt.is_correct)?.option_text}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DndContext>
    </div>
  )
}

