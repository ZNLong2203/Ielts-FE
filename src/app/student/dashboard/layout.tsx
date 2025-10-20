import type React from "react"
import { DashboardSidebar } from "@/components/student/dashboard/DashboardSidebar"
import LandingNavbar from "@/components/navbar"
import { StudentProvider } from "@/context/StudentContext"
// import Footer from "@/components/footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 w-full h-full">
        <LandingNavbar />
        <div className="flex flex-1 pt-20">
          <DashboardSidebar />
          <main className="flex-1 p-8">{children}</main>
        </div>
        {/* <Footer /> */}
      </div>
    </StudentProvider>
  )
}
