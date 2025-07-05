"use client"

import { mockUserWithProfile } from "@/userMockData";

import { useDispatch, useSelector } from 'react-redux';
import { saveUser } from "@/redux/features/user/userSlice";

const StudentProfile = () => {

    const dispatch = useDispatch();
    // Dispatch the mock user data to the Redux store
    dispatch(saveUser(mockUserWithProfile));

    // Select the user from the Redux store
    const user = useSelector((state: any) => state.user);

  return (
    <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Last Login:</strong> {user.last_login ? user.last_login.toString() : 'N/A'}</p>
        <p><strong>Login Count:</strong> {user.login_count}</p>
    </div>
  );
};

export default StudentProfile;
