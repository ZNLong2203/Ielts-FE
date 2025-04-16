"use client"

import type React from "react"
import { motion } from "framer-motion"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-svh"
      style={{
        background: "linear-gradient(to bottom right, #FFFFFF, #EBF4FF)",
      }}
    >
      {children}
    </motion.section>
  )
}

export default AuthLayout
