import ProtectedRoute from "@/components/auth/protectedRoute";

const AdminPageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="min-h-screen bg-gray-50">{children}</div>
        </ProtectedRoute>
    );
}

export default AdminPageLayout;