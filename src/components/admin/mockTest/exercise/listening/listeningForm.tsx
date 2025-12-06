"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import HLSAudioPlayer from "@/components/modal/hsl-audio-player";
import {
  Save,
  Headphones,
  FileText,
  ArrowRight,
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Upload,
  Volume2,
  Loader2,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import {
  getListeningExercise,
  createListeningExercise,
  updateListeningExercise,
  uploadListeningAudio,
} from "@/api/listening";
import { IListeningExerciseUpdate } from "@/interface/listening";
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
  const listeningExerciseId = Array.isArray(params.listeningId)
    ? params.listeningId[0]
    : params.listeningId;
  const testSectionId = searchParams?.get("sectionId") ?? undefined;
  const isEditing = !!listeningExerciseId;

  const title = isEditing
    ? "Update Listening Exercise"
    : "Create Listening Exercise";
  const description = isEditing
    ? "Update listening exercise information and audio content"
    : "Create a comprehensive listening comprehension exercise with audio content";

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

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

  console.log("listening Data", listeningExerciseData);

  // Form setup
  const schema = isEditing ? ListeningFormUpdateSchema : ListeningFormSchema;
  const listeningForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      test_section_id: testSectionId || "",
      time_limit: 30,
      ordering: 1,
      audio_url: undefined,
      passage: {
        title: "",
        content: "",
        difficulty_level: "3",
      },
    },
  });

  // Paragraphs are not used for listening transcript anymore

  // Audio upload mutation
  const uploadAudioMutation = useMutation({
    mutationFn: async (params: { exerciseId: string; formData: FormData }) => {
      const { exerciseId, formData } = params;
      return uploadListeningAudio(exerciseId, formData);
    },
    onSuccess: (response) => {
      toast.success("Audio uploaded successfully! 🎵");
      setIsUploadingAudio(false);
      if (response?.data?.audio_url) {
        setAudioUrl(response.data.audio_url);
        listeningForm.setValue("audio_url", response.data.audio_url);
      }
      setAudioFile(null);
      if (listeningExerciseId) {
        refetch();
      }
    },
    onError: (error: unknown) => {
      console.error("Audio upload error:", error);
      setIsUploadingAudio(false);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to upload audio";
      toast.error(message);
    },
  });

  // Main mutations
  const createListeningExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ListeningFormSchema>) => {
      const payload = {
        ...formData,
        audio_url: undefined,
        passage: {
          ...formData.passage,
          content: formData.passage?.content ?? "",
        },
        // Use default passing_score for mock tests (not used in IELTS mode)
        passing_score: "0",
      };
      return createListeningExercise(payload);
    },
    onSuccess: async (response) => {
      if (audioFile && response?.id) {
        setIsUploadingAudio(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioFile);
          await uploadAudioMutation.mutateAsync({
            exerciseId: response.id,
            formData,
          });
          toast.success(
            "Listening exercise created and audio uploaded successfully! 🎧"
          );
        } catch (error) {
          toast.error(
            "Exercise created but audio upload failed. You can upload audio later from the edit page."
          );
        }
      } else {
        toast.success("Listening exercise created successfully! 🎧");
      }

      queryClient.invalidateQueries({ queryKey: ["listeningExercises"] });
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`
      );
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create listening exercise";
      toast.error(message);
    },
  });

  const updateListeningExerciseMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ListeningFormUpdateSchema>) => {
      const payload: IListeningExerciseUpdate = {
        title: formData.title || "",
        time_limit: formData.time_limit ?? 30,
        ordering: formData.ordering ?? 1,
        audio_url: formData.audio_url,
        passage: {
          title: formData.passage?.title || "",
          content: formData.passage?.content || "",
          difficulty_level: formData.passage?.difficulty_level || "3",
        },
      };
      return updateListeningExercise(listeningExerciseId!, payload);
    },
    onSuccess: async () => {
      if (audioFile && listeningExerciseId) {
        setIsUploadingAudio(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioFile);
          await uploadAudioMutation.mutateAsync({
            exerciseId: listeningExerciseId,
            formData,
          });
          toast.success(
            "Listening exercise updated and audio uploaded successfully! 🎧"
          );
        } catch (error) {
          toast.error(
            "Exercise updated but audio upload failed. Please try uploading audio again."
          );
        }
      } else {
        toast.success("Listening exercise updated successfully! 🎧");
      }

      queryClient.invalidateQueries({ queryKey: ["listeningExercises"] });
      queryClient.invalidateQueries({
        queryKey: ["listeningExercise", listeningExerciseId],
      });
      router.push(
        `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`
      );
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update listening exercise";
      toast.error(message);
    },
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Word count is no longer required for listening transcript.
  // Keep state only for optional display if content is provided.

  // Audio handling
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(
        `Audio file is too large (${fileSizeMB}MB). Maximum size is 10MB.`
      );
      event.target.value = "";
      return;
    }

    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp3",
      "audio/m4a",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid audio format. Please use MP3, WAV, OGG, or M4A.");
      event.target.value = "";
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setAudioDuration(Math.round(audio.duration));
    };

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const message = isEditing
      ? `Audio file selected (${fileSizeMB}MB). It will be uploaded when you save the exercise.`
      : `Audio file selected (${fileSizeMB}MB). It will be uploaded after creating the exercise.`;
    toast.success(message);
  };

  const handleUploadAudioOnly = async (event: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering other buttons
    event.preventDefault();
    event.stopPropagation();

    if (!audioFile || !listeningExerciseId) {
      toast.error("Please select an audio file first.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      const fileSizeMB = (audioFile.size / (1024 * 1024)).toFixed(2);
      toast.error(
        `Audio file is too large (${fileSizeMB}MB). Maximum size is 10MB.`
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", audioFile);

    try {
      setIsUploadingAudio(true);
      await uploadAudioMutation.mutateAsync({
        exerciseId: listeningExerciseId,
        formData,
      });
    } catch (error) {
      console.error("Failed to upload audio:", error);
    }
  };

  const triggerFileInput = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.addEventListener("change", (e) =>
      handleAudioUpload(e as unknown as React.ChangeEvent<HTMLInputElement>)
    );
    input.click();
  };

  const removeAudio = () => {
    setAudioUrl("");
    setAudioFile(null);
    setAudioDuration(0);
    listeningForm.setValue("audio_url", undefined);
  };

  const cancelNewAudio = () => {
    setAudioFile(null);
    if (isEditing && listeningExerciseData?.audio_url) {
      const originalUrl =
        typeof listeningExerciseData.audio_url === "string"
          ? listeningExerciseData.audio_url
          : "";
      setAudioUrl(originalUrl);
    } else {
      setAudioUrl("");
    }
  };

  // Load existing data
  useEffect(() => {
    if (listeningExerciseData && isEditing) {
      listeningForm.reset({
        title: listeningExerciseData.title || "",
        test_section_id: testSectionId || "",
        time_limit: listeningExerciseData.time_limit || 30,
        ordering: listeningExerciseData.ordering || 1,
        audio_url: listeningExerciseData.audio_url,
        passage: {
          title: listeningExerciseData.reading_passage?.title || "",
          content: listeningExerciseData.reading_passage?.content || "",
          difficulty_level:
            listeningExerciseData.reading_passage?.difficulty_level?.toString() ||
            "3",
        },
      });

      if (
        listeningExerciseData.audio_url &&
        typeof listeningExerciseData.audio_url === "string"
      ) {
        setAudioUrl(listeningExerciseData.audio_url);
      }
    }
  }, [listeningExerciseData, isEditing, listeningForm, testSectionId]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      if (isEditing) {
        await updateListeningExerciseMutation.mutateAsync(
          data as z.infer<typeof ListeningFormUpdateSchema>
        );
      } else {
        await createListeningExerciseMutation.mutateAsync(
          data as z.infer<typeof ListeningFormSchema>
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isSubmitting =
    createListeningExerciseMutation.isPending ||
    updateListeningExerciseMutation.isPending ||
    isUploadingAudio;
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
        onDismiss={() =>
          router.push(
            `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`
          )
        }
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
                onClick={() =>
                  router.push(
                    `${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}${ROUTES.ADMIN_LISTENING}?sectionId=${testSectionId}`
                  )
                }
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
                  <span>
                    {listeningForm.watch("title") || "Untitled Exercise"}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{listeningForm.watch("time_limit")} min</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-purple-600" />
                    <span>
                      {listeningForm.watch("passage.title") || "Untitled Audio"}
                    </span>
                  </h3>

                  {audioUrl && (
                    <div className="mb-6">
                      <HLSAudioPlayer
                        src={audioUrl}
                        title={
                          listeningForm.watch("passage.title") ||
                          "Listening Exercise Audio"
                        }
                      />
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
                    <span>Duration: {formatTime(audioDuration)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Edit Mode
          <Form {...listeningForm}>
            <form
              onSubmit={listeningForm.handleSubmit(onSubmit)}
              className="space-y-8"
            >
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          name="ordering"
                          label="Order"
                          type="number"
                          placeholder="1"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                {/* Audio Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Headphones className="h-5 w-5 text-purple-600" />
                        <span>Audio Information</span>
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
                       <TextField
                          control={listeningForm.control}
                          name="passage.content"
                          label="Content"
                          placeholder="Enter content..."
                        />

                      {/* Current Audio - Fixed Layout to prevent button overlap */}
                      {audioUrl && (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">
                                Current Audio
                              </label>
                              {audioFile && (
                                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                  ⚠️ New audio selected - will replace current
                                  when saved
                                </div>
                              )}
                            </div>

                            {/* Upload Audio Now Button - Positioned ABOVE audio player */}
                            { audioFile && !isUploadingAudio && (
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleUploadAudioOnly}
                                  disabled={uploadAudioMutation.isPending}
                                  className="whitespace-nowrap z-10 relative"
                                  style={{ pointerEvents: "auto" }}
                                >
                                  {uploadAudioMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Audio Now
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Audio Player Container - Separate and isolated */}
                          <HLSAudioPlayer
                            src={audioUrl}
                            title={
                              listeningForm.watch("passage.title") ||
                              "Listening Exercise Audio"
                            }
                          />
                        </div>
                      )}

                      {/* Audio Upload Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            {audioUrl ? "Replace Audio File" : "Audio File"}
                          </label>
                        </div>

                        {(!audioUrl || audioFile) && (
                          <div className="border-2 border-dashed border-purple-300 rounded-xl p-6">
                            {audioFile ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                  <div className="p-3 bg-purple-100 rounded-full">
                                    <Volume2 className="h-6 w-6 text-purple-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      New: {audioFile.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Size:{" "}
                                      {(audioFile.size / (1024 * 1024)).toFixed(
                                        2
                                      )}
                                      MB
                                    </div>
                                    <div className="text-xs text-amber-600 mt-1">
                                      ⚠️{" "}
                                      {isEditing
                                        ? "New audio will be uploaded when you save or use 'Upload Audio Now' button"
                                        : "Audio will be uploaded after creating the exercise"}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border">
                                  <audio
                                    src={URL.createObjectURL(audioFile)}
                                    onLoadedMetadata={(e) => {
                                      const audio =
                                        e.target as HTMLAudioElement;
                                      setAudioDuration(audio.duration);
                                    }}
                                    className="w-full"
                                    controls
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-gray-500">
                                    Preview of new audio file
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelNewAudio}
                                  >
                                    Cancel New Audio
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                  <Upload className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-lg font-medium text-gray-900">
                                    {audioUrl
                                      ? "Replace Audio File"
                                      : "Upload Audio File"}
                                  </p>
                                  <p className="text-gray-500">
                                    Drag and drop or click to select audio file
                                  </p>
                                  <div className="text-sm text-gray-400">
                                    Supported formats: MP3, WAV, OGG, M4A (Max:
                                    10MB)
                                  </div>
                                  <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                                    ⚠️ File size limit: 10MB. Larger files will
                                    be rejected.
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
                        )}

                        {isUploadingAudio && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Uploading audio file...</span>
                          </div>
                        )}

                        {audioUrl && !audioFile && (
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={triggerFileInput}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Replace Audio
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={removeAudio}
                            >
                              Remove Audio
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Transcript input removed as per requirement */}
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
                          <span className="font-medium">
                            {DIFFICULTY_OPTIONS.find(
                              (opt) =>
                                Number(opt.value) === Number(selectedDifficulty)
                            )?.label || "Intermediate"}
                          </span>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-xs text-gray-500">
                          <p>• Average listening speed: ~150 words/min</p>
                          <p>• Audio should be clear and well-paced</p>
                          <p>• Maximum file size: 10MB</p>
                          {audioFile && (
                            <p className="text-amber-600">
                              • Audio will be uploaded on save (
                              {(audioFile.size / (1024 * 1024)).toFixed(2)}MB)
                            </p>
                          )}
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
                          {audioFile || audioUrl ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                          <span>
                            Audio file {!audioFile && !audioUrl && "(optional)"}
                          </span>
                        </div>

                        {/* Transcript validation removed */}
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
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>
                                {isUploadingAudio
                                  ? "Uploading audio..."
                                  : isEditing
                                  ? "Updating..."
                                  : "Creating..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>
                                {isEditing
                                  ? "Update Exercise"
                                  : "Create Exercise"}
                              </span>
                            </>
                          )}
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
