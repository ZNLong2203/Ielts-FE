"use client";

import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";
import { useTextHighlight } from "@/hooks/useTextHighlight";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState, useRef } from "react";
import React from "react";

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

function ParagraphWithHighlight({
  paragraph,
  paragraphId,
  onHighlightChange,
  onClearRef,
}: {
  paragraph: Paragraph;
  paragraphId: string;
  onHighlightChange: (hasHighlights: boolean) => void;
  onClearRef: (clearFn: () => void) => void;
}) {
  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } =
    useTextHighlight(paragraphId);

  React.useEffect(() => {
    onHighlightChange(highlights.length > 0);
  }, [highlights.length, onHighlightChange]);

  React.useEffect(() => {
    onClearRef(clearAllHighlights);
  }, [clearAllHighlights, onClearRef]);

  return (
    <div
      id={paragraphId}
      onMouseUp={toggleHighlight}
      className="flex-1 bg-white rounded-lg p-4 border border-blue-200 cursor-text select-text"
    >
      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
        {renderHighlightedText(paragraph.content)}
      </p>
    </div>
  );
}

export default function ReadingPassageWithParagraphs({
  passageId,
  passageTitle,
  passageContent,
  paragraphs,
  onPin,
  isPinned,
}: ReadingPassageWithParagraphsProps) {
  const hasParagraphs = paragraphs && paragraphs.length > 0;

  const [paragraphsWithHighlights, setParagraphsWithHighlights] = useState<Set<string>>(new Set());
  
  const paragraphClearFunctionsRef = useRef<Map<string, () => void>>(new Map());

  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } =
    useTextHighlight(passageId);

  const totalHighlights = useMemo(() => {
    if (!hasParagraphs) return highlights.length;
    return paragraphsWithHighlights.size;
  }, [highlights.length, hasParagraphs, paragraphsWithHighlights.size]);

  const handleClearAllHighlights = () => {
    if (hasParagraphs) {
      paragraphClearFunctionsRef.current.forEach((clearFn) => {
        clearFn();
      });
      setParagraphsWithHighlights(new Set());
    } else {
      clearAllHighlights();
    }
  };

  const handleParagraphHighlightChange = (paragraphId: string, hasHighlights: boolean) => {
    setParagraphsWithHighlights((prev) => {
      const next = new Set(prev);
      if (hasHighlights) {
        next.add(paragraphId);
      } else {
        next.delete(paragraphId);
      }
      return next;
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">
          {passageTitle || "Reading Passage"}
        </h3>
        <div className="flex items-center gap-2">
          {totalHighlights > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllHighlights}
              className="text-xs"
            >
              Clear Highlights ({totalHighlights})
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
          {paragraphs.map((paragraph) => {
            const paragraphId = `${passageId}-paragraph-${paragraph.id}`;
            return (
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
                    <ParagraphWithHighlight
                      paragraph={paragraph}
                      paragraphId={paragraphId}
                      onHighlightChange={(hasHighlights) =>
                        handleParagraphHighlightChange(paragraphId, hasHighlights)
                      }
                      onClearRef={(clearFn) => {
                        paragraphClearFunctionsRef.current.set(paragraphId, clearFn);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

