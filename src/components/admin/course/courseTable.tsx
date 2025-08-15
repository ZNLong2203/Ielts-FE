"use client";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Search,
  FileText,
  Download,
  Eye,
  Edit,
  Archive,
  FileX,
  FileCheck,
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/admin/blog/blogColumn";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import ROUTES from "@/constants/route";
import { getAllCoursesForAdmin } from "@/api/course";
import { useFilter } from "@/hook/useFilter";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/ui/loading";

const CourseTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Get all courses
  const {
    data: allCourses,
    isLoading: allLoading,
    refetch: allRefetch,
  } = useQuery({
    queryKey: ["courses", page],
    queryFn: () => getAllCoursesForAdmin({ page }),
  });

  const handleRefresh = () => {
    allRefetch();
  };

  if (allLoading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading
            title="Course Management"
            description="Manage your courses here."
          />
        </div>
        <div className="flex items-center space-x-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={hasActiveFilters ? "bg-blue-50 border-blue-200" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </Button> */}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={allLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${allLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push(ROUTES.ADMIN_BLOGS + "/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Blog
          </Button>
        </div>
      </div>
    </div>
  );
};
