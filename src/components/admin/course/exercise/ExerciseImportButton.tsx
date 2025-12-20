"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import toast from "react-hot-toast";
import {
  importExerciseFromJson,
  parseJsonFile,
  validateJsonExercise,
  EXAMPLE_JSON,
} from "@/utils/exerciseImport";
import { useQueryClient } from "@tanstack/react-query";

interface ExerciseImportButtonProps {
  lessonId: string;
  sectionId?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function ExerciseImportButton({
  lessonId,
  sectionId,
  onSuccess,
  className = "",
}: ExerciseImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".json")) {
      toast.error("Please select a JSON file");
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await file.text();
      const jsonData = parseJsonFile(fileContent);

      if (!jsonData) {
        toast.error("Failed to parse JSON file. Please check the file format.");
        setIsImporting(false);
        return;
      }

      // Validate structure
      const validation = validateJsonExercise(jsonData);
      if (!validation.valid) {
        toast.error(
          `Invalid JSON format:\n${validation.errors.slice(0, 3).join("\n")}${
            validation.errors.length > 3 ? `\n...and ${validation.errors.length - 3} more errors` : ""
          }`,
          { duration: 6000 }
        );
        setIsImporting(false);
        return;
      }

      // Import exercise
      const result = await importExerciseFromJson(lessonId, jsonData);

      if (result.success) {
        toast.success(
          `Exercise imported successfully! Created ${result.createdQuestions} question(s).`,
          { duration: 4000 }
        );

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["exercises", lessonId] });
        if (sectionId) {
          queryClient.invalidateQueries({ queryKey: ["lesson", sectionId, lessonId] });
          queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        onSuccess?.();
      } else {
        const errorMsg = result.errors.length > 0
          ? result.errors.slice(0, 3).join("\n")
          : "Unknown error occurred";
        
        toast.error(
          `Import failed:\n${errorMsg}${result.errors.length > 3 ? `\n...and ${result.errors.length - 3} more errors` : ""}`,
          { duration: 6000 }
        );

        if (result.warnings.length > 0) {
          toast.error(result.warnings.join("\n"), { duration: 5000 });
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Import error:", error);
      toast.error(`Failed to import exercise: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadExample = () => {
    const jsonString = JSON.stringify(EXAMPLE_JSON, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "exercise-import-example.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Example JSON file downloaded!");
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isImporting}
      />
      
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          variant="default"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          {isImporting ? "Importing..." : "Import from JSON"}
        </Button>

        {isImporting && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Importing exercise...</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleDownloadExample}
        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 self-start"
        title="Download example JSON template"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Download JSON template</span>
      </button>
    </div>
  );
}

