    // eslint-disable-next-line react-hooks/exhaustive-deps
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSelector } from "react-redux"
import { getStudentDashboard } from "@/api/student"
import { IStudentDashboard } from "@/interface/student"
import { selectUserId } from "@/redux/features/user/userSlice"

interface StudentContextType {
  studentData: IStudentDashboard | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [studentData, setStudentData] = useState<IStudentDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get userId from Redux store
  const userId = useSelector(selectUserId)

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      if (!userId) {
        setError("Please login to view dashboard")
        setLoading(false)
        return
      }
      
      const data = await getStudentDashboard(userId)
      setStudentData(data)
    } catch (err) {
      console.error("Error fetching student data:", err)
      setError("Failed to load student data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [userId])

  return (
    <StudentContext.Provider
      value={{
        studentData,
        loading,
        error,
        refetch: fetchStudentData,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
