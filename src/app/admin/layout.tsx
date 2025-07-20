import AdminNavbar from "@/components/admin/adminNavbar";
import ProtectedRoute from "@/components/auth/protectedRoute";

const AdminPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div>
        <AdminNavbar />
        {children}
      </div>
    // </ProtectedRoute>
  );
};

export default AdminPageLayout;
