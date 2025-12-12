"use client"

import { motion } from "framer-motion"
import { ArrowRight, Headphones, BookOpen, Pencil, MessageSquare } from "lucide-react"
import { useI18n } from "@/context/I18nContext"

const IntroductionSection = () => {
  const { t } = useI18n();
  
  // Skills data for better maintenance
  const skills = [
    {
      title: t("introduction.listening"),
      description: t("introduction.listeningDesc"),
      icon: Headphones,
      gradient: "bg-gradient-to-br from-blue-700 via-blue-500 to-blue-400",
      delay: 0
    },
    {
      title: t("introduction.reading"),
      description: t("introduction.readingDesc"),
      icon: BookOpen,
      gradient: "bg-gradient-to-br from-indigo-700 via-indigo-500 to-indigo-400",
      delay: 1
    },
    {
      title: t("introduction.writing"),
      description: t("introduction.writingDesc"),
      icon: Pencil,
      gradient: "bg-gradient-to-br from-emerald-700 via-emerald-500 to-emerald-400",
      delay: 2
    },
    {
      title: t("introduction.speaking"),
      description: t("introduction.speakingDesc"),
      icon: MessageSquare,
      gradient: "bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400",
      delay: 3
    }
  ]

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" 
      }
    }
  }

  return (
    <section className="relative px-4 md:px-8 py-20 bg-gradient-to-b from-white to-blue-50/40">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div 
            variants={titleVariants}
            className="inline-block bg-blue-400/10 text-blue-600 px-4 py-1 rounded-full text-sm font-medium mb-4"
          >
            {t("introduction.completePreparation")}
          </motion.div>
          
          <motion.h2 
            variants={titleVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r text-blue-800 bg-clip-text mb-6"
          >
            {t("introduction.masterAllSkills")} <br className="hidden md:block" />
            {t("introduction.trainingProgram")}
          </motion.h2>
          
          <motion.p 
            variants={titleVariants}
            className="max-w-3xl mx-auto text-lg text-gray-600"
          >
            {t("introduction.learningEasy")}
          </motion.p>
        </motion.div>

        {/* Skills Cards */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              custom={skill.delay}
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group h-full"
            >
              <div className={`${skill.gradient} rounded-3xl md:rounded-[32px] h-full shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                <div className="p-6 md:p-7 lg:p-8 h-full flex flex-col justify-between">
                  {/* Card header with icon */}
                  <div>
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-5 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                      <skill.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      {skill.title}
                    </h3>
                    
                    <p className="text-white/90 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                  
                  {/* Arrow button */}
                  <div className="mt-8 self-end">
                    <div className="size-12 rounded-full border border-white/60 flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 transition-all duration-300 cursor-pointer">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Additional info banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 bg-white border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between"
        >
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">{t("introduction.readyToImprove")}</h3>
            <p className="text-gray-600">{t("introduction.takeFreeAssessment")}</p>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex items-center">
            {t("introduction.startFreeAssessment")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default IntroductionSection