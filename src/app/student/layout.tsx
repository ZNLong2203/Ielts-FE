"use client";

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  Award, 
  Calendar, 
  // Settings,
  X,
  User,
} from "lucide-react"
// import { useSelector } from "react-redux"
// import { selectUserId } from "@/redux/features/user/userSlice"
import { StudentProvider } from "@/context/StudentContext"
import LandingNavbar from "@/components/navbar"

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: Home },
  { name: "My Courses", href: "/student/dashboard/my-courses", icon: BookOpen },
  { name: "My Quizzes", href: "/student/dashboard/my-quizzes", icon: ClipboardList },
  { name: "Certificates", href: "/student/dashboard/certificates", icon: Award },
  { name: "Schedule", href: "/student/dashboard/schedule", icon: Calendar },
  // { name: "Settings", href: "/student/dashboard/settings", icon: Settings },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  // const userId = useSelector(selectUserId)

  return (
    <StudentProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <LandingNavbar />
        
        {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}>
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-72 flex-col bg-gradient-to-b from-white via-white to-slate-50 shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900">IELTS Academy</span>
                <p className="text-xs text-slate-500 font-medium">Learning Platform</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = item.href === "/student/dashboard" 
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'}`} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col pt-20">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-white via-white to-slate-50 border-r border-slate-200 shadow-lg">
          {/* Logo */}
          <div className="flex h-20 items-center px-6 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900">IELTS Academy</span>
                <p className="text-xs text-slate-500 font-medium">Learning Platform</p>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="px-5 py-6 border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/30">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-900 truncate">Student Portal</p>
                  <p className="text-sm text-slate-600 font-medium">Welcome back!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
            </div>
            {navigation.map((item) => {
              const isActive = item.href === "/student/dashboard" 
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/")
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600 group-hover:scale-110'}`} />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

        {/* Main content */}
        <div className="lg:pl-72 pt-16 flex flex-col min-h-[calc(100vh-4rem)]">
          {/* Page content */}
          <main className="flex-1">
            <div className="py-6">
              {pathname === "/student/dashboard/schedule" ? (
                <div className="px-6 sm:px-8 lg:px-12">
                  {children}
                </div>
              ) : (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              )}
            </div>
          </main>

          {/* Footer - Sticky at bottom */}
          {/* <footer className="bg-white border-t border-gray-200 mt-auto sticky bottom-0 z-10">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">IELTS Academy</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
                  <Link href="/support" className="hover:text-gray-900">Support</Link>
                  <span>© 2024 IELTS Academy. All rights reserved.</span>
                </div>
              </div>
            </div>
          </footer> */}
        </div>
    </div>
    </StudentProvider>
  )
}
