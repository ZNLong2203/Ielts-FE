"use client";
import { Suspense } from "react";
import SpeakingDetail from "@/components/admin/mockTest/exercise/speaking/speakingDetail";
import Loading from "@/components/ui/loading";

const SpeakingExerciseDetailPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SpeakingDetail />
    </Suspense>
  );
}

export default SpeakingExerciseDetailPage;

