"use client";

import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";
import { useTextHighlight } from "@/hooks/useTextHighlight";
import { cn } from "@/lib/utils";

interface PassageWithHighlightProps {
  passageId: string;
  passageText: string;
  onPin: () => void;
  isPinned: boolean;
}

export default function PassageWithHighlight({
  passageId,
  passageText,
  onPin,
  isPinned,
}: PassageWithHighlightProps) {
  const { highlights, toggleHighlight, clearAllHighlights, renderHighlightedText } =
    useTextHighlight(passageId);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">Reading Passage</h3>
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
      <div
        id={passageId}
        onMouseUp={toggleHighlight}
        className="bg-white rounded-lg p-6 border border-blue-200 cursor-text select-text"
      >
        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
          {renderHighlightedText(passageText)}
        </p>
        <p className="text-xs text-gray-500 mt-2 italic">
          💡 Tip: Select text to highlight important information
        </p>
      </div>
    </div>
  );
}

