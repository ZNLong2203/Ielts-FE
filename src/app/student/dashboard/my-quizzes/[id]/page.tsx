import QuizDetail from "@/components/student/quiz/QuizDetail";

export default function QuizDetailPage({ params }: { params: { id: string } }) {
  return <QuizDetail quizId={params.id} />;
}

