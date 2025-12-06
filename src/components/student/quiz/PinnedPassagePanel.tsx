"use client";

import { Button } from "@/components/ui/button";
import { PinOff } from "lucide-react";
import PassageWithHighlight from "./PassageWithHighlight";
import ReadingPassageWithParagraphs from "./ReadingPassageWithParagraphs";

interface PinnedPassagePanelProps {
  pinnedPassageId: string | null;
  pinnedImageUrl: string | null;
  currentSection: {
    question_groups: Array<{
      id: string;
      passage_reference?: string;
    }>;
  };
  currentExercise: {
    id: string;
    passage?: string;
    passageTitle?: string;
    paragraphs?: Array<{
      id: string;
      label: string;
      content: string;
    }>;
  } | null;
  onUnpin: () => void;
}

export default function PinnedPassagePanel({
  pinnedPassageId,
  pinnedImageUrl,
  currentSection,
  currentExercise,
  onUnpin,
}: PinnedPassagePanelProps) {
  if (!pinnedPassageId && !pinnedImageUrl) return null;

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="w-full p-6">
        <div className="sticky top-0 bg-white pb-4 mb-4 border-b border-gray-200 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-800">Pinned Reference</h3>
          <Button variant="ghost" size="sm" onClick={onUnpin} className="text-xs">
            <PinOff className="h-3 w-3 mr-1" />
            Unpin All
          </Button>
        </div>

        {/* Pinned Passage from Exercise */}
        {pinnedPassageId && currentExercise && pinnedPassageId.startsWith('exercise-passage-') && (
          currentExercise.paragraphs && currentExercise.paragraphs.length > 0 ? (
            <div className="mb-6">
              <ReadingPassageWithParagraphs
                passageId={pinnedPassageId}
                passageTitle={currentExercise.passageTitle}
                passageContent={currentExercise.passage}
                paragraphs={currentExercise.paragraphs}
                onPin={onUnpin}
                isPinned={true}
              />
            </div>
          ) : currentExercise.passage ? (
            <div className="mb-6">
              <PassageWithHighlight
                passageId={pinnedPassageId}
                passageText={currentExercise.passage}
                onPin={onUnpin}
                isPinned={true}
              />
            </div>
          ) : null
        )}

        {/* Pinned Passage from Question Group (backward compatibility) */}
        {pinnedPassageId && !pinnedPassageId.startsWith('exercise-passage-') && (() => {
          const pinnedGroup = currentSection.question_groups.find(
            (g) => `passage-${g.id}` === pinnedPassageId
          );
          if (!pinnedGroup?.passage_reference) return null;
          return (
            <div className="mb-6">
              <PassageWithHighlight
                passageId={pinnedPassageId}
                passageText={pinnedGroup.passage_reference}
                onPin={onUnpin}
                isPinned={true}
              />
            </div>
          );
        })()}

        {/* Pinned Image */}
        {pinnedImageUrl && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Reference Image
            </h4>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={pinnedImageUrl}
                alt="Pinned reference"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

