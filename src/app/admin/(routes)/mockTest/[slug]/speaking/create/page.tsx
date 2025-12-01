"use client";
import { Suspense } from "react";
import SpeakingForm from "@/components/admin/mockTest/exercise/speaking/speakingForm";
import Loading from "@/components/ui/loading";

const SpeakingExerciseFormPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SpeakingForm />
    </Suspense>
  );
}

export default SpeakingExerciseFormPage;

