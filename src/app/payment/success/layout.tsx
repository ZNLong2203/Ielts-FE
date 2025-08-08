import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Successful - IELTS Learning Platform",
  description: "Your payment has been processed successfully. Start your IELTS learning journey now!",
}

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}
