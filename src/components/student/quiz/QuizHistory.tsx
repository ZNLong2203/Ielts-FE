"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  Clock,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  Eye,
  ExternalLink,
} from "lucide-react";
import { getUserTestHistory } from "@/api/mockTest";
import { ITestResult } from "@/interface/mockTest";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface QuizHistoryProps {
  mockTestId: string;
  mockTestTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({
  mockTestId,
  mockTestTitle,
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const { data: historyData, isLoading, isError } = useQuery({
    queryKey: ["testHistory", mockTestId],
    queryFn: () => getUserTestHistory({ mock_test_id: mockTestId, limit: 50 }),
    enabled: isOpen && !!mockTestId,
    staleTime: 2 * 60 * 1000,
  });

  const historyItems: ITestResult[] = historyData?.result || [];

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  };

  const formatTime = (seconds?: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getBandScoreColor = (score?: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 7) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getBandScoreBadgeVariant = (score?: number | null) => {
    if (!score) return "outline";
    if (score >= 7) return "default";
    if (score >= 6) return "default";
    return "secondary";
  };

  const handleViewDetail = (resultId: string) => {
    // Redirect to results page with quizId and resultId
    router.push(`/student/dashboard/my-quizzes/${mockTestId}/results?resultId=${resultId}`);
    onClose(); // Close the history dialog
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <History className="h-6 w-6 text-blue-600" />
              Test History
            </DialogTitle>
            <DialogDescription className="text-base">
              {mockTestTitle}
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-gray-600">Failed to load test history</p>
            </div>
          )}

          {!isLoading && !isError && historyItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <History className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No test history yet
              </h3>
              <p className="text-gray-600 text-center">
                You haven't completed this test yet. Start your first attempt!
              </p>
            </div>
          )}

          {!isLoading && !isError && historyItems.length > 0 && (
            <div className="space-y-4 mt-4">
              {historyItems.map((result) => {
                const sectionResults = result.section_results || [];
                const totalCorrect = sectionResults.reduce(
                  (sum, sr) => sum + (sr.correct_answers || 0),
                  0
                );
                const totalQuestions = sectionResults.reduce(
                  (sum, sr) => sum + (sr.total_questions || 0),
                  0
                );
                const accuracy =
                  totalQuestions > 0
                    ? Math.round((totalCorrect / totalQuestions) * 100)
                    : 0;

                return (
                  <Card
                    key={result.id}
                    className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant={getBandScoreBadgeVariant(
                                result.band_score
                              )}
                              className={cn(
                                "text-sm font-semibold px-3 py-1",
                                result.band_score &&
                                  getBandScoreColor(result.band_score)
                              )}
                            >
                              {result.band_score
                                ? `Band ${result.band_score}`
                                : "Pending"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.status || "completed"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(result.created_at)}</span>
                            </div>
                            {result.time_taken && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(result.time_taken)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(result.id)}
                          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Section Results Summary */}
                      {sectionResults.length > 0 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {sectionResults.map((sr) => {
                              const sectionType =
                                sr.test_sections?.section_type || "unknown";
                              const sectionName =
                                sr.test_sections?.section_name || sectionType;
                              const sectionAccuracy =
                                sr.total_questions && sr.total_questions > 0
                                  ? Math.round(
                                      ((sr.correct_answers || 0) /
                                        sr.total_questions) *
                                        100
                                    )
                                  : 0;

                              return (
                                <div
                                  key={sr.id}
                                  className="p-3 bg-gray-50 rounded-lg border"
                                >
                                  <div className="text-xs font-medium text-gray-600 mb-1 capitalize">
                                    {sectionName}
                                  </div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-gray-900">
                                      {sr.correct_answers || 0}/
                                      {sr.total_questions || 0}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({sectionAccuracy}%)
                                    </span>
                                  </div>
                                  {sr.band_score && (
                                    <div className="text-xs text-blue-600 font-medium mt-1">
                                      Band {sr.band_score}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Overall Accuracy */}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-gray-900">
                                  Overall Accuracy
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">
                                  {totalCorrect}/{totalQuestions} correct
                                </span>
                                <Badge
                                  variant={
                                    accuracy >= 70
                                      ? "default"
                                      : accuracy >= 50
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={cn(
                                    "font-semibold",
                                    accuracy >= 70 && "bg-green-600",
                                    accuracy >= 50 &&
                                      accuracy < 70 &&
                                      "bg-yellow-600"
                                  )}
                                >
                                  {accuracy}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {sectionResults.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                          No section results available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuizHistory;
