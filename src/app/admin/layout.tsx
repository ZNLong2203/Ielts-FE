import AdminLayout from "@/components/admin/adminLayout";
import ProtectedRoute from "@/components/auth/protectedRoute";

const AdminPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div>
        <AdminLayout>{children}</AdminLayout>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPageLayout;
