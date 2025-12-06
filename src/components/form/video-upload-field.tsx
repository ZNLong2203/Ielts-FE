"use client";
import React, { useState, useCallback } from "react";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Film,
  Eye,
  CheckCircle2,
  Video,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { uploadVideo } from "@/api/lesson";
import VideoPlayer from "@/components/modal/video-player";
import { cn } from "@/lib/utils";

interface VideoUploadSectionProps {
  lessonId?: string;
  sectionId: string;
  currentHlsUrl?: string;
  onUploadSuccess?: (videoData: any) => void;
  onUploadError?: (error: string) => void;
  onVideoSelect?: (file: File | null) => void; // ✅ Add callback for file selection
  selectedVideoFile?: File | null; // ✅ Add prop for externally selected file
  className?: string;
}

interface UploadedVideoData {
  hlsUrl?: string;
  duration?: number;
  thumbnail?: string;
  [key: string]: any;
}

const VideoUploadSection = ({
  lessonId,
  sectionId,
  currentHlsUrl,
  onUploadSuccess,
  onUploadError,
  onVideoSelect, 
  selectedVideoFile, 
  className = "",
}: VideoUploadSectionProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideoData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null); 
  const [previewUrl, setPreviewUrl] = useState<string>(""); 
  const queryClient = useQueryClient();

  const currentVideoFile = selectedVideoFile || localVideoFile;

  // Upload video mutation (only when lessonId exists)
  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!lessonId) {
        throw new Error("Lesson ID is required for video upload");
      }
      
      console.log("🎬 Starting video upload:", {
        lessonId,
        sectionId,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
      
      return uploadVideo(lessonId, sectionId, file);
    },
    onMutate: () => {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);
    },
    onSuccess: (data) => {
      console.log("✅ Video upload successful:", data);
      
      const videoData: UploadedVideoData = {
        videoUrl: data.videoUrl || data.video_url,
        hlsUrl: data.hlsUrl || data.hls_url,
        duration: data.duration,
        thumbnail: data.thumbnail,
        ...data,
      };
      
      setUploadedVideo(videoData);
      setUploadProgress(100);
      setIsUploading(false);
      
      // ✅ Clear selected file after successful upload
      setLocalVideoFile(null);
      setPreviewUrl("");
      onVideoSelect?.(null);
      
      toast.success("Video uploaded and processed successfully! 🎉");
      onUploadSuccess?.(videoData);
    },
    onError: (error: any) => {
      console.error("❌ Video upload error:", error);
      
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to upload video";
      setUploadError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      
      if (lessonId) {
        queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      }
      
      toast.error(`Upload failed: ${errorMessage}`);
      onUploadError?.(errorMessage);
    },
  });

  // ✅ Handle file drop/selection
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const error = rejection.errors[0];
        
        let errorMessage = "Invalid file";
        if (error.code === "file-too-large") {
          errorMessage = "File size must be less than 2GB";
        } else if (error.code === "file-invalid-type") {
          errorMessage = "Please select a valid video file";
        }
        
        setUploadError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      // Additional validation
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        const errorMessage = "File size must be less than 2GB";
        setUploadError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Validate file type more strictly
      const allowedTypes = [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/quicktime',
        'video/wmv',
        'video/flv',
        'video/webm'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.type.startsWith("video/")) {
        const errorMessage = "Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WebM)";
        setUploadError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // ✅ Store file and create preview
      setLocalVideoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // ✅ Notify parent component
      onVideoSelect?.(file);
      
      setUploadError(null);
      
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (lessonId) {
        // ✅ If lesson exists, upload immediately
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 85) {
              clearInterval(progressInterval);
              return 85;
            }
            return prev + Math.random() * 15;
          });
        }, 800);

        uploadVideoMutation.mutate(file);
        
        return () => clearInterval(progressInterval);
      } else {
        // ✅ If no lesson yet, just show selection message
        toast.success(`Video file "${file.name}" selected! It will be uploaded when you create the lesson.`);
      }
    },
    [lessonId, sectionId, uploadVideoMutation, onVideoSelect]
  );

  // ✅ Upload selected video (for immediate upload when lessonId becomes available)
  const uploadSelectedVideo = () => {
    if (currentVideoFile && lessonId) {
      uploadVideoMutation.mutate(currentVideoFile);
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"],
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    disabled: isUploading,
    multiple: false,
  });

  // ✅ Determine video URL to display
  const displayHlsUrl = uploadedVideo?.hlsUrl || currentHlsUrl;
  const hasVideo = !!(displayHlsUrl || previewUrl || currentVideoFile);

  // ✅ Get upload status for UI
  const getUploadStatusInfo = () => {
    if (currentVideoFile && !lessonId) {
      return {
        type: "selected" as const,
        title: "Video file selected",
        description: `"${currentVideoFile.name}" will be uploaded when lesson is created`,
        showHlsBadge: false,
      };
    }

    if (uploadedVideo) {
      return {
        type: "success" as const,
        title: "Video uploaded successfully!",
        description: uploadedVideo.hlsUrl
          ? "Video is processed and ready for streaming"
          : "Video is ready for playback",
        showHlsBadge: !!uploadedVideo.hlsUrl,
      };
    }
    
    if (currentHlsUrl) {
      return {
        type: "current" as const,
        title: "Current video available",
        description: "Upload a new video to replace the current one",
        showHlsBadge: !!currentHlsUrl,
      };
    }
    
    return null;
  };

  const statusInfo = getUploadStatusInfo();

  // ✅ Cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <FormLabel className="flex items-center space-x-2">
          <Film className="h-4 w-4" />
          <span>Video Content</span>
        </FormLabel>
        {hasVideo && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={cn(
              "text-green-700",
              currentVideoFile && !lessonId ? "bg-yellow-50" : "bg-green-50"
            )}>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {currentVideoFile && !lessonId ? "File Selected" : "Video Available"}
            </Badge>
            {statusInfo?.showHlsBadge && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                HLS Ready
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              {showPreview ? "Hide Preview" : "Preview Video"}
            </Button>
            {/* ✅ Upload now button (only show when file selected but lesson exists) */}
            {currentVideoFile && lessonId && !uploadedVideo && (
              <Button
                variant="outline"
                size="sm"
                onClick={uploadSelectedVideo}
                disabled={isUploading}
                className="text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Now
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Video Preview */}
      {showPreview && hasVideo && (
        <div className="mb-4">
          {previewUrl ? (
            // ✅ Preview selected file (not uploaded yet)
            <div className="relative">
              <video 
                src={previewUrl} 
                controls 
                className="w-full max-h-64 rounded-lg"
              />
              {currentVideoFile && !lessonId && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Preview - Will Upload Later
                  </Badge>
                </div>
              )}
            </div>
          ) : displayHlsUrl ? (
            // ✅ HLS player for uploaded video
            <VideoPlayer
              hlsUrl={displayHlsUrl}
              title="Video Preview"
              description="Preview of the uploaded video"
              isPreview={true}
              onProgress={(current, total) => {
                console.log(`Preview progress: ${Math.round((current/total)*100)}%`);
              }}
              className="rounded-lg overflow-hidden"
            />
          ) : null}
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "p-6 border-2 border-dashed rounded-lg transition-all cursor-pointer",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : uploadError
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          isUploading && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isUploading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-3 text-blue-600 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">
              {isUploading
                ? "Processing video..."
                : isDragActive
                ? "Drop the video here"
                : hasVideo
                ? "Upload a new video to replace current one"
                : "Drag & drop a video file here"}
            </p>
            <p className="text-xs text-gray-500">
              {isUploading
                ? "Please wait while we process and optimize your video"
                : "or click to browse (max 2GB)"}
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV
            </p>
            {!lessonId && (
              <p className="text-xs text-blue-600 bg-blue-50 p-1 rounded">
                💡 You can select a video now, it will be uploaded when you create the lesson
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center space-x-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Uploading and processing...</span>
            </span>
            <span className="font-medium text-blue-600">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500">
            Your video is being uploaded and optimized for streaming
          </p>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Upload Error</p>
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Status Display */}
      {statusInfo && (
        <div className={cn(
          "flex items-start space-x-2 p-3 border rounded-lg",
          statusInfo.type === "success" 
            ? "bg-green-50 border-green-200"
            : statusInfo.type === "selected"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-blue-50 border-blue-200"
        )}>
          {statusInfo.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          ) : statusInfo.type === "selected" ? (
            <Upload className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Video className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              statusInfo.type === "success" 
                ? "text-green-900"
                : statusInfo.type === "selected"
                ? "text-yellow-900"
                : "text-blue-900"
            )}>
              {statusInfo.title}
            </p>
            <p className={cn(
              "text-xs",
              statusInfo.type === "success" 
                ? "text-green-700"
                : statusInfo.type === "selected"
                ? "text-yellow-700"
                : "text-blue-700"
            )}>
              {statusInfo.description}
            </p>
            {currentVideoFile && (
              <p className="text-xs text-gray-600 mt-1">
                File: {currentVideoFile.name} ({(currentVideoFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            {uploadedVideo?.duration && (
              <p className="text-xs text-gray-600 mt-1">
                Duration: {Math.round(uploadedVideo.duration / 60)} minutes
              </p>
            )}
          </div>
        </div>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{file.name}: {errors[0].message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoUploadSection;