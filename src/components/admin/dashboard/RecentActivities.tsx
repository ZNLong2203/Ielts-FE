import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from "@/interface/adminDashboard";
import { BookOpen, Clock, DollarSign, FileText, UserPlus } from "lucide-react";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const getActivityIcon = (type: RecentActivity["type"]) => {
  switch (type) {
    case "user_registered":
      return <UserPlus className="h-4 w-4 text-blue-600" />;
    case "course_created":
      return <BookOpen className="h-4 w-4 text-green-600" />;
    case "mocktest_completed":
      return <FileText className="h-4 w-4 text-purple-600" />;
    case "payment_received":
      return <DollarSign className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getActivityBadgeColor = (type: RecentActivity["type"]) => {
  switch (type) {
    case "user_registered":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "course_created":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "mocktest_completed":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "payment_received":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export default function RecentActivities({
  activities,
}: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span>Recent Activities</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg border border-dashed border-gray-200 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-shrink-0 p-2 rounded-full bg-muted/10">
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <Badge
                    variant="secondary"
                    className={getActivityBadgeColor(activity.type)}
                  >
                    {activity.type.replace("_", " ")}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {activity.user && (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user.name}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className="text-sm font-medium text-green-600">
                        ${activity.amount}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No recent activities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
