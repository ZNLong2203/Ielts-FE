"use client";

import { selectUser } from "@/redux/features/user/userSlice";
import { useSelector } from "react-redux";

const StudentProfile = () => {
    const user = useSelector(selectUser);    
    console.log("User data:", user);
    return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Student Profile</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Profile Information</h2>
            <p className="text-gray-700 mb-2"><strong>Name:</strong> {user?.profiles?.full_name}</p>
            <p className="text-gray-700 mb-2"><strong>Email:</strong> {user?.email}</p>
            <p className="text-gray-700 mb-2"><strong>Role:</strong> {user?.role}</p>
            <p className="text-gray-700 mb-2"><strong>Status:</strong> {user?.status}</p>
            <p className="text-gray-700 mb-2"><strong>Created At:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
            <p className="text-gray-700 mb-2"><strong>Last Login:</strong> {user?.last_login ? new Date(user?.last_login).toLocaleDateString() : "Never"}</p>
            <p className="text-gray-700 mb-2"><strong>Login Count:</strong> {String(user?.login_count || 0)}</p>
        </div>
        </div>
    );
}

export default StudentProfile;