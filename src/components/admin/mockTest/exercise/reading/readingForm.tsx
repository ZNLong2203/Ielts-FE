"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  BookOpen,
  FileText,
  Star,
  ArrowRight,
  Plus,
  Trash2,
  Calculator,
  Settings,
  CheckCircle,
  Clock,
  Hash,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { getReadingExercise, createReadingExercise, updateReadingExercise } from "@/api/reading";
import { IPassageParagraph } from "@/interface/reading";

// Validation Schema
const ReadingFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  test_section_id: z.string().min(1, "Section ID is required"),
  time_limit: z.number().min(1, "Time limit must be at least 1 minute").max(180, "Time limit cannot exceed 180 minutes"),
  passing_score: z.number().min(0, "Passing score must be at least 0").max(100, "Passing score cannot exceed 100"),
  ordering: z.number().min(1, "Ordering must be at least 1"),
  passage: z.object({
    title: z.string().min(1, "Passage title is required"),
    content: z.string().min(50, "Passage content must be at least 50 characters"),
    word_count: z.number().min(1, "Word count must be calculated"),
    difficulty_level: z.string().min(1, "Difficulty level is required"),
    paragraphs: z.array(z.object({
      id: z.string(),
      label: z.string().min(1, "Paragraph label is required"),
      content: z.string().min(1, "Paragraph content is required"),
    })).min(1, "At least one paragraph is required"),
  }),
});

const ReadingFormUpdateSchema = ReadingFormSchema.partial().extend({
  passage: ReadingFormSchema.shape.passage.partial(),
});

type ReadingFormData = z.infer<typeof ReadingFormSchema>;

const DIFFICULTY_OPTIONS = [
  { label: "⭐ Beginner", value: "1" },
  { label: "⭐⭐ Elementary", value: "2" },
  { label: "⭐⭐⭐ Intermediate", value: "3" },
  { label: "⭐⭐⭐⭐ Upper Intermediate", value: "4" },
  { label: "⭐⭐⭐⭐⭐ Advanced", value: "5" },
];

const ReadingForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const readingExerciseId = Array.isArray(param.slug) ? param.slug[0] : param.slug;
  const testSectionId = Array.isArray(param.sectionId) ? param.sectionId[0] : param.sectionId;
  const isEditing = !!readingExerciseId;

  const title = isEditing ? "Update Reading Exercise" : "Create Reading Exercise";
  const description = isEditing
    ? "Update reading exercise information and passage content"
    : "Create a comprehensive reading comprehension exercise with passage content";

  const [paragraphs, setParagraphs] = useState<IPassageParagraph[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Queries
  const {
    data: readingExerciseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["readingExercise", readingExerciseId],
    queryFn: () => getReadingExercise(readingExerciseId),
    enabled: !!readingExerciseId,
  });

  // Form setup
  const schema = isEditing ? ReadingFormUpdateSchema : ReadingFormSchema;

  const readingForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      test_section_id: testSectionId || "",
      time_limit: 20,
      passing_score: 65,
      ordering: 1,
      passage: {
        title: "",
        content: "",
        word_count: 0,
        difficulty_level: "3",
        paragraphs: [],
      },
    },
  });

  // Paragraphs field array
  const { fields, append, remove } = useFieldArray({
    control: readingForm.control,
    name: "passage.paragraphs",
  });

  // Mutations
  const createReadingExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ReadingFormSchema>) => {
      const payload = {
        ...formData,
        passage: {
          ...formData.passage,
          paragraphs: paragraphs,
          word_count: wordCount,
        },
      };
      console.log("Creating with payload:", payload);
      return createReadingExercise(payload);
    },
    onSuccess: () => {
      toast.success("Reading exercise created successfully! 📚");
      queryClient.invalidateQueries({ queryKey: ["readingExercises"] });
      router.push(`${ROUTES.ADMIN_MOCK_TESTS}/sections/${testSectionId}/exercises`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create reading exercise"
      );
    },
  });

  const updateReadingExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ReadingFormUpdateSchema>) => {
      const payload = {
        ...formData,
        passage: {
          ...formData.passage,
          title: formData.passage?.title || "",
          content: formData.passage?.content || "",
          difficulty_level: formData.passage?.difficulty_level || "3",
          paragraphs: paragraphs,
          word_count: wordCount,
        },
      };
      console.log("Updating with payload:", payload);
      return updateReadingExercise(readingExerciseId!, payload);
    },
    onSuccess: (data) => {
      console.log("Update success:", data);
      toast.success("Reading exercise updated successfully! 📚");
      queryClient.invalidateQueries({ queryKey: ["readingExercises"] });
      queryClient.invalidateQueries({ queryKey: ["readingExercise", readingExerciseId] });
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update reading exercise"
      );
    },
  });

  // Calculate word count from content
  const calculateWordCount = (content: string) => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };

  // Update word count when content changes
  const passageContent = readingForm.watch("passage.content");
  useEffect(() => {
    const count = calculateWordCount(passageContent || "");
    setWordCount(count);
    readingForm.setValue("passage.word_count", count);
  }, [passageContent, readingForm]);

  // Paragraph management functions
  const addParagraph = () => {
    const nextLabel = String.fromCharCode(65 + paragraphs.length);
    const newParagraph: IPassageParagraph = {
      id: crypto.randomUUID(),
      label: nextLabel,
      content: "",
    };
    setParagraphs([...paragraphs, newParagraph]);
    append(newParagraph);
  };

  const removeParagraph = (index: number) => {
    if (paragraphs.length > 1) {
      const newParagraphs = paragraphs.filter((_, i) => i !== index);
      const updatedParagraphs = newParagraphs.map((paragraph, i) => ({
        ...paragraph,
        label: String.fromCharCode(65 + i),
      }));
      setParagraphs(updatedParagraphs);
      remove(index);
    } else {
      toast.error("At least one paragraph is required");
    }
  };

  const updateParagraph = (
    index: number,
    field: keyof IPassageParagraph,
    value: any
  ) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = { ...newParagraphs[index], [field]: value };
    setParagraphs(newParagraphs);
    readingForm.setValue(`passage.paragraphs.${index}.${field}`, value);
  };

  // Generate paragraphs from content
  const generateParagraphs = () => {
    const content = readingForm.getValues("passage.content");
    if (!content.trim()) {
      toast.error("Please enter passage content first");
      return;
    }

    // Split content by double line breaks
    const generatedParagraphs = content
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0)
      .map((paragraph, index) => ({
        id: crypto.randomUUID(),
        label: String.fromCharCode(65 + index), // A, B, C, etc.
        content: paragraph.trim(),
      }));

    if (generatedParagraphs.length === 0) {
      toast.error("No paragraphs found in the content");
      return;
    }

    // Clear existing paragraphs
    const currentLength = paragraphs.length;
    for (let i = 0; i < currentLength; i++) {
      remove(0);
    }
    setParagraphs([]);

    // Add new paragraphs
    generatedParagraphs.forEach(paragraph => {
      append(paragraph);
    });
    setParagraphs(generatedParagraphs);

    toast.success(`Generated ${generatedParagraphs.length} paragraphs`);
  };

  // Update paragraphs in form
  useEffect(() => {
    readingForm.setValue("passage.paragraphs", paragraphs);
  }, [paragraphs, readingForm]);

  // Load existing data
  useEffect(() => {
    if (readingExerciseData && isEditing) {
      console.log("Loading existing reading exercise data:", readingExerciseData);

      // Reset form with existing data
      readingForm.reset({
        title: readingExerciseData.title || "",
        test_section_id: readingExerciseData.test_section_id || "",
        time_limit: readingExerciseData.time_limit || 20,
        passing_score: readingExerciseData.passing_score || 65,
        ordering: readingExerciseData.ordering || 1,
        passage: {
          title: readingExerciseData.passage?.title || "",
          content: readingExerciseData.passage?.content || "",
          word_count: readingExerciseData.passage?.word_count || 0,
          difficulty_level: readingExerciseData.passage?.difficulty_level || "3",
          paragraphs: readingExerciseData.passage?.paragraphs || [],
        },
      });

      // Set paragraphs state
      if (
        readingExerciseData.passage?.paragraphs &&
        Array.isArray(readingExerciseData.passage.paragraphs)
      ) {
        console.log("Setting paragraphs:", readingExerciseData.passage.paragraphs);
        setParagraphs(readingExerciseData.passage.paragraphs);
      }
    }
  }, [readingExerciseData, isEditing, readingForm]);

  // Initialize first paragraph for new exercises
  useEffect(() => {
    if (!isEditing && paragraphs.length === 0) {
      const initialParagraph: IPassageParagraph = {
        id: crypto.randomUUID(),
        label: "A",
        content: "",
      };
      setParagraphs([initialParagraph]);
      append(initialParagraph);
    }
  }, [isEditing, paragraphs.length, append]);

  const onSubmit = async (data: any) => {
    if (paragraphs.length === 0) {
      toast.error("Please add at least one paragraph to the passage");
      return;
    }

    if (wordCount < 50) {
      toast.error("Passage content must be at least 50 words");
      return;
    }

    try {
      if (isEditing) {
        await updateReadingExerciseMutation.mutateAsync(data);
      } else {
        await createReadingExerciseMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isSubmitting =
    createReadingExerciseMutation.isPending || updateReadingExerciseMutation.isPending;

  const selectedDifficulty = readingForm.watch("passage.difficulty_level");
  const readingTime = Math.ceil(wordCount / 200);

  if (isLoading && isEditing) {
    return <Loading />;
  }

  if (isError && isEditing) {
    return (
      <Error
        title="Reading Exercise Not Found"
        description="The requested reading exercise does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(`${ROUTES.ADMIN_MOCK_TESTS}/sections/${testSectionId}/exercises`)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{isPreviewMode ? "Edit Mode" : "Preview"}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push(`${ROUTES.ADMIN_MOCK_TESTS}/sections/${testSectionId}/exercises`)}
                className="flex items-center space-x-2"
              >
                <span>Back to Exercises</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPreviewMode ? (
          // Preview Mode
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{readingForm.watch("title") || "Untitled Exercise"}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Number(selectedDifficulty) }, (_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{readingForm.watch("time_limit")} min</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {readingForm.watch("passage.title") || "Untitled Passage"}
                    </h3>
                    
                    {readingForm.watch("passage.content") && (
                      <div className="prose prose-gray max-w-none mb-6">
                        <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                          {readingForm.watch("passage.content")}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <span>Words: {wordCount}</span>
                      <span>Paragraphs: {paragraphs.length}</span>
                      <span>Reading Time: ~{readingTime} min</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Paragraph References:</h4>
                      {paragraphs.map((paragraph, index) => (
                        <div key={paragraph.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                              Paragraph {paragraph.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {paragraph.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Edit Mode
          <Form {...readingForm}>
            <form
              onSubmit={(e) => {
                readingForm.handleSubmit(onSubmit)(e);
              }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>Exercise Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <TextField
                        control={readingForm.control}
                        name="title"
                        label="Exercise Title"
                        placeholder="Enter exercise title..."
                        required
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TextField
                          control={readingForm.control}
                          name="time_limit"
                          label="Time Limit (minutes)"
                          type="number"
                          placeholder="20"
                          required
                        />

                        <TextField
                          control={readingForm.control}
                          name="passing_score"
                          label="Passing Score (%)"
                          type="number"
                          placeholder="65"
                          required
                        />

                        <TextField
                          control={readingForm.control}
                          name="ordering"
                          label="Order"
                          type="number"
                          placeholder="1"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Passage Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <span>Reading Passage</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          control={readingForm.control}
                          name="passage.title"
                          label="Passage Title"
                          placeholder="Enter passage title..."
                          required
                        />

                        <SelectField
                          control={readingForm.control}
                          name="passage.difficulty_level"
                          label="Difficulty Level"
                          placeholder="Select difficulty"
                          options={DIFFICULTY_OPTIONS}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Passage Content</label>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Words: {wordCount}</span>
                            <span>~{readingTime} min read</span>
                          </div>
                        </div>
                        <TextField
                          control={readingForm.control}
                          name="passage.content"
                          placeholder="Enter the reading passage content here. Separate paragraphs with double line breaks for automatic paragraph detection..."
                          rows={12}
                          required
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateParagraphs}
                          className="flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Auto-Generate Paragraphs</span>
                        </Button>
                        
                        <div className="text-sm text-gray-600">
                          Separate paragraphs with double line breaks
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Paragraphs Management - Similar to mockTestForm sections */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="border-t">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-xl">
                            <Hash className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Paragraph References
                            </h3>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addParagraph}
                          className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Paragraph</span>
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {paragraphs.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Hash className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No paragraphs yet
                          </h3>
                          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Create your first paragraph reference to help students navigate through the passage.
                          </p>
                          <Button
                            type="button"
                            onClick={addParagraph}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Paragraph
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {paragraphs.map((paragraph, index) => (
                            <div key={paragraph.id} className="relative group">
                              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300">
                                {/* Paragraph Header */}
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center space-x-4">
                                    <div className="relative">
                                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                                        {paragraph.label}
                                      </div>
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900">
                                        Paragraph {paragraph.label}
                                      </h4>
                                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <span>Reference paragraph</span>
                                        <span>•</span>
                                        <span>{paragraph.content.length} characters</span>
                                      </div>
                                    </div>
                                  </div>

                                  {paragraphs.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeParagraph(index)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                {/* Paragraph Form Fields */}
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-2">
                                      <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                          <Hash className="h-4 w-4 text-gray-500" />
                                          <span>Label</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={paragraph.label}
                                          onChange={(e) =>
                                            updateParagraph(
                                              index,
                                              "label",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                          placeholder="A"
                                        />
                                      </div>
                                    </div>

                                    <div className="md:col-span-10">
                                      <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                          <FileText className="h-4 w-4 text-gray-500" />
                                          <span>Content</span>
                                        </label>
                                        <textarea
                                          value={paragraph.content}
                                          onChange={(e) =>
                                            updateParagraph(
                                              index,
                                              "content",
                                              e.target.value
                                            )
                                          }
                                          rows={4}
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                                          placeholder="Enter paragraph content..."
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Paragraph Footer */}
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                  <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>
                                      Paragraph {index + 1} of {paragraphs.length}
                                    </span>
                                    <div className="flex items-center space-x-4">
                                      <span>Label: {paragraph.label}</span>
                                      <span>•</span>
                                      <span>{paragraph.content.length} chars</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {index < paragraphs.length - 1 && (
                                <div className="flex justify-center my-4">
                                  <div className="w-px h-6 bg-gray-300"></div>
                                </div>
                              )}
                            </div>
                          ))}

                          <div className="flex justify-center pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addParagraph}
                              className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                            >
                              <Plus className="h-5 w-5 text-gray-500" />
                              <span className="text-gray-600 font-medium">
                                Add Another Paragraph
                              </span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Exercise Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5 text-green-600" />
                        <span>Exercise Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Word Count:</span>
                          <span className="font-medium">{wordCount}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Paragraphs:</span>
                          <span className="font-medium">{paragraphs.length}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Time Limit:</span>
                          <span className="font-medium">
                            {readingForm.watch("time_limit")} min
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Passing Score:</span>
                          <span className="font-medium">
                            {readingForm.watch("passing_score")}%
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reading Time:</span>
                          <span className="font-medium">~{readingTime} min</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Difficulty:</span>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Number(selectedDifficulty) }, (_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-xs text-gray-500">
                          <p>• Average reading speed: 200 words/min</p>
                          <p>• Recommended for {DIFFICULTY_OPTIONS.find(opt => opt.value === selectedDifficulty)?.label.replace(/⭐/g, '').trim()} level</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validation Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span>Validation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          {readingForm.watch("title") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Exercise title</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {readingForm.watch("passage.title") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Passage title</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {wordCount >= 50 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Passage content ({wordCount}/50+ words)</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {paragraphs.length > 0 && paragraphs.every(p => p.content.trim()) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Paragraph references</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <Button
                          type="submit"
                          className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                          disabled={isSubmitting || paragraphs.length === 0 || wordCount < 50}
                        >
                          <Save className="h-4 w-4" />
                          <span>
                            {isSubmitting
                              ? isEditing
                                ? "Updating..."
                                : "Creating..."
                              : isEditing
                              ? "Update Exercise"
                              : "Create Exercise"}
                          </span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => router.back()}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ReadingForm;