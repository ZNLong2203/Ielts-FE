import type React from "react"
import LandingNavbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <LandingNavbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  )
}
