"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface Stat {
  label: string
  value: string
  icon: LucideIcon
  color: string
  bgColor: string
  description: string
}

interface StatsCardProps {
  stat: Stat
  index: number
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}

export default function StatsCard({ stat, index }: StatsCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-center mb-4">
        <div className={`p-4 ${stat.bgColor} rounded-2xl`}>
          <stat.icon className={`h-8 w-8 ${stat.color}`} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{stat.label}</div>
      <div className="text-xs text-gray-500">{stat.description}</div>
    </motion.div>
  )
}
