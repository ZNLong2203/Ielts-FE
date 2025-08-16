
import ProtectedRoute from "@/components/auth/protectedRoute";

const StudentPageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </ProtectedRoute>
    );
};

export default StudentPageLayout;