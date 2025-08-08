import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Complete Your Order - IELTS Learning Platform",
  description: "Secure checkout for your IELTS learning journey. Complete learning path from Band 3.0 to 7.5+",
}

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}
