"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Filter,
  Search,
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./courseComboColumn";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getComboCourses } from "@/api/course";
import { useFilter } from "@/hook/useFilter";
import ROUTES from "@/constants/route";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

const CourseComboTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courseCombos", page],
    queryFn: () => getComboCourses({ page }),
  });

  // Meta information
  const currentPage = data?.meta?.current || 1;
  const pageSize = data?.meta?.pageSize || 10;
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.pages || 1;

  // Define which fields to filter
  const filterFields = ["name"];
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(data?.result || [], filterFields);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Error Loading Coupons"
        description="There was an error loading the coupons. Please try again later."
        onRetry={() => refetch()}
      />
    );
  }
};

export default CourseComboTable;
