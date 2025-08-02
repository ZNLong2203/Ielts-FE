"use client"

import { motion } from "framer-motion"
import { Sparkles, Play, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import StatsCard from "./StatsCard"

interface Stat {
  label: string
  value: string
  icon: string
  color: string
  bgColor: string
  description: string
}

interface HeroSectionProps {
  stats: Stat[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-20 relative"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full px-6 py-3 mb-8 border border-blue-200/50">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-blue-700 font-medium">Transform Your English Journey</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Master English
            </span>
            <br />
            <span className="text-gray-900">with World-Class Courses</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
            Join over <span className="font-bold text-blue-600">25,000 successful students</span> who achieved their
            target scores with our expert-designed courses and personalized learning approach.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Learning Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg rounded-full border-2 hover:bg-gray-50 bg-transparent"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              Explore Free Courses
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <StatsCard key={stat.label} stat={stat} index={index} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
