"use client";

import { Button } from "@/components/ui/button";
import { useTextHighlight } from "@/hooks/useTextHighlight";

interface QuestionTextWithHighlightProps {
  questionId: string;
  questionText: string;
}

export default function QuestionTextWithHighlight({
  questionId,
  questionText,
}: QuestionTextWithHighlightProps) {
  const questionTextId = `question-text-${questionId}`;
  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } =
    useTextHighlight(questionTextId);

  return (
    <div className="flex-1">
      <div className="relative group">
        <div
          id={questionTextId}
          onMouseUp={toggleHighlight}
          className="text-gray-900 font-medium cursor-text select-text pr-8"
        >
          {renderHighlightedText(questionText)}
        </div>
        {highlights.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllHighlights}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 px-2"
            title={`Clear ${highlights.length} highlight${highlights.length > 1 ? "s" : ""}`}
          >
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}

