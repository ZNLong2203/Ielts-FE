import { Card, CardContent } from "@/components/ui/card";
import { StatCardProps } from "@/interface/adminDashboard";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  iconColor = "text-blue-600",
  className,
}: StatCardProps) {
  const isPositive = change > 0;
  const formatChange = Math.abs(change);

  return (
    <Card
      className={cn("transition-all duration-200 hover:shadow-lg", className)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold tracking-tight">
                {typeof value === "number" && value > 1000
                  ? value.toLocaleString()
                  : value}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "p-3 rounded-full bg-muted/10",
              iconColor.replace("text-", "bg-").replace("-600", "-100")
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2 text-sm">
          <div
            className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
              isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{formatChange}%</span>
          </div>
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
