// Hooks for managing questions in one file
import {
  createQuestion,
  getQuestion,
  updateQuestion,
  uploadQuestionAudio,
  uploadQuestionImage,
} from "@/api/question";
import { getQuestionGroups } from "@/api/questionGroup";
import { IQuestionCreate, IQuestionUpdate } from "@/interface/question";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// --- Query Hooks ---
// Query for existing question (edit mode)
export const useQuestionQuery = (questionId: string | null) =>
  useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestion(questionId!),
    enabled: !!questionId,
  });

// Query for question groups of an exercise
export const useQuestionGroupsQuery = (exerciseId: string) =>
  useQuery({
    queryKey: ["questionGroups", exerciseId],
    queryFn: () => getQuestionGroups(exerciseId),
    enabled: !!exerciseId,
  });

// --- Mutation Hooks ---
// Create a new question
export const useCreateQuestionMutation = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
} = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IQuestionCreate) => createQuestion(data),
    onSuccess: async (response) => {
      toast.success("Question created successfully! 🎉");
      qc.invalidateQueries({ queryKey: ["questions"] });

      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create question"
      );

      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};

// Update an existing question
export const useUpdateQuestionMutation = (
  questionId: string,
  {
    onSuccess: onSuccessProp,
    onError: onErrorProp,
  }: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  } = {}
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IQuestionUpdate }) =>
      updateQuestion(id, data),
    onSuccess: async (response) => {
      toast.success("Question updated successfully! ✅");
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["question", questionId] });

      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update question"
      );
      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};

// Upload question image
export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      uploadQuestionImage(id, formData),
  });
};

// Upload question audio
export const useUploadAudioMutation = () => {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      uploadQuestionAudio(id, formData),
  });
};
