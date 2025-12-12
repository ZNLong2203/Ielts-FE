"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronRight, Star } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

const HeroSection = () => {
  const { t } = useI18n();
  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-blue-50/50 to-white pt-36 md:pt-40 lg:pt-48 pb-16 md:pb-20 lg:pb-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center mb-6 bg-blue-100/80 rounded-full pl-2 pr-4 py-1">
              <span className="bg-blue-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2">
                <Star className="w-3 h-3" />
              </span>
              <span className="text-blue-700 text-sm font-medium">
                {t("hero.ratedPlatform")}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r text-blue-800 bg-clip-text">
              {t("hero.masterIELTS")} <br />
              {t("hero.aiPoweredLearning")}
            </h1>

            <p className="text-lg text-gray-700 mb-8 max-w-lg">
              {t("hero.joinStudents")}
            </p>

            <div className="space-y-4 mb-10">
              {[
                t("hero.personalizedLearning"),
                t("hero.realisticSimulations"),
                t("hero.expertGuidance"),
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="flex items-center"
                >
                  <div className="mr-3 bg-blue-100 text-blue-600 rounded-full p-1.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base px-6 py-6 shadow-lg hover:shadow-blue-200 transition-all duration-300"
              >
                {t("hero.startFreeAssessment")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-base px-6 py-6"
              >
                {t("hero.exploreCourses")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="mt-10 flex items-center">
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-blue-600 font-bold ml-1">4.9</span>
                </div>
                <p className="text-gray-600 text-sm">
                  {t("hero.fromReviews")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero.jpeg"
                width={600}
                height={720}
                alt="Students preparing for IELTS"
                className="w-full h-[500px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>

              {/* Floating UI Elements */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center"
              >
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 16V12L14 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t("hero.averageTimeTo")}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {t("hero.improveBandScore")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-[220px]"
              >
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 7L13 15L9 11L3 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 13V7H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {t("hero.progressTracking")}
                  </h4>
                </div>
                <p className="text-xs text-gray-600">
                  {t("hero.aiAnalytics")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute bottom-24 left-6 bg-blue-600/95 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-[180px]"
              >
                <h4 className="font-semibold text-white mb-1">{t("hero.aiFeedback")}</h4>
                <p className="text-xs text-blue-100">
                  {t("hero.instantEvaluations")}
                </p>
              </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
