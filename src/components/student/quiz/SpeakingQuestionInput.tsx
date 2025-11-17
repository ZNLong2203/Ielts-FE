"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, Pause, Upload, X } from "lucide-react";

interface SpeakingQuestionInputProps {
  questionId: string;
  audio: { blob: Blob; url: string } | undefined;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAudio: () => void;
  fileInputRef: React.RefObject<HTMLInputElement> | { current: HTMLInputElement | null } | undefined;
}

export default function SpeakingQuestionInput({
  questionId,
  audio,
  isRecording,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onClearAudio,
  fileInputRef,
}: SpeakingQuestionInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={isRecording ? onStopRecording : onStartRecording}
            variant={isRecording ? "destructive" : "default"}
            className="flex-1"
          >
            {isRecording ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={() => {
              if (fileInputRef?.current) {
                fileInputRef.current.click();
              } else if (inputRef.current) {
                inputRef.current.click();
              }
            }}
            variant="outline"
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Audio
          </Button>
        </div>

        <input
          ref={(el) => {
            inputRef.current = el;
            // Also update external ref if provided
            if (fileInputRef && 'current' in fileInputRef) {
              (fileInputRef as any).current = el;
            }
          }}
          type="file"
          accept="audio/*"
          onChange={onFileUpload}
          className="hidden"
        />

        {audio && (
          <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Recorded Audio:</div>
              <Button type="button" variant="ghost" size="sm" onClick={onClearAudio}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            <audio controls src={audio.url} className="w-full" />
            <p className="text-xs text-gray-500 italic mt-2">
              💡 Your audio will be graded when you submit the section
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

