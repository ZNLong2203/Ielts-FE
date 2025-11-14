import QuizDetailNew from "@/components/student/quiz/QuizDetailNew";

export default function QuizDetailPage({ params }: { params: { id: string } }) {
  return <QuizDetailNew quizId={params.id} />;
}

