"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  CheckCircle,
  HelpCircle,
  BarChart3,
  FileText,
  List,
} from "lucide-react";
import { ICourseQuestion } from "@/interface/courseQuestion";

interface CourseQuestionItemProps {
  question: ICourseQuestion;
  questionIndex: number;
  exerciseId: string;
  handleEditQuestion: (question: ICourseQuestion) => void;
  handleDeleteQuestion: (question: ICourseQuestion) => void;
}

const CourseQuestionItem = ({
  question,
  questionIndex,
  exerciseId,
  handleEditQuestion,
  handleDeleteQuestion,
}: CourseQuestionItemProps) => {
  return (
    <div className="border rounded-lg p-4 transition-all duration-200 bg-white hover:shadow-sm hover:border-gray-300">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-50 text-green-600 border border-green-200">
            <HelpCircle className="h-4 w-4" />
          </div>

          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Question {question.ordering ?? questionIndex + 1}
          </Badge>

          <h4 className="font-semibold text-gray-900">
            {question.question_text || `Question ${questionIndex + 1}`}
          </h4>         
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditQuestion(question)}
            className="h-8 w-8 p-0 hover:bg-blue-50"
            title="Edit question"
          >
            <Edit className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteQuestion(question)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete question"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Question Metadata */}
      <div className="flex items-center space-x-3 mb-4">
        <Badge className="bg-emerald-100 text-emerald-700 px-2 py-1">
          <HelpCircle className="h-3 w-3 mr-1" />
          {question.question_type || "Question"}
        </Badge>

        {question.points && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <BarChart3 className="h-3 w-3" />
            <span>{question.points} points</span>
          </div>
        )}

        {question.question_options && question.question_options.length > 0 && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <List className="h-3 w-3 mr-1" />
            {question.question_options.length} options
          </Badge>
        )}
      </div>

      {/* Question Content */}
      {question.question_text && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Question Text</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {question.question_text}
          </p>
        </div>
      )}

      {/* Question Options Preview */}
      {question.question_options && question.question_options.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <List className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Answer Options</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {question.question_options.slice(0, 3).map((option: any, index: any) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 bg-blue-50 rounded text-xs"
              >
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                  {String.fromCharCode(65 + index)}
                </Badge>
                <span className="flex-1 text-blue-800">
                  {option.option_text || `Option ${index + 1}`}
                </span>
                {option.is_correct && (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                )}
              </div>
            ))}
            {question.question_options.length > 3 && (
              <div className="text-xs text-gray-500 text-center py-1">
                ... and {question.question_options.length - 3} more options
              </div>
            )}
          </div>
        </div>
      )}

      {/* Explanation Preview */}
      {question.explanation && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">Explanation</span>
          </div>
          <p className="text-sm text-yellow-800 line-clamp-2">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseQuestionItem;