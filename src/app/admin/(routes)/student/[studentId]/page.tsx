"use client";
import StudentDetail from "@/components/admin/student/studentDetail";
import { useParams } from "next/navigation";

const StudentAdminDetailPage = () => {
  return (
    <div className="flex-1 space-y-4 p-10 pt-6 h-full bg-white">
      <StudentDetail id={useParams().studentId as string} />
    </div>
  );
};

export default StudentAdminDetailPage;
