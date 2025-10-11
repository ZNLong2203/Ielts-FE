"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Settings,
  User,
  GraduationCap,
  Clock,
  Award,
  ChevronRight,
  Home,
  ChevronLeft,
  FileQuestion,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: Home },
  { name: "My Courses", href: "/student/dashboard/my-courses", icon: ShoppingBag },
  { name: "My Quizs", href: "/student/dashboard/my-quizs", icon: FileQuestion },
  { name: "Progress", href: "/student/dashboard/progress", icon: BarChart3 },
  { name: "Certificates", href: "/student/dashboard/certificates", icon: Award },
  { name: "Schedule", href: "/student/dashboard/schedule", icon: Clock },
  { name: "Settings", href: "/student/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-gray-900">IELTS Academy</h2>
              <p className="text-sm text-gray-500">Student Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">John Doe</h3>
              <p className="text-sm text-gray-500">Target: Band 7.0</p>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full w-3/4 transition-all duration-500"></div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">75%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-emerald-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm",
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-r-full"></div>
                  )}

                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive
                        ? "text-blue-600 scale-110"
                        : "text-gray-400 group-hover:text-gray-600 group-hover:scale-105",
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 transition-all duration-200">{item.name}</span>
                      {isActive && <ChevronRight className="w-4 h-4 text-blue-600 animate-pulse" />}
                    </>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 transition-all duration-200 group"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
          )}
        </button>
      </div>
    </div>
  )
}
