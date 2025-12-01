"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  HelpCircle, 
  Plus, 
  ArrowLeft, 
  CheckCircle,
  Edit,
} from "lucide-react";
import QuestionForm from "@/components/admin/course/courseQuestion/courseQuestionForm";

interface QuestionTabProps {
  exercise: any;
  onBack: () => void;
  onRefresh?: () => void;
}

const QuestionTab: React.FC<QuestionTabProps> = ({
  exercise,
  onBack,
  onRefresh
}) => {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const handleQuestionFormSuccess = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
    onRefresh?.();
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "multiple_choice":
        return "bg-blue-100 text-blue-800";
      case "true_false":
        return "bg-green-100 text-green-800";
      case "fill_blank":
        return "bg-purple-100 text-purple-800";
      case "essay":
        return "bg-orange-100 text-orange-800";
      case "matching":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatQuestionType = (type: string) => {
    return type?.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Unknown';
  };

  if (!exercise) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exercise Selected</h3>
            <p className="text-gray-500 mb-4">Please select an exercise to view its questions.</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <div>
            <h3 className="text-lg font-semibold">{exercise.title} - Questions</h3>
            <p className="text-sm text-gray-600">
              Manage questions for this exercise
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingQuestion(null);
            setShowQuestionForm(!showQuestionForm);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </Button>
      </div>

      {/* Exercise Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <HelpCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-orange-900">{exercise.title}</h4>
              <div className="flex items-center space-x-4 mt-1">
                <Badge variant="outline" className="bg-white text-xs">
                  Exercise {exercise.ordering}
                </Badge>
                <Badge variant="outline" className="bg-white text-xs">
                  {exercise.questions?.length || 0} questions
                </Badge>
                <Badge variant="outline" className="bg-white text-xs">
                  Max Score: {exercise.max_score || 0}
                </Badge>
                <Badge variant="outline" className="bg-white text-xs capitalize">
                  {exercise.exercise_type}
                </Badge>
              </div>
            </div>
          </div>
          {exercise.description && (
            <p className="text-orange-700 text-sm mt-2">{exercise.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Question Form */}
      {showQuestionForm && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingQuestion ? "Edit Question" : "Create New Question"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionForm
                exerciseId={exercise.id}
                lessonId={exercise.lesson_id}
                existingQuestions={exercise.questions || []}
                onSuccess={handleQuestionFormSuccess}
                onCancel={() => {
                  setShowQuestionForm(false);
                  setEditingQuestion(null);
                }}
              />
            </CardContent>
          </Card>
          <Separator />
        </>
      )}

      {/* Questions List */}
      {exercise.questions && exercise.questions.length > 0 ? (
        <div className="space-y-4">
          {exercise.questions
            .sort((a: any, b: any) => (a.ordering || 999) - (b.ordering || 999))
            .map((question: any, index: number) => (
              <Card key={question.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            className={`text-xs ${getQuestionTypeColor(question.question_type)}`}
                          >
                            {formatQuestionType(question.question_type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.points || 1} {question.points === 1 ? 'point' : 'points'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Order #{question.ordering || index + 1}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <p className="font-medium text-gray-900 mb-1">
                            {question.question_text || "No question text"}
                          </p>
                          {question.explanation && (
                            <p className="text-sm text-gray-600">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          )}
                        </div>

                        {/* Show options for multiple choice questions */}
                        {question.question_type === 'multiple_choice' && question.options && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700">Options:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {question.options.map((option: any, optIndex: number) => (
                                <div 
                                  key={optIndex}
                                  className={`text-xs px-2 py-1 rounded ${
                                    option.is_correct 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span> {option.text}
                                  {option.is_correct && (
                                    <CheckCircle className="h-3 w-3 inline ml-1" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show correct answer for other types */}
                        {question.question_type !== 'multiple_choice' && question.correct_answer && (
                          <div className="mt-2">
                            <p className="text-xs">
                              <span className="font-medium text-gray-700">Correct Answer:</span>
                              <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {question.correct_answer}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions in this exercise
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first question to start building exercise content.
              </p>
              <Button
                onClick={() => setShowQuestionForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionTab;