"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, TrendingUp, Sparkles, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { courseMockData } from "@/courseMockData";
import CourseStage from "./courseStage";
import CourseCard from "./courseCard";
import ComboCourseCard from "./comboCourseCard";
import { getComboCoursesByLevel } from "@/api/course";
import { IComboCourse } from "@/interface/course";
import { useI18n } from "@/context/I18nContext";

export default function CourseSection() {
  const { t } = useI18n();
  const level = [3.5, 4.0, 5.0, 6.0];
  const target = useMemo(() => [5.0, 6.0, 7.0], []);
  const [selectedLevel, setSelectedLevel] = useState<number>(3.5);
  const [selectedTarget, setSelectedTarget] = useState<number>(5.0);
  const [stageQuantity, setStageQuantity] = useState<number>(0);
  const [showCourseDetails, setShowCourseDetails] = useState<boolean>(false);
  const [comboCourses, setComboCourses] = useState<IComboCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'combo'>('combo');
  const [comboPricing, setComboPricing] = useState<{
    totalOriginalPrice: number;
    totalComboPrice: number;
    totalSavings: number;
    levelRange: string;
    includedLevels: string[];
  } | null>(null);

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

  // Fetch combo courses when level or target changes
  useEffect(() => {
    if (selectedLevel > 0 && selectedTarget > selectedLevel) {
      console.log(`Component: Fetching combo courses for ${selectedLevel} - ${selectedTarget}`);
      setLoading(true);
      getComboCoursesByLevel(selectedLevel, selectedTarget)
        .then((data) => {
          console.log('Component: Received combo courses:', data);
          setComboCourses(data.comboCourses);
          setComboPricing({
            totalOriginalPrice: data.totalOriginalPrice,
            totalComboPrice: data.totalComboPrice,
            totalSavings: data.totalSavings,
            levelRange: data.levelRange,
            includedLevels: data.includedLevels
          });
        })
        .catch((error) => {
          console.error('Component: Error fetching combo courses:', error);
          setComboCourses([]);
          setComboPricing(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedLevel, selectedTarget]);

  return (
    <section id="learning-path" className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
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
              {t("course.personalizedLearningPath")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              {t("course.designYourIELTS")}
              <br /> 
              <span className="text-yellow-300">{t("course.successJourney")}</span>
            </h1>
            <p className="text-blue-100 text-lg mb-6">
              {t("course.aiPoweredSystem")}
            </p>
            <div className="flex space-x-4">
              <Button className="bg-white text-blue-800 hover:bg-blue-50 font-medium px-6">
                {t("course.startLearning")}
              </Button>
              <Button variant="outline" className="border-white text-blue-800 hover:bg-blue-50">
                {t("course.learnMore")}
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
                <h3 className="text-xl font-semibold ml-3">{t("course.setYourIELTSGoals")}</h3>
              </div>

              {/* IELTS Level Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t("course.currentIELTSLevel")}
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
                  {t("course.targetIELTSScore")}
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
                  {t("course.stagesToReachGoal", { count: stageQuantity })}
                </span>
                <motion.button 
                  onClick={() => setShowCourseDetails(!showCourseDetails)}
                  whileHover={{ x: 5 }}
                  className="flex items-center text-yellow-300 font-medium hover:text-yellow-100 transition-colors"
                >
                  {t("course.viewYourPath")}
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
                  {t("course.yourLearningJourney")}
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
              <h2 className="text-3xl font-bold mb-2">{t("course.chooseTheRightCourse")}</h2>
              <p className="text-xl text-blue-100">
                {t("course.conquerTheRoadmap")}{" "}
                <span className="text-yellow-300 font-bold">
                  {t("course.fromIELTS", { from: selectedLevel.toFixed(1), to: selectedTarget.toFixed(1) })}
                </span>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-2 border border-slate-600/20 shadow-lg">
              <div className="flex">
                <Button
                  onClick={() => setActiveTab('combo')}
                  variant="ghost"
                  className={`${
                    activeTab === 'combo'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/30 '
                  } rounded-xl px-8 py-3 font-medium transition-all duration-300`}
                >
                  <Package className="h-5 w-5 mr-2" />
                  {t("course.comboCourses")}
                </Button>
                {/* <Button
                  onClick={() => setActiveTab('individual')}
                  variant="ghost"
                  className={`${
                    activeTab === 'individual'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  } rounded-lg px-6 py-2 transition-all duration-200`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Individual Courses
                </Button> */}
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'combo' ? (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-blue-200 mt-4">{t("course.loadingComboCourses")}</p>
                </div>
              ) : comboCourses.length > 0 ? (
                <div>
                  {/* Pricing Summary */}
                  {comboPricing && (
                    <div className="bg-gradient-to-br from-slate-800/90 via-slate-700/60 to-slate-600/70 backdrop-blur-lg rounded-3xl p-8 border border-slate-500/30 mb-8 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white flex items-center">
                          <Package className="h-6 w-6 mr-3 text-blue-400" />
                          {t("course.comboPackageSummary")}
                        </h3>
                        <div className="bg-blue-600/40 px-4 py-2 rounded-full text-sm border border-blue-400/30">
                          <span className="text-blue-100 font-semibold">{comboPricing.levelRange}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        <div className="lg:col-span-2 text-center lg:text-left">
                          <div className="text-4xl font-bold text-white mb-2 tracking-tight">
                            {comboPricing.totalComboPrice.toLocaleString('vi-VN')} VND
                          </div>
                          <div className="text-lg text-slate-300 font-medium">{t("course.comboPrice")}</div>
                        </div>
                        <div className="lg:col-span-2 text-center lg:text-right">
                          <div className="text-2xl text-gray-400 line-through mb-1">
                            {comboPricing.totalOriginalPrice.toLocaleString('vi-VN')} VND
                          </div>
                          <div className="text-sm text-gray-300 mb-3">{t("course.originalPrice")}</div>
                          <div className="text-xl text-emerald-500 font-bold">
                             {comboCourses.length > 0 ? Number(comboCourses[0].combo_price).toLocaleString('vi-VN') + " VND" : "0 VND"}
                          </div>
                          <div className="text-sm text-emerald-400">{t("course.totalSavings")}</div>
                        </div>
                      </div>

                      {/* Included Level Ranges */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">{t("course.includedLevelRanges")}</h4>
                        <div className="flex flex-wrap gap-3">
                          {comboPricing.includedLevels.map((level, index) => (
                            <span
                              key={index}
                              className="bg-slate-600/40 text-slate-100 px-4 py-2 rounded-full text-sm font-medium border border-slate-500/30 hover:bg-slate-600/50 transition-all duration-200"
                            >
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={() => {
                          if (comboCourses.length > 0 && comboPricing) {
                            // Navigate to orders page with ALL combo courses in the path
                            const orderData = {
                              comboCourseIds: comboCourses.map((c) => c.id),
                              comboCourses,
                              totalComboPrice: comboPricing.totalComboPrice,
                              totalOriginalPrice: comboPricing.totalOriginalPrice,
                              levelRange: comboPricing.levelRange,
                              includedLevels: comboPricing.includedLevels,
                              selectedLevel: Number(selectedLevel),
                              selectedTarget: Number(selectedTarget),
                              currentLevel: Number(selectedLevel),
                              targetLevel: Number(selectedTarget),
                            };
                            
                            sessionStorage.setItem('selectedComboCourse', JSON.stringify(orderData));
                            window.location.href = '/orders';
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300"
                      >
                        {t("course.purchaseCompletePackage")}
                      </Button>
                    </div>
                  )}

                  {/* Combo Course Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {comboCourses.map((comboCourse, index) => (
                      <div
                        key={comboCourse.id}
                        className="transform hover:scale-[1.02] transition-all duration-300"
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <ComboCourseCard
                          comboCourse={comboCourse}
                          selectedLevel={selectedLevel}
                          selectedTarget={selectedTarget}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{t("course.noComboCoursesAvailable")}</h3>
                  <p className="text-blue-200 mb-6">
                    {t("course.workingOnCreating")}
                  </p>
                  <Button 
                    onClick={() => setActiveTab('individual')}
                    className="bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                  >
                    {t("course.viewIndividualCourses")}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <CourseCard
              selectedLevel={selectedLevel}
              selectedTarget={selectedTarget}
              courseData={courseMockData.course}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}