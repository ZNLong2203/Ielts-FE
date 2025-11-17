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
  Headphones,
  FileText,
  Star,
  ArrowRight,
  Plus,
  Trash2,
  Calculator,
  CheckCircle,
  Clock,
  Hash,
  AlertTriangle,
  Eye,
  Upload,
  Volume2,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { getListeningExercise, createListeningExercise, updateListeningExercise } from "@/api/listening";
import { IListeningParagraph } from "@/interface/listening";
import { ListeningFormSchema } from "@/validation/listening";

const ListeningFormUpdateSchema = ListeningFormSchema.partial().extend({
  passage: ListeningFormSchema.shape.passage.partial(),
});

const DIFFICULTY_OPTIONS = [
  { label: "Beginner", value: "1" },
  { label: "Elementary", value: "2" },
  { label: "Intermediate", value: "3" },
  { label: "Upper Intermediate", value: "4" },
  { label: "Advanced", value: "5" },
];

const ListeningForm = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const listeningExerciseId = Array.isArray(params.listeningId) ? params.listeningId[0] : params.listeningId;
  const testSectionId = searchParams?.get("sectionId") ?? undefined;
  const isEditing = !!listeningExerciseId;

  const title = isEditing ? "Update Listening Exercise" : "Create Listening Exercise";
  const description = isEditing
    ? "Update listening exercise information and audio content"
    : "Create a comprehensive listening comprehension exercise with audio content";

  const [paragraphs, setParagraphs] = useState<IListeningParagraph[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState(0);

  // Audio ref
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Queries
  const {
    data: listeningExerciseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["listeningExercise", listeningExerciseId],
    queryFn: () => getListeningExercise(listeningExerciseId),
    enabled: !!listeningExerciseId,
  });

  // Form setup
  const schema = isEditing ? ListeningFormUpdateSchema : ListeningFormSchema;

  const listeningForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      test_section_id: testSectionId || "",
      time_limit: 30,
      passing_score: "65",
      ordering: 1,
      audio_url: undefined,
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
    control: listeningForm.control,
    name: "passage.paragraphs",
  });

  // Mutations
  const createListeningExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ListeningFormSchema>) => {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('test_section_id', formData.test_section_id);
      formDataToSend.append('time_limit', formData.time_limit.toString());
      formDataToSend.append('passing_score', formData.passing_score);
      formDataToSend.append('ordering', formData.ordering.toString());
      
      // Add audio file if present
      if (audioFile) {
        formDataToSend.append('audio_url', audioFile);
      }
      
      // Add passage data
      const passageData = {
        ...formData.passage,
        paragraphs: paragraphs,
        word_count: wordCount,
      };
      formDataToSend.append('passage', JSON.stringify(passageData));
      
      return createListeningExercise(formDataToSend as any);
    },
    onSuccess: () => {
      toast.success("Listening exercise created successfully! 🎧");
      queryClient.invalidateQueries({ queryKey: ["listeningExercises"] });
      router.push(`${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create listening exercise"
      );
    },
  });

  const updateListeningExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ListeningFormUpdateSchema>) => {
      const formDataToSend = new FormData();
      
      // Add form fields
      if (formData.title) formDataToSend.append('title', formData.title);
      if (formData.time_limit) formDataToSend.append('time_limit', formData.time_limit.toString());
      if (formData.passing_score) formDataToSend.append('passing_score', formData.passing_score);
      if (formData.ordering) formDataToSend.append('ordering', formData.ordering.toString());
      
      // Add audio file if new file is uploaded
      if (audioFile) {
        formDataToSend.append('audio_url', audioFile);
      }
      
      // Add passage data
      const passageData = {
        title: formData.passage?.title || "",
        content: formData.passage?.content || "",
        difficulty_level: formData.passage?.difficulty_level || "3",
        paragraphs: paragraphs,
        word_count: wordCount,
      };
      formDataToSend.append('passage', JSON.stringify(passageData));
      
      return updateListeningExercise(listeningExerciseId!, formDataToSend as any);
    },
    onSuccess: () => {
      toast.success("Listening exercise updated successfully! 🎧");
      queryClient.invalidateQueries({ queryKey: ["listeningExercises"] });
      queryClient.invalidateQueries({ queryKey: ["listeningExercise", listeningExerciseId] });
      router.push(`${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update listening exercise"
      );
    },
  });

  // Utility functions
  const calculateWordCount = (content: string) => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update word count when content changes
  const passageContent = listeningForm.watch("passage.content");
  useEffect(() => {
    const count = calculateWordCount(passageContent || "");
    setWordCount(count);
    listeningForm.setValue("passage.word_count", count);
  }, [passageContent, listeningForm]);

  // Audio handling
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      listeningForm.setValue("audio_url", file);
      
      // Get audio duration
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.round(audio.duration));
      };
    }
  };

  // Paragraph management functions
  const addParagraph = () => {
    const nextLabel = String.fromCharCode(65 + paragraphs.length);
    const newParagraph: IListeningParagraph = {
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
    field: keyof IListeningParagraph,
    value: any
  ) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = { ...newParagraphs[index], [field]: value };
    setParagraphs(newParagraphs);
    listeningForm.setValue(`passage.paragraphs.${index}.${field}`, value);
  };

  // Update paragraphs in form
  useEffect(() => {
    listeningForm.setValue("passage.paragraphs", paragraphs);
  }, [paragraphs, listeningForm]);

  // Load existing data
  useEffect(() => {
    if (listeningExerciseData && isEditing) {
      listeningForm.reset({
        title: listeningExerciseData.title || "",
        test_section_id: testSectionId || "",
        time_limit: listeningExerciseData.time_limit || 30,
        passing_score: listeningExerciseData.passing_score || "",
        ordering: listeningExerciseData.ordering || 1,
        audio_url: listeningExerciseData.audio_url,
        passage: {
          title: listeningExerciseData.listening_passage?.title || "",
          content: listeningExerciseData.listening_passage?.content || "",
          word_count: listeningExerciseData.listening_passage?.word_count || 0,
          difficulty_level: listeningExerciseData.listening_passage?.difficulty_level?.toString() || "3",
          paragraphs: listeningExerciseData.listening_passage?.paragraphs || [],
        },
      });

      // Set paragraphs state
      if (
        listeningExerciseData.listening_passage?.paragraphs &&
        Array.isArray(listeningExerciseData.listening_passage.paragraphs)
      ) {
        setParagraphs(listeningExerciseData.listening_passage.paragraphs);
      }

      // Set audio URL if exists
      if (listeningExerciseData.audio_url && typeof listeningExerciseData.audio_url === 'string') {
        setAudioUrl(listeningExerciseData.audio_url);
      }
    }
  }, [listeningExerciseData, isEditing, listeningForm, testSectionId]);

  // Initialize first paragraph for new exercises
  useEffect(() => {
    if (!isEditing && paragraphs.length === 0) {
      const initialParagraph: IListeningParagraph = {
        id: crypto.randomUUID(),
        label: "A",
        content: "",
      };
      setParagraphs([initialParagraph]);
      append(initialParagraph);
    }
  }, [isEditing, paragraphs.length, append]);

  const onSubmit = async (data: any) => {
    if (!audioFile && !audioUrl) {
      toast.error("Please upload an audio file");
      return;
    }

    try {
      if (isEditing) {
        await updateListeningExerciseMutation.mutateAsync(data);
      } else {
        await createListeningExerciseMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isSubmitting = createListeningExerciseMutation.isPending || updateListeningExerciseMutation.isPending;
  const selectedDifficulty = listeningForm.watch("passage.difficulty_level");

  if (isLoading && isEditing) {
    return <Loading />;
  }

  if (isError && isEditing) {
    return (
      <Error
        title="Listening Exercise Not Found"
        description="The requested listening exercise does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(`${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`)}
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Headphones className="h-6 w-6 text-purple-600" />
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
                onClick={() => router.push(`${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`)}
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
                  <span>{listeningForm.watch("title") || "Untitled Exercise"}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Number(selectedDifficulty) }, (_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{listeningForm.watch("time_limit")} min</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Volume2 className="h-5 w-5 text-purple-600" />
                      <span>{listeningForm.watch("passage.title") || "Untitled Audio"}</span>
                    </h3>
                    
                    {/* Audio Player Preview */}
                    {audioUrl && (
                      <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-4 bg-purple-100 rounded-full">
                            <Headphones className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{listeningForm.watch("passage.title")}</h4>
                            <p className="text-sm text-gray-600">Duration: {formatTime(audioDuration)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <audio 
                            ref={audioRef}
                            src={audioUrl}
                            onLoadedMetadata={() => {
                              if (audioRef.current) {
                                setAudioDuration(audioRef.current.duration);
                              }
                            }}
                            className="w-full"
                            controls
                          />
                        </div>
                      </div>
                    )}

                    {listeningForm.watch("passage.content") && (
                      <div className="prose prose-gray max-w-none mb-6">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Audio Transcript:</span>
                        </h4>
                        <div className="whitespace-pre-line text-gray-700 leading-relaxed p-4 bg-gray-50 rounded-lg border">
                          {listeningForm.watch("passage.content")}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <span>Words: {wordCount}</span>
                      <span>Paragraphs: {paragraphs.length}</span>
                      <span>Duration: {formatTime(audioDuration)}</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Paragraph References:</h4>
                      {paragraphs.map((paragraph) => (
                        <div key={paragraph.id} className="border-l-4 border-purple-500 pl-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
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
          <Form {...listeningForm}>
            <form onSubmit={listeningForm.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span>Exercise Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <TextField
                        control={listeningForm.control}
                        name="title"
                        label="Exercise Title"
                        placeholder="Enter exercise title..."
                        required
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TextField
                          control={listeningForm.control}
                          name="time_limit"
                          label="Time Limit (minutes)"
                          type="number"
                          placeholder="30"
                          required
                        />

                        <TextField
                          control={listeningForm.control}
                          name="passing_score"
                          label="Passing Score"
                          type="text"
                          placeholder="65"
                          required
                        />

                        <TextField
                          control={listeningForm.control}
                          name="ordering"
                          label="Order"
                          type="number"
                          placeholder="1"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audio & Passage Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Headphones className="h-5 w-5 text-purple-600" />
                        <span>Audio & Transcript</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                          control={listeningForm.control}
                          name="passage.title"
                          label="Audio Title"
                          placeholder="Enter audio title..."
                          required
                        />

                        <SelectField
                          control={listeningForm.control}
                          name="passage.difficulty_level"
                          label="Difficulty Level"
                          placeholder="Select difficulty"
                          options={DIFFICULTY_OPTIONS}
                        />
                      </div>

                      {/* Audio Upload */}
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">Audio File *</label>
                        <div className="border-2 border-dashed border-purple-300 rounded-xl p-6">
                          {audioUrl ? (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-100 rounded-full">
                                  <Volume2 className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {audioFile ? audioFile.name : "Current audio"}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Duration: {formatTime(audioDuration)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-lg p-4 border">
                                <audio 
                                  ref={audioRef}
                                  src={audioUrl}
                                  onLoadedMetadata={() => {
                                    if (audioRef.current) {
                                      setAudioDuration(audioRef.current.duration);
                                    }
                                  }}
                                  className="w-full"
                                  controls
                                />
                              </div>
                              
                              <div className="flex items-center justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setAudioUrl("");
                                    setAudioFile(null);
                                    setAudioDuration(0);
                                    listeningForm.setValue("audio_url", undefined);
                                  }}
                                >
                                  Remove Audio
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="h-8 w-8 text-purple-600" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-lg font-medium text-gray-900">Upload Audio File</p>
                                <p className="text-gray-500">Drag and drop or click to select audio file</p>
                                <div className="text-sm text-gray-400">
                                  Supported formats: MP3, WAV, OGG (Max: 50MB)
                                </div>
                              </div>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioUpload}
                                className="mt-4 block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-purple-50 file:text-purple-700
                                  hover:file:bg-purple-100 transition-colors"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Audio Transcript */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Audio Transcript</label>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Words: {wordCount}</span>
                          </div>
                        </div>
                        <TextField
                          control={listeningForm.control}
                          name="passage.content"
                          label=""
                          placeholder="Enter the audio transcript here..."
                          required
                        />
                        <div className="text-xs text-gray-500">
                          💡 Tip: The transcript helps students follow along and serves as reference material.
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Paragraphs Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-xl">
                            <Hash className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Paragraph References
                          </h3>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addParagraph}
                          className="flex items-center space-x-2"
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
                            Create your first paragraph reference to help students navigate through the audio transcript.
                          </p>
                          <Button
                            type="button"
                            onClick={addParagraph}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Paragraph
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {paragraphs.map((paragraph, index) => (
                            <div key={paragraph.id} className="relative group">
                              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                                {/* Paragraph Header */}
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                                      {paragraph.label}
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
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-2">
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
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                      placeholder="A"
                                    />
                                  </div>

                                  <div className="md:col-span-10">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-2">
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
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                                      placeholder="Enter paragraph content..."
                                    />
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
                            {listeningForm.watch("time_limit")} min
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Audio Duration:</span>
                          <span className="font-medium">
                            {formatTime(audioDuration)}
                          </span>
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
                          <p>• Average listening speed: ~150 words/min</p>
                          <p>• Audio should be clear and well-paced</p>
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
                          {listeningForm.watch("title") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Exercise title</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {listeningForm.watch("passage.title") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Audio title</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {(audioFile || audioUrl) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Audio file</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {wordCount >= 5 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Transcript content ({wordCount}/5+ words)</span>
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
                          className="w-full flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                          disabled={isSubmitting || paragraphs.length === 0 || wordCount < 5 || (!audioFile && !audioUrl)}
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

export default ListeningForm;