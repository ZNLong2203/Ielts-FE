import StudentTable from "@/components/admin/student/studentTable";
import { Suspense } from "react";
import Loading from '@/components/ui/loading';


const StudentAdminPage = () => {
  return (
    <div className="flex-1 space-y-4 p-10 pt-6 h-full bg-white">
      <Suspense fallback={<Loading />}>
        <StudentTable />
      </Suspense>
    </div>
  );
};

export default StudentAdminPage;
