import ProtectedRoute from "@/components/auth/protectedRoute";

const TeacherPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["teacher", "admin", "student"]}>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </ProtectedRoute>
  );
};

export default TeacherPageLayout;
