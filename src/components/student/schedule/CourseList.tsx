"use client"

import { useState } from "react"
import { BookOpen, Search, Filter, ArrowUpDown, X } from "lucide-react"
import { Course } from "./types"
import { DraggableCourse } from "./DraggableCourse"

interface CourseListProps {
  courses: Course[]
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: "title" | "duration" | "skill"
  onSortChange: (sort: "title" | "duration" | "skill") => void
  filterSkill: string
  onFilterSkillChange: (skill: string) => void
  skills: string[]
}

export function CourseList({
  courses,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterSkill,
  onFilterSkillChange,
  skills,
}: CourseListProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6 flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            My Courses
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-white/60 rounded-lg transition-all"
          >
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
          {/* Sort */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
              <ArrowUpDown className="w-3 h-3" />
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "title" | "duration" | "skill")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="title">Title</option>
              <option value="duration">Duration</option>
              <option value="skill">Skill</option>
            </select>
          </div>

          {/* Filter by Skill */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Filter by Skill</label>
            <select
              value={filterSkill}
              onChange={(e) => onFilterSkillChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {courses.length > 0 ? (
          courses.map((course) => <DraggableCourse key={course.id} course={course} />)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No courses found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 text-center">
        {courses.length} course{courses.length !== 1 ? "s" : ""} available
      </div>
    </div>
  )
}

