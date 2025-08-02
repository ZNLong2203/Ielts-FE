"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface CourseVideoProps {
  title: string
  image: string
}

export default function CourseVideo({ title, image }: CourseVideoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          width={800}
          height={400}
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Play className="h-6 w-6 mr-2" />
            Preview Course
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
