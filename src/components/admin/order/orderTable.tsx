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
  ShoppingCart,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Calendar,
} from "lucide-react";
import AdminFilter from "@/components/filter/admin-filter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./orderColumn";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/api/order";
import { useFilter } from "@/hook/useFilter";
import ROUTES from "@/constants/route";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

const OrderTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => getOrders({ page }),
  });

  // Meta information
  const currentPage = data?.meta?.current || 1;
  const pageSize = data?.meta?.pageSize || 10;
  const totalItems = data?.meta?.total || 0;
  const totalPages = data?.meta?.pages || 1;

  // Define which fields to filter
  const filterFields = [
    "order_code",
    "status",
    "payment_status",
    "payment_method",
    "final_amount",
    "created_at",
  ];

  // Use the filter hook
  const {
    filters,
    isFilterVisible,
    filteredData,
    handleFilterChange,
    handleClearFilters,
    handleClose,
    setIsFilterVisible,
  } = useFilter(data?.result || [], filterFields);

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== ""
  ).length;
  const filteredCount = filteredData.length;

  // Calculate order statistics
  const completedOrders = filteredData.filter(
    (order) => order.status === "completed"
  ).length;

  const pendingOrders = filteredData.filter(
    (order) => order.status === "pending"
  ).length;

  const cancelledOrders = filteredData.filter(
    (order) => order.status === "cancelled"
  ).length;

  // Calculate total revenue from completed orders
  const totalRevenue = filteredData
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + parseFloat(order.final_amount || "0"), 0);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`?page=${newPage}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Error Loading Orders"
        description="There was an error loading the orders. Please try again later."
        onRetry={() => refetch()}
      />
    );
  }

  const fieldConfigs = [
    {
      key: "order_code",
      label: "Order Code",
      placeholder: "Search by order code",
      type: "input" as const,
      icon: (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
    },
    {
      key: "payment_status",
      label: "Payment Status",
      placeholder: "Filter by payment status",
      type: "select" as const,
      icon: (
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Completed", value: "completed" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
      ],
    },
    {
      key: "payment_method",
      label: "Payment Method",
      placeholder: "Filter by payment method",
      type: "select" as const,
      icon: (
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Zalopay", value: "zalopay" },
        { label: "Stripe", value: "stripe" },
      ],
    },
    {
      key: "final_amount",
      label: "Price Range",
      placeholder: "Select price range...",
      type: "select" as const,
      icon: (
        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Free (0₫)", value: "free" },
        { label: "Under 500,000₫", value: "under_500k" },
        { label: "500,000₫ - 1,000,000₫", value: "500k_1m" },
        { label: "1,000,000₫ - 2,000,000₫", value: "1m_2m" },
        { label: "2,000,000₫ - 5,000,000₫", value: "2m_5m" },
        { label: "Over 5,000,000₫", value: "over_5m" },
      ],
    },
    {
      key: "created_at",
      label: "Creation Date",
      placeholder: "Select creation period...",
      type: "select" as const,
      icon: (
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      ),
      options: [
        { label: "Last 7 days", value: "7d" },
        { label: "Last 30 days", value: "30d" },
        { label: "Last 3 months", value: "3m" },
        { label: "Last 6 months", value: "6m" },
        { label: "Last year", value: "1y" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Heading
            title="Order Management"
            description="Manage and track all customer orders."
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
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
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {/* <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push(ROUTES.ADMIN_ORDERS + "/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              {hasActiveFilters ? "Filtered Orders" : "Total Orders"}
            </p>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveFilters ? filteredCount : totalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? `of ${totalItems} total`
                : `${pageSize} per page`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Completed
            </p>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Cancelled
            </p>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {cancelledOrders}
            </div>
            <p className="text-xs text-muted-foreground">Canceled orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      {isFilterVisible && (
        <AdminFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onClose={handleClose}
          isVisible={isFilterVisible}
          totalItems={totalItems}
          filteredCount={filteredCount}
          label="Orders"
          fieldConfigs={fieldConfigs}
        />
      )}

      {/* Data Table Section */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={filteredData}
                searchKey={["order_code", "user_id"]}
                searchPlaceholder="Search by order code or user ID..."
              />

              {/* Enhanced Pagination */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(currentPage * pageSize, totalItems)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {hasActiveFilters ? filteredCount : totalItems}
                    </span>{" "}
                    entries
                    {hasActiveFilters && (
                      <span className="text-blue-600 ml-1">(filtered)</span>
                    )}
                  </span>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1}
                    className="hidden md:flex"
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden md:inline">Previous</span>
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          className="w-8 h-8"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <span className="mr-1 hidden md:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="hidden md:flex"
                  >
                    Last
                  </Button>

                  <div className="hidden md:flex items-center space-x-2 ml-4">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{currentPage}</span>
                      <span className="text-sm text-muted-foreground">
                        of {totalPages}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTable;
