"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  FileText,
  Video,
  Clock,
  Play,
  Edit,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";

import { ISection } from "@/interface/section";
import { deleteSection } from "@/api/section";
import { AlertModal } from "@/components/modal/alert-modal";
import SectionForm from "./sectionForm";

interface SectionDetailProps {
  courseId: string;
  sections?: ISection[];
  isEditable?: boolean;
  className?: string;
}

const SectionDetail = ({
  courseId,
  sections = [],
  isEditable = false,
  className = "",
}: SectionDetailProps) => {
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<ISection | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<ISection | null>(null);

  // Sort sections by ordering field, fallback to original index
  const sortedSections = [...sections].sort((a, b) => {
    const orderA = a.ordering ?? 999;
    const orderB = b.ordering ?? 999;
    return orderA - orderB;
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      console.log("Deleting section:", sectionId);
      return deleteSection(sectionId, courseId);
    },
    onSuccess: () => {
      toast.success("Section deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    },
    onError: (error: any) => {
      console.error("Delete section error:", error);
      toast.error(error?.message || "Failed to delete section");
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    },
  });

  // Handle delete section click
  const handleDeleteSection = (section: ISection) => {
    setSectionToDelete(section);
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (sectionToDelete?.id) {
      deleteSectionMutation.mutate(sectionToDelete.id);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSectionToDelete(null);
  };

  // Handle edit section
  const handleEditSection = (section: ISection) => {
    setEditingSection(section);
    setShowCreateForm(false);
  };

  // Handle create new section
  const handleCreateSection = () => {
    setShowCreateForm(true);
    setEditingSection(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setEditingSection(null);
    setShowCreateForm(false);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setEditingSection(null);
    setShowCreateForm(false);
  };

  // Show form if editing or creating
  if (editingSection || showCreateForm) {
    return (
      <>
        <SectionForm
          courseId={courseId}
          section={editingSection}
          existingSections={sections}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          className={className}
        />

        {/* Delete confirmation modal */}
        <AlertModal
          isOpen={deleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={deleteSectionMutation.isPending}
        />
      </>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <>
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Course Outline</span>
              </div>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateSection}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No sections available</p>
              <p className="text-sm mb-4">
                This course doesn't have any sections yet.
              </p>
              {isEditable && (
                <Button
                  variant="outline"
                  onClick={handleCreateSection}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Section
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete confirmation modal */}
        <AlertModal
          isOpen={deleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          loading={deleteSectionMutation.isPending}
        />
      </>
    );
  }

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "article":
      case "text":
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-purple-500" />;
    }
  };

  const getTotalLessons = () => {
    return sections.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0
    );
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Course Outline</span>
              <Badge variant="outline" className="ml-2">
                {sections.length} sections • {getTotalLessons()} lessons
              </Badge>
            </div>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateSection}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Section</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedSections.map((section, sectionIndex) => {
              // Sort lessons by ordering within each section
              const sortedLessons = section.lessons
                ? [...section.lessons].sort((a, b) => {
                    const orderA = a.ordering ?? 999;
                    const orderB = b.ordering ?? 999;
                    return orderA - orderB;
                  })
                : [];

              return (
                <div
                  key={section.id || sectionIndex}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-800"
                      >
                        Section {section.ordering ?? sectionIndex + 1}
                      </Badge>
                      <h4 className="font-semibold text-gray-900">
                        {section.title ||
                          `Untitled Section ${
                            section.ordering ?? sectionIndex + 1
                          }`}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {sortedLessons.length} lessons
                      </Badge>
                      {isEditable && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSection(section)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title="Edit section"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSection(section)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete section"
                            disabled={deleteSectionMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section Description */}
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {section.description}
                    </p>
                  )}

                  {/* Lessons List */}
                  {sortedLessons && sortedLessons.length > 0 ? (
                    <div className="space-y-3">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                          <Play className="h-3 w-3" />
                          <span>Lessons</span>
                        </h5>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {sortedLessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id || lessonIndex}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors group"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Badge
                                variant="outline"
                                className="text-xs w-8 justify-center flex-shrink-0"
                              >
                                {lesson.ordering ?? lessonIndex + 1}
                              </Badge>

                              <div className="flex-shrink-0">
                                {getLessonIcon(lesson.lesson_type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {lesson.title}
                                </p>
                                {lesson.description && (
                                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {lesson.video_duration && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{lesson.video_duration} min</span>
                                </div>
                              )}

                              {lesson.is_preview && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Preview
                                </Badge>
                              )}

                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  lesson.lesson_type === "video"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                }`}
                              >
                                {lesson.lesson_type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Separator />
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
                        <Play className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs text-gray-500 mb-2">
                          No lessons in this section
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {sections.length}
                </div>
                <div className="text-xs text-blue-600">Sections</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {getTotalLessons()}
                </div>
                <div className="text-xs text-green-600">Total Lessons</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {sections.reduce((total, section) => {
                    const sectionDuration =
                      section.lessons?.reduce(
                        (lessonTotal, lesson) =>
                          lessonTotal + (lesson.video_duration || 0),
                        0
                      ) || 0;
                    return total + sectionDuration;
                  }, 0)}{" "}
                  min
                </div>
                <div className="text-xs text-purple-600">Total Duration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteSectionMutation.isPending}
      />
    </>
  );
};

export default SectionDetail;
