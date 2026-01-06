"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getPendingSpeakingSubmissions, getGradedSpeakingSubmissions, PendingSpeakingSubmission, GradedSpeakingSubmission } from "@/api/mockTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Clock, User, BookOpen, ArrowRight, CheckCircle, Eye } from "lucide-react";
import { format } from "date-fns";

const SpeakingGradingPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "graded">("pending");
  const [pendingPage, setPendingPage] = useState(1);
  const [gradedPage, setGradedPage] = useState(1);
  const limit = 10;

  const { data: pendingData, isLoading: pendingLoading, error: pendingError } = useQuery({
    queryKey: ["pendingSpeakingSubmissions", pendingPage],
    queryFn: async () => {
      const result = await getPendingSpeakingSubmissions({ page: pendingPage, limit });
      console.log("[SpeakingGradingPage] Raw API response:", result);
      return result;
    },
  });

  const { data: gradedData, isLoading: gradedLoading, error: gradedError } = useQuery({
    queryKey: ["gradedSpeakingSubmissions", gradedPage],
    queryFn: async () => {
      const result = await getGradedSpeakingSubmissions({ page: gradedPage, limit });
      console.log("[SpeakingGradingPage] Graded API response:", result);
      return result;
    },
  });

  const handleGrade = (sectionResultId: string) => {
    router.push(`/teacher/dashboard/speaking-grading/${sectionResultId}`);
  };

  const handleView = (sectionResultId: string) => {
    router.push(`/teacher/dashboard/speaking-grading/${sectionResultId}`);
  };

  const isLoading = activeTab === "pending" ? pendingLoading : gradedLoading;
  const error = activeTab === "pending" ? pendingError : gradedError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load submissions</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const pendingSubmissions = pendingData?.items || [];
  const pendingPagination = pendingData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  
  const gradedSubmissions = gradedData?.items || [];
  const gradedPagination = gradedData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const renderSubmissionCard = (submission: PendingSpeakingSubmission | GradedSpeakingSubmission, isGraded: boolean): JSX.Element => {
    const gradedSubmission = isGraded ? submission as GradedSpeakingSubmission : null;
    
    return (
      <Card key={submission.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">
                {submission.test_results?.mock_tests?.title || "Mock Test"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4" />
                <span>{submission.test_results?.users?.full_name || "Unknown Student"}</span>
              </CardDescription>
            </div>
            {isGraded ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Graded
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>{submission.test_sections?.section_name || "Speaking Section"}</span>
            </div>
            {isGraded && gradedSubmission?.band_score != null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-700">Band Score:</span>
                <span className="text-green-600 font-bold text-lg">
                  {typeof gradedSubmission.band_score === 'number' 
                    ? gradedSubmission.band_score.toFixed(1)
                    : parseFloat(String(gradedSubmission.band_score)).toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {isGraded && gradedSubmission?.graded_at
                  ? `Graded ${format(new Date(gradedSubmission.graded_at), "MMM dd, yyyy 'at' HH:mm")}`
                  : submission.created_at
                  ? `Submitted ${format(new Date(submission.created_at), "MMM dd, yyyy 'at' HH:mm")}`
                  : "Recently"}
              </span>
            </div>
            <div className="pt-2 border-t">
              {isGraded ? (
                <Button
                  onClick={() => handleView(submission.id)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              ) : (
                <Button
                  onClick={() => handleGrade(submission.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Grade Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Speaking Grading</h1>
        <p className="text-gray-600">Review and grade student speaking submissions</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "graded")} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingPagination.total})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Graded ({gradedPagination.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Submissions</h3>
                <p className="text-gray-600">All speaking submissions have been graded.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingSubmissions.map((submission: PendingSpeakingSubmission) => renderSubmissionCard(submission, false))}
              </div>

              {pendingPagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                    disabled={pendingPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pendingPagination.page} of {pendingPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPendingPage((p) => Math.min(pendingPagination.totalPages, p + 1))}
                    disabled={pendingPage === pendingPagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="graded" className="mt-6">
          {gradedSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Graded Submissions</h3>
                <p className="text-gray-600">No speaking submissions have been graded yet.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gradedSubmissions.map((submission: GradedSpeakingSubmission) => renderSubmissionCard(submission, true))}
              </div>

              {gradedPagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setGradedPage((p) => Math.max(1, p - 1))}
                    disabled={gradedPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {gradedPagination.page} of {gradedPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setGradedPage((p) => Math.min(gradedPagination.totalPages, p + 1))}
                    disabled={gradedPage === gradedPagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpeakingGradingPage;

