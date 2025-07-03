"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, TrendingUp, Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { courseMockData } from "@/courseMockData";
import CourseStage from "./courseStage";
import CourseCard from "./courseCard";

export default function CourseSection() {
  const level = [3.5, 4.0, 5.0, 6.0];
  const target = [5.0, 6.0, 7.0];
  const [selectedLevel, setSelectedLevel] = useState<number>(3.5);
  const [selectedTarget, setSelectedTarget] = useState<number>(5.0);
  const [stageQuantity, setStageQuantity] = useState<number>(0);
  const [showCourseDetails, setShowCourseDetails] = useState<boolean>(false);

  const handleLevelChange = (level: number) => {
    setSelectedLevel(level);
  };

  const handleTargetChange = (target: number) => {
    setSelectedTarget(target);
  };

  useEffect(() => {
    if (selectedLevel <= 0 || selectedTarget <= 0) {
      setStageQuantity(0);
      return;
    }

    // Nếu selectedTarget < selectedLevel, tự động điều chỉnh target
    if (selectedTarget <= selectedLevel) {
      const nextPossibleTarget = target.find((t) => t > selectedLevel);
      if (nextPossibleTarget) {
        setSelectedTarget(nextPossibleTarget);
      } else {
        setSelectedTarget(selectedLevel + 1);
      }
      return; // Dừng xử lý, đợi useEffect chạy lại với giá trị selectedTarget mới
    }

    // Tính toán stageQuantity khi cả selectedLevel và selectedTarget đều hợp lệ
    const rawStageQuantity = selectedTarget - selectedLevel;
    const roundedStageQuantity = Math.ceil(rawStageQuantity);
    setStageQuantity(roundedStageQuantity);
  }, [selectedLevel, selectedTarget, target]); 

  return (
    <section className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-center mb-16"
        >
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="inline-block bg-blue-400/30 text-blue-100 px-4 py-1 rounded-full text-sm font-medium mb-4">
              Personalized Learning Path
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Design your IELTS
              <br /> 
              <span className="text-yellow-300">success journey</span>
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              Our AI-powered system creates a customized roadmap based on your current level and target score.
            </p>
            <div className="flex space-x-4">
              <Button className="bg-white text-blue-800 hover:bg-blue-50 font-medium px-6">
                Start Learning
              </Button>
              <Button variant="outline" className="border-white text-blue-800 hover:bg-blue-50">
                Learn More
              </Button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:w-2/5"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="bg-blue-500 p-2 rounded-full">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold ml-3">Set Your IELTS Goals</h3>
              </div>

              {/* IELTS Level Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Current IELTS Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {level.map((lv) => (
                    <Button
                      key={lv}
                      onClick={() => handleLevelChange(lv)}
                      variant="outline"
                      className={`${
                        selectedLevel === lv
                          ? "bg-blue-500 text-white border-blue-400"
                          : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                      } transition-all duration-200`}
                    >
                      {lv.toFixed(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Target Level Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Target IELTS Score
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {target.map((tar) => (
                    <Button
                      key={tar}
                      disabled={tar <= selectedLevel}
                      onClick={() => handleTargetChange(tar)}
                      variant="outline"
                      className={`${
                        selectedTarget === tar
                          ? "bg-yellow-400 text-blue-900 border-yellow-300"
                          : "bg-white/10 text-white hover:bg-white/20 border-white/20"
                      } ${tar <= selectedLevel ? "opacity-50 cursor-not-allowed" : ""} transition-all duration-200`}
                    >
                      {tar.toFixed(1)}+
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mt-4">
                <span className="text-blue-200">
                  {stageQuantity} stages to reach your goal
                </span>
                <motion.button 
                  onClick={() => setShowCourseDetails(!showCourseDetails)}
                  whileHover={{ x: 5 }}
                  className="flex items-center text-yellow-300 font-medium hover:text-yellow-100 transition-colors"
                >
                  View your path
                  <ArrowRight className="ml-1 h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Course Roadmap */}
        {stageQuantity > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: showCourseDetails ? 1 : 0,
              height: showCourseDetails ? "auto" : 0
            }}
            transition={{ duration: 0.5 }}
            className="mb-16 overflow-hidden"
          >
            <div className="bg-blue-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
                  Your Learning Journey
                </h2>
                <div className="bg-blue-700/50 px-4 py-1 rounded-full text-sm">
                  <span className="text-yellow-300 font-medium">{selectedLevel}</span>
                  <span className="mx-2">→</span>
                  <span className="text-yellow-300 font-medium">{selectedTarget}</span>
                </div>
              </div>
              
              <CourseStage stageQuantity={stageQuantity} />
            </div>
          </motion.div>
        )}

        {/* Course Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Choose the Right Course</h2>
              <p className="text-xl text-blue-100">
                Conquer the roadmap{" "}
                <span className="text-yellow-300 font-bold">
                  from IELTS {selectedLevel.toFixed(1)} to {selectedTarget.toFixed(1)}
                </span>
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-6 py-6 rounded-xl font-medium flex items-center">
                <Check className="mr-2 h-5 w-5" /> Compare All Courses
              </Button>
            </div>
          </div>

          <CourseCard
            selectedLevel={selectedLevel}
            selectedTarget={selectedTarget}
            courseData={courseMockData.course}
          />
        </motion.div>
      </div>
    </section>
  );
}