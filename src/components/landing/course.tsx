"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { courseMockData } from "@/courseMockData";
import CourseStage from "./courseStage";
import CourseCard from "./courseCard";

export default function CourseSection() {
  const level = [3.5, 4.0, 5.0, 6.0];
  const target = [5.0, 6.0, 7.0];
  const [selectedLevel, setSelectedLevel] = useState<number>(3.5);
  const [selectedTarget, setSelectedTarget] = useState<number>(5.0);
  const [stageQuantity, setStageQuantity] = useState<number>(0);

  const handleLevelChange = (level: number) => {
    setSelectedLevel(level);
    // console.log("Selected Level:", level);
  };

  const handleTargetChange = (target: number) => {
    setSelectedTarget(target);
    // console.log("Selected Target:", target);
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
        console.log("Auto-adjusted Target to:", nextPossibleTarget);
      } else {
        setSelectedTarget(selectedLevel + 1);
        console.log("Auto-adjusted Target to:", selectedLevel + 1);
      }
      return; // Dừng xử lý, đợi useEffect chạy lại với giá trị selectedTarget mới
    }

    // Tính toán stageQuantity khi cả selectedLevel và selectedTarget đều hợp lệ
    const rawStageQuantity = selectedTarget - selectedLevel;

    const roundedStageQuantity = Math.ceil(rawStageQuantity);

    setStageQuantity(roundedStageQuantity);
  }, [selectedLevel, selectedTarget, target]); 

  return (
    <section className="w-full bg-[radial-gradient(99.48%_132.1%_at_2.5%_100%,#002EA6_0%,#0047FF_100%)] text-white py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="md:w-1/2">
            <p className="text-lg mb-2">Hello!</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Design a learning roadmap
              <br />
              exclusively for you
              <br />
            </h1>
          </div>
        </div>

        {/* IELTS Level Selection */}
        <div className="bg-blue-600 rounded-xl p-6 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Current Level */}
            <div>
              <h2 className="text-xl font-semibold text-center mb-4">
                Your proficiency level
              </h2>
              <div className="space-y-3">
                {level.map((lv) => (
                  <Button
                    key={lv}
                    onClick={() => handleLevelChange(lv)}
                    variant="outline"
                    className={`w-full ${
                      selectedLevel === lv
                        ? "bg-white text-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } hover:bg-blue-50 h-14 rounded-xl`}
                  >
                    IELTS {lv.toFixed(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Target Level */}
            <div>
              <h2 className="text-xl font-semibold text-center mb-4">
                Your target
              </h2>
              <div className="space-y-3">
                {target.map((tar) => (
                  <Button
                    key={tar}
                    disabled={tar <= selectedLevel}
                    onClick={() => handleTargetChange(tar)}
                    variant="outline"
                    className={`w-full ${
                      selectedTarget === tar
                        ? "bg-white text-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } hover:bg-blue-50 h-14 rounded-xl`}
                  >
                    IELTS {tar.toFixed(1)}+
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-6 text-sm">
            <p>
              You are not clear about your own level?{" "}
              <Link href="#" className="underline">
                Take the test.
              </Link>
            </p>
          </div>
        </div>

        {/* Course Options */}
        <div className="bg-blue-600 rounded-xl p-6 mb-12">
          <CourseStage stageQuantity={stageQuantity} />
        </div>

        {/* Pricing Section */}
        <div>
          <h2 className="text-2xl font-bold mb-2"> Choose the Right Course</h2>
          <p className="text-xl mb-8">
            Conquer the roadmap{" "}
            <span className="text-yellow-300 font-bold">
              From IELTS basics to 5.0
            </span>
          </p>

          <CourseCard
            selectedLevel={selectedLevel}
            selectedTarget={selectedTarget}
            courseData={courseMockData.course}
          />
        </div>
      </div>
    </section>
  );
}
