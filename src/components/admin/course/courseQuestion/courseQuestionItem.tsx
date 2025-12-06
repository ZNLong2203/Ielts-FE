"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  CheckCircle,
  HelpCircle,
  BarChart3,
  FileText,
  List,
  Image,
  ZoomIn,
  Volume2,
  ExternalLink,
  X,
} from "lucide-react";
import { ICourseQuestion } from "@/interface/courseQuestion";
import { deleteCourseQuestion } from "@/api/courseQuestion";
import CompactAudioPlayer from "@/components/modal/CompactAudioPlayer";

interface CourseQuestionItemProps {
  question: ICourseQuestion;
  questionIndex: number;
  exerciseId: string;
  lessonId?: string;
  sectionId?: string;
  handleEditQuestion: (question: ICourseQuestion) => void;
  onRefresh?: () => void;
}

const CourseQuestionItem = ({
  question,
  questionIndex,
  exerciseId,
  lessonId,
  sectionId,
  handleEditQuestion,
  onRefresh,
}: CourseQuestionItemProps) => {
  const [imageError, setImageError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: () => {
      if (!lessonId) {
        throw new Error("Lesson ID is required to delete a question");
      }
      return deleteCourseQuestion(lessonId, exerciseId, question.id);
    },
    onSuccess: () => {
      toast.success("Question deleted successfully");
      
      // Enhanced invalidation for course form context
      queryClient.invalidateQueries({ queryKey: ["courseQuestions", exerciseId] });
      if (lessonId) {
        queryClient.invalidateQueries({ queryKey: ["exercise", lessonId, exerciseId] });
        queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
      }
      
      if (sectionId && lessonId) {
        queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
        queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lessonId] });
        queryClient.invalidateQueries({ queryKey: ["sections", sectionId] });
      }
      
      setDeleteDialogOpen(false);
      onRefresh?.();
    },
    onError: (error: Error) => {
      console.error("❌ Delete question error:", error);
      toast.error(error.message || "Failed to delete question");
      setDeleteDialogOpen(false);
    },
  });

  const hasImage = question.image_url && !imageError;
  const hasAudio = question.audio_url;
  const hasMedia = hasImage || hasAudio;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteQuestionMutation.mutate();
  };

  return (
    <>
      <div className="border rounded-lg p-4 transition-all duration-200 bg-white hover:shadow-md hover:border-gray-300 group">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-black text-white font-semibold text-sm">
              {question.ordering ?? questionIndex + 1}
            </div>

            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 text-xs">
                Question {question.ordering ?? questionIndex + 1}
              </Badge>

              {question.question_type && (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 text-xs">
                  {question.question_type}
                </Badge>
              )}

              {question.points && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {question.points} pts
                </Badge>
              )}
            </div>

            {/* Media Indicators */}
            {hasMedia && (
              <div className="flex items-center space-x-1">
                {hasImage && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 px-1 py-0.5">
                    <Image className="h-3 w-3" />
                  </Badge>
                )}
                {hasAudio && (
                  <Badge variant="outline" className="bg-purple-50 text-gray-700 px-1 py-0.5">
                    <Volume2 className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditQuestion(question)}
              className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-700"
              title="Edit question"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete question"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Text */}
        {question.question_text && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 leading-relaxed">
              {question.question_text}
            </h4>
          </div>
        )}

        {/* Media Section */}
        {hasMedia && (
          <div className="mb-4 space-y-3">
            {/* Question Audio Player - Using Compact Player */}
            {hasAudio && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Question Audio</span>
                </div>
                
                {/* Compact Audio Player */}
                <CompactAudioPlayer 
                  src={question.audio_url || ""} 
                  title={`Question ${question.ordering ?? questionIndex + 1} Audio`}
                  showTitle={false}
                  showProgress={true}
                  showVolume={false}
                />
              </div>
            )}

            {/* Question Image */}
            {hasImage && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Question Image</span>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative group/image cursor-pointer rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={question.image_url}
                        alt="Question image"
                        onError={handleImageError}
                        className="w-full h-40 object-cover transition-all duration-200 group-hover/image:brightness-90"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
                          <div className="bg-white rounded-full p-2 shadow-lg">
                            <ZoomIn className="h-4 w-4 text-gray-700" />
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(question.image_url, '_blank');
                          }}
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl max-h-[90vh] p-2">
                    <div className="relative">
                      <img
                        src={question.image_url}
                        alt="Question image"
                        className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(question.image_url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Original
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}

        {/* Question Options Preview */}
        {question.question_options && question.question_options.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4 text-black" />
                <span className="text-sm font-medium text-black">Answer Options</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {question.question_options.length} options
              </Badge>
            </div>
            
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {question.question_options.map((option: any, index: number) => (
                <div
                  key={option.id || index}
                  className={`flex items-center space-x-2 p-2 rounded text-xs transition-colors ${
                    option.is_correct 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Badge 
                    variant="outline" 
                    className={`w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs ${
                      option.is_correct 
                        ? 'bg-green-100 text-green-700 border-green-300' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  <span className={`flex-1 ${
                    option.is_correct ? 'text-green-800 font-medium' : 'text-gray-700'
                  }`}>
                    {option.option_text || `Option ${index + 1}`}
                  </span>
                  {option.is_correct && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation Preview */}
        {question.explanation && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-1">
              <HelpCircle className="h-3 w-3 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Explanation</span>
            </div>
            <p className="text-sm text-yellow-800 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Question Metadata Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>#{question.ordering ?? questionIndex + 1}</span>
            {question.points && <span>• {question.points} pts</span>}
            {question.question_options && (
              <span>• {question.question_options.length} options</span>
            )}
            {hasMedia && (
              <div className="flex items-center space-x-1">
                {hasImage && <span>• Image</span>}
                {hasAudio && <span>• Audio</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
              {question.question_text && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm font-medium">
                  "{question.question_text.substring(0, 100)}..."
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteQuestionMutation.isPending}
            >
              {deleteQuestionMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseQuestionItem;