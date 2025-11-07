"use client"

import { useState } from "react"
import { BarChart3, LineChart, PieChart, Table as TableIcon, Map } from "lucide-react"

interface Task1ChartProps {
  chartType: 'bar' | 'line' | 'pie' | 'table' | 'process' | 'map'
  chartData?: any
  imageUrl?: string
  userAnswer: string
  onAnswerChange: (answer: string) => void
  wordCount?: number
  minWords?: number
}

export function Task1Chart({
  chartType,
  chartData,
  imageUrl,
  userAnswer,
  onAnswerChange,
  wordCount = 0,
  minWords = 150,
}: Task1ChartProps) {
  const getChartIcon = () => {
    switch (chartType) {
      case 'bar':
        return <BarChart3 className="w-6 h-6" />
      case 'line':
        return <LineChart className="w-6 h-6" />
      case 'pie':
        return <PieChart className="w-6 h-6" />
      case 'table':
        return <TableIcon className="w-6 h-6" />
      case 'map':
        return <Map className="w-6 h-6" />
      default:
        return <BarChart3 className="w-6 h-6" />
    }
  }

  const getChartTypeName = () => {
    switch (chartType) {
      case 'bar':
        return 'Bar Chart'
      case 'line':
        return 'Line Graph'
      case 'pie':
        return 'Pie Chart'
      case 'table':
        return 'Table'
      case 'process':
        return 'Process Diagram'
      case 'map':
        return 'Map'
      default:
        return 'Chart'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          {getChartIcon()}
          <h3 className="text-lg font-bold text-slate-800">Task 1: {getChartTypeName()}</h3>
        </div>
        
        {/* Chart/Image Display */}
        {imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border-2 border-slate-200">
            <img src={imageUrl} alt={getChartTypeName()} className="w-full h-auto" />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
          <p className="text-sm text-slate-700 font-medium">
            Write at least {minWords} words. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.
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
          placeholder="Write your answer here..."
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[300px]"
        />

        {/* Tips */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-yellow-800 mb-2">Tips:</p>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            <li>Identify the main trends and patterns</li>
            <li>Use appropriate vocabulary for describing data</li>
            <li>Make comparisons where relevant</li>
            <li>Write in a formal, academic style</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

