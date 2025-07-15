"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Heading from "@/components/ui/heading";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

import { columns } from "@/components/admin/student/studentColumn";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";

import { getStudents } from "@/api/student";
import { IUser } from "@/interface/user";

const StudentClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current page from search params, default to 1 if not present
  const page = Number(searchParams.get("page")) || 1;

  const { data, isPending } = useQuery({
    queryKey: ["student", page], 
    queryFn: () => getStudents({ page }), 
  });

  const response = data?.data?.data;

  // Metadata information
  const meta = response?.meta || {};
  const currentPage = meta?.current || 1;
  const pageSize = meta?.pageSize || 10;
  const totalPages = meta?.pages || 1;
  const totalItems = meta?.total || 0;

  // Format student data
  const formatedStudent: IUser[] = response?.result.map((student: IUser) => ({
    id: student.id,
    full_name: student.full_name,
    email: student.email,
    phone: student.phone,
    country: student.country,
    role: student.role,
    avatar: student.avatar,
    email_verified: student.email_verified,
    created_at: format(new Date(student.created_at), "dd/MM/yyyy"),
  })) || [];

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(`?page=${newPage}`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Student${totalItems <= 1 ? '' : 's'} (${totalItems})`}
          description="Manage student preferences"
        />
        <Button
          onClick={() => {
            router.push("");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add new
        </Button>
      </div>
      <Separator />
      
      {isPending ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          <DataTable 
            columns={columns} 
            data={formatedStudent} 
            searchKey="full_name"
          />
          
          {/* Pagination UI */}
          <div className="flex items-center justify-between px-2 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1">Previous</span>
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
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
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 mx-1"
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
                  <span className="mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StudentClient;