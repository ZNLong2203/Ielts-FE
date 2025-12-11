import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecentSubmission } from "@/interface/teacherDashboard";
import { Clock, FileText, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RecentSubmissionsProps {
  submissions: RecentSubmission[];
}

const RecentSubmissions = ({ submissions }: RecentSubmissionsProps) => {
  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "SPEAKING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "WRITING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "LISTENING":
        return "bg-green-100 text-green-800 border-green-200";
      case "READING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "GRADED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REVIEWING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Submissions
          </h3>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {
              submissions.filter((s) => s.status.toUpperCase() === "PENDING")
                .length
            }{" "}
            Pending
          </Badge>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 10).map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Student Avatar */}
                  {submission.studentAvatar ? (
                    <Image
                      src={submission.studentAvatar}
                      alt={submission.studentName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}

                  {/* Submission Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-gray-900">
                        {submission.studentName}
                      </p>
                      <Badge
                        variant="outline"
                        className={getTypeColor(submission.type)}
                      >
                        {submission.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {submission.courseTitle}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {submission.exerciseTitle}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {submission.submittedAt}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2 ml-4">
                  <Badge
                    variant="outline"
                    className={getStatusColor(submission.status)}
                  >
                    {submission.status}
                  </Badge>
                  {submission.status.toUpperCase() === "PENDING" && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/teacher/submissions/${submission.id}`}>
                        Review
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {submissions.length > 10 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/teacher/submissions">
                  View All Submissions ({submissions.length})
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentSubmissions;
