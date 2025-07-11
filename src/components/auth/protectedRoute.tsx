"use client"

import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@/redux/features/user/userSlice';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/route';

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: string;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ 
    children, 
    redirectTo = ROUTES.LOGIN,
    allowedRoles
}: ProtectedRouteProps) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const router = useRouter();

    // Kiểm tra user có role được phép không
    const hasPermission = (): boolean => {
        // Nếu không có allowedRoles thì cho phép tất cả (chỉ cần authenticated)
        if (!allowedRoles || allowedRoles.length === 0) return true;
        return allowedRoles.includes(user?.role || '');
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        // // Kiểm tra role nếu có yêu cầu
        // if (allowedRoles && allowedRoles.length > 0 && !hasPermission()) {
        //     // Redirect based on user role
        //     if (user?.role === 'STUDENT') {
        //         router.push(ROUTES.HOME);
        //     } else if (user?.role === 'TEACHER') {
        //         router.push(ROUTES.HOME);
        //     } else if (user?.role === 'ADMIN') {
        //         router.push('/admin/dashboard');
        //     } else {
        //         router.push('/unauthorized');
        //     }
        //     return;
        // }
    }, [isAuthenticated, user, router, redirectTo, allowedRoles]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Kiểm tra permission sau khi đã authenticated
    if (!hasPermission()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="text-red-500 text-6xl">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                    <Button 
                        onClick={() => router.back()}
                        className="px-10 py-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;