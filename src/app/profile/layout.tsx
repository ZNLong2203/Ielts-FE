import ProtectedRoute from "@/components/auth/protectedRoute";
import Footer from "@/components/footer";
import LandingNavbar from "@/components/navbar";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
    return (
       <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <div className="min-h-screen bg-gray-50">
                <LandingNavbar />
                {children}
                <Footer />
            </div>
        </ProtectedRoute>
    )
}

export default ProfileLayout;