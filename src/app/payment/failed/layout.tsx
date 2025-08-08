import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Failed - IELTS Learning Platform",
  description: "Payment processing failed. Please try again or contact support for assistance.",
}

export default function PaymentFailedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}
