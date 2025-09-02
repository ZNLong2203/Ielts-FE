import ProtectedRoute from "@/components/auth/protectedRoute"
import TeacherLayout from "@/components/teacher/dashboard/teacherLayout";

const TeacherDashboardLayout = ({ children }: {children: React.ReactNode}) => {
    return (
        <ProtectedRoute allowedRoles={["teacher"]}>
           <TeacherLayout>
               {children}
           </TeacherLayout>
        </ProtectedRoute>
    )
}

export default TeacherDashboardLayout;