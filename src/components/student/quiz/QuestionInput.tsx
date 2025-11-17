"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import SpeakingQuestionInput from "./SpeakingQuestionInput";

interface QuestionInputProps {
  question: {
    id: string;
    type: string;
    options?: string[];
    option_ids?: string[];
  };
  currentAnswer: string | string[] | undefined;
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  // For speaking questions
  speakingAudio?: { blob: Blob; url: string };
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAudio?: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export default function QuestionInput({
  question,
  currentAnswer,
  onAnswerChange,
  speakingAudio,
  isRecording,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onClearAudio,
  fileInputRef,
}: QuestionInputProps) {
  const baseId = `question-${question.id}`;

  switch (question.type) {
    case "multiple_choice":
      const selectedValue = Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer || "");
      return (
        <RadioGroup
          value={selectedValue}
          onValueChange={(value) => {
            onAnswerChange(question.id, value);
          }}
          className="space-y-2"
        >
          {question.options?.map((option, index) => {
            const optionValue = question.option_ids?.[index] || String(index);
            const isSelected = selectedValue === optionValue || selectedValue === String(optionValue);
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                  isSelected
                    ? "bg-blue-50 border-blue-300 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                )}
              >
                <RadioGroupItem
                  value={optionValue}
                  id={`${baseId}-opt-${index}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`${baseId}-opt-${index}`}
                  className="cursor-pointer flex-1 text-sm leading-relaxed"
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      );

    case "fill_blank":
      const fillBlankValue = Array.isArray(currentAnswer)
        ? currentAnswer.join(" ")
        : (currentAnswer as string) || "";
      return (
        <div className="space-y-2">
          <Input
            id={baseId}
            type="text"
            value={fillBlankValue}
            onChange={(e) => {
              onAnswerChange(question.id, e.target.value);
            }}
            placeholder="Type your answer here..."
            className="w-full p-3 border-2 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500">
            Enter your answer exactly as requested in the question.
          </p>
        </div>
      );

    case "true_false":
      const tfSelectedValue = Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer as string) || "";
      return (
        <RadioGroup
          value={tfSelectedValue}
          onValueChange={(value) => onAnswerChange(question.id, value)}
          className="space-y-2"
        >
          {["TRUE", "FALSE", "NOT GIVEN"].map((option) => {
            const isSelected = tfSelectedValue === option;
            return (
              <div
                key={option}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                  isSelected
                    ? "bg-blue-50 border-blue-300 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                )}
              >
                <RadioGroupItem value={option} id={`${baseId}-${option.toLowerCase()}`} />
                <Label
                  htmlFor={`${baseId}-${option.toLowerCase()}`}
                  className="cursor-pointer font-medium"
                >
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      );

    case "matching":
      const matchSelectedValue = Array.isArray(currentAnswer) ? currentAnswer[0] : (currentAnswer as string) || "";
      return (
        <RadioGroup
          value={matchSelectedValue}
          onValueChange={(value) => onAnswerChange(question.id, value)}
          className="space-y-2"
        >
          {question.options?.map((option, index) => {
            const optionValue = question.option_ids?.[index] || option;
            const isSelected = matchSelectedValue === optionValue;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                  isSelected
                    ? "bg-blue-50 border-blue-300 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                )}
              >
                <RadioGroupItem value={optionValue} id={`${baseId}-match-${index}`} />
                <Label htmlFor={`${baseId}-match-${index}`} className="cursor-pointer font-medium">
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      );

    case "essay":
      const essayText = Array.isArray(currentAnswer)
        ? currentAnswer.join(" ")
        : (currentAnswer as string) || "";
      const wordCount = (essayText.match(/\S+/g) || []).length;
      const charCount = essayText.length;

      return (
        <div className="space-y-2">
          <Textarea
            id={baseId}
            value={essayText}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder="Type your detailed answer here..."
            rows={12}
            className="w-full p-3 border-2 focus:border-blue-500 font-sans"
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Write clearly and organize your thoughts</span>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">Words: {wordCount}</span>
              <span className="text-gray-500">Characters: {charCount}</span>
            </div>
          </div>
        </div>
      );

    case "speaking":
      if (
        !onStartRecording ||
        !onStopRecording ||
        !onFileUpload ||
        !onClearAudio ||
        !fileInputRef
      ) {
        return null;
      }
      return (
        <SpeakingQuestionInput
          questionId={question.id}
          audio={speakingAudio}
          isRecording={isRecording || false}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onFileUpload={onFileUpload}
          onClearAudio={onClearAudio}
          fileInputRef={fileInputRef}
        />
      );

    default:
      return (
        <div className="space-y-2">
          <Textarea
            id={baseId}
            value={
              Array.isArray(currentAnswer)
                ? currentAnswer.join(" ")
                : (currentAnswer as string) || ""
            }
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full p-3 border-2 focus:border-blue-500"
          />
        </div>
      );
  }
}

