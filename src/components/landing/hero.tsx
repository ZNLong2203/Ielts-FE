"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const HeroSection = () => {
  return (
    <div className="w-full overflow-hidden pt-20 md:pt-24 lg:pt-28 2xl:pb-36 xl:pb-36 lg:pb-36 md:pb-36 sm:pb-32 max-sm:pb-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Left Content - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-900/20 z-10"></div>
            <div className="h-full min-h-[300px] lg:min-h-[500px]">
              <Image
                src="/images/hero.jpeg"
                width={800}
                height={600}
                alt="Students learning IELTS"
                className="h-full w-full object-cover"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="absolute bottom-8 left-8 z-20 bg-white/10 p-6 rounded-2xl max-w-xs border border-white/20 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Learning</h3>
              <p className="text-white/80 text-sm">
                Our platform uses advanced AI to personalize your IELTS preparation journey
              </p>
            </motion.div>
          </motion.div>

          {/* Right Content - Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16"
            style={{
              background:
                "radial-gradient(226.73% 114.93% at 50% 105.95%, #FFFFFF 0%, #0172FA 15.17%, #0172FA 37.47%, #0144A9 69.75%, #011657 93.95%)",
            }}
          >
            <div className="max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white font-medium mb-4 flex items-center"
              >
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">IELTS COURSES</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Comprehensive
                <br />
                <span className="text-white">IELTS</span> Study &
                <br />
                Practice Plan
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-white/80 space-y-1 mb-8"
              >
                <p>• AI-powered virtual classroom</p>
                <p>• Realistic test simulations</p>
                <p>• Guaranteed score improvement</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Button className="bg-white hover:bg-blue-100 text-blue-900 font-medium rounded-full px-8 py-6 flex items-center gap-2 transition-all duration-300 hover:shadow-lg">
                  Create a Study Plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center mt-8"
              >
                <div className="flex -space-x-2">
                  
                </div>
                <div className="ml-3 text-xs text-white/80">
                  <p className="font-semibold text-white">10,000+ Students</p>
                  <p>Achieved their target IELTS score</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default HeroSection
