"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  X,
  List,
  FileText,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from "lucide-react";

import { ISection, ISectionCreate, ISectionUpdate } from "@/interface/section";
import { createSection, updateSection } from "@/api/section";

// Validation Schema
const SectionFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  ordering: z.number().min(1, "Order must be at least 1"),
});

type SectionFormData = z.infer<typeof SectionFormSchema>;

interface SectionFormProps {
  courseId: string;
  section?: ISection | null; // null for create, ISection for edit
  existingSections?: ISection[];
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const SectionForm = ({
  courseId,
  section = null,
  existingSections = [],
  onSuccess,
  onCancel,
  className = "",
}: SectionFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!section;

  // Form setup
  const form = useForm<SectionFormData>({
    resolver: zodResolver(SectionFormSchema),
    defaultValues: {
      title: section?.title || "",
      description: section?.description || "",
      ordering: section?.ordering || getNextOrdering(),
    },
  });

  // Get next available ordering number
  function getNextOrdering() {
    if (existingSections.length === 0) return 1;
    const maxOrdering = Math.max(
      ...existingSections.map((s) => s.ordering || 0)
    );
    return maxOrdering + 1;
  }

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (data: SectionFormData) => {
      const sectionData: ISectionCreate = {
        title: data.title,
        description: data.description || "",
        ordering: data.ordering,
      };
      return createSection(sectionData, courseId);
    },
    onSuccess: (data) => {
      toast.success("Section created successfully");
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });

      onSuccess?.();
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create section");
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (data: SectionFormData) => {
      if (!section?.id) throw new Error("Section ID is required");
      const updateData: ISectionUpdate = {
        title: data.title,
        description: data.description || "",
        ordering: data.ordering,
      };
      return updateSection(updateData, section.id, courseId);
    },
    onSuccess: () => {
      toast.success("Section updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });

      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update section");
    },
  });

  // Submit handler - using programmatic form submission
  const handleSubmit = async (data: SectionFormData) => {
    try {
      if (isEditing) {
        updateSectionMutation.mutate(data);
      } else {
        console.log("Submitting data:", data);
        createSectionMutation.mutate(data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Handle form submission programmatically
  const onSubmitClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isValid = await form.trigger();
    if (isValid) {
      const formData = form.getValues();
      handleSubmit(formData);
    }
  };

  // Move ordering up/down
  const adjustOrdering = (direction: "up" | "down") => {
    const currentOrdering = form.getValues("ordering");
    const newOrdering =
      direction === "up" ? currentOrdering - 1 : currentOrdering + 1;

    if (newOrdering >= 1) {
      form.setValue("ordering", newOrdering);
    }
  };

  const isLoading =
    createSectionMutation.isPending || updateSectionMutation.isPending;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <List className="h-5 w-5 text-blue-600" />
            <span>{isEditing ? "Edit Section" : "Create New Section"}</span>
            {isEditing && section && (
              <Badge variant="outline" className="ml-2">
                Section {section.ordering}
              </Badge>
            )}
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          {/* Using div instead of form to avoid nesting forms */}
          <div className="space-y-6">
            {/* Section Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>Section Title</span>
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter section title..."
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onSubmitClick(e as any);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter section description..."
                        rows={3}
                        {...field}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ordering"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Order</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                          className="w-24 focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <div className="flex flex-col space-y-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adjustOrdering("up")}
                          className="h-6 w-6 p-0"
                          disabled={field.value <= 1}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adjustOrdering("down")}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        Position in course outline
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Existing Sections Preview */}
            {existingSections.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Current Sections</span>
                    <Badge variant="outline">{existingSections.length}</Badge>
                  </h4>

                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {existingSections
                      .sort((a, b) => (a.ordering || 999) - (b.ordering || 999))
                      .map((existingSection) => (
                        <div
                          key={existingSection.id}
                          className={`flex items-center justify-between p-2 rounded text-xs border ${
                            existingSection.id === section?.id
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`w-6 h-5 text-xs justify-center ${
                                existingSection.id === section?.id
                                  ? "bg-blue-100 text-blue-700"
                                  : ""
                              }`}
                            >
                              {existingSection.ordering}
                            </Badge>
                            <span
                              className={`truncate max-w-48 ${
                                existingSection.id === section?.id
                                  ? "font-medium text-blue-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {existingSection.title}
                            </span>
                          </div>
                          {existingSection.id === section?.id && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Editing
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="button"
                onClick={onSubmitClick}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isLoading
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Section"
                    : "Create Section"}
                </span>
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SectionForm;
