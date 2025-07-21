import TeacherTable from "@/components/admin/teacher/teacherTable";
import { Suspense } from "react";
import Loading from '@/components/ui/loading';


const TeacherAdminPage = () => {
  return (
    <div className="flex-1 space-y-4 p-10 pt-6 h-full bg-white">
      <Suspense fallback={<Loading />}>
        <TeacherTable />
      </Suspense>
    </div>
  );
};

export default TeacherAdminPage;
