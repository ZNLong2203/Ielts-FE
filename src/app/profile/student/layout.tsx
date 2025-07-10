
import ProtectedRoute from "@/components/auth/protectedRoute";

const StudentPageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </ProtectedRoute>
    );
};

export default StudentPageLayout;