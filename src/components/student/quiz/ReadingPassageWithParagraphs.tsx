"use client";

import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";
import { useTextHighlight } from "@/hooks/useTextHighlight";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface Paragraph {
  id: string;
  label: string;
  content: string;
}

interface ReadingPassageWithParagraphsProps {
  passageId: string;
  passageTitle?: string;
  passageContent?: string;
  paragraphs?: Paragraph[];
  onPin: () => void;
  isPinned: boolean;
}

export default function ReadingPassageWithParagraphs({
  passageId,
  passageTitle,
  passageContent,
  paragraphs,
  onPin,
  isPinned,
}: ReadingPassageWithParagraphsProps) {
  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } =
    useTextHighlight(passageId);

  // If paragraphs exist, use them; otherwise use passageContent
  const hasParagraphs = paragraphs && paragraphs.length > 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">
          {passageTitle || "Reading Passage"}
        </h3>
        <div className="flex items-center gap-2">
          {highlights.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllHighlights}
              className="text-xs"
            >
              Clear Highlights ({highlights.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onPin}
            className={cn(
              "text-xs",
              isPinned ? "bg-blue-600 text-white hover:bg-blue-700" : ""
            )}
          >
            {isPinned ? (
              <>
                <PinOff className="h-3 w-3 mr-1" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-3 w-3 mr-1" />
                Pin
              </>
            )}
          </Button>
        </div>
      </div>

      {hasParagraphs ? (
        // Display paragraphs with labels
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <Card
              key={paragraph.id}
              className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Paragraph Label */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      {paragraph.label}
                    </div>
                  </div>
                  {/* Paragraph Content */}
                  <div
                    id={`${passageId}-paragraph-${paragraph.id}`}
                    onMouseUp={toggleHighlight}
                    className="flex-1 bg-white rounded-lg p-4 border border-blue-200 cursor-text select-text"
                  >
                    <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                      {renderHighlightedText(paragraph.content)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-gray-500 mt-2 italic">
            💡 Tip: Select text to highlight important information
          </p>
        </div>
      ) : (
        // Fallback to single passage content
        <div
          id={passageId}
          onMouseUp={toggleHighlight}
          className="bg-white rounded-lg p-6 border border-blue-200 cursor-text select-text"
        >
          <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            {renderHighlightedText(passageContent || "")}
          </p>
          <p className="text-xs text-gray-500 mt-2 italic">
            💡 Tip: Select text to highlight important information
          </p>
        </div>
      )}
    </div>
  );
}

