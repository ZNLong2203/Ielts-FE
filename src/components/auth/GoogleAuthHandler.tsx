"use client";

import { getProfile } from "@/api/profile";
import ROUTES from "@/constants/route";
import { loginFailure, loginSuccess } from "@/redux/features/user/userSlice";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const GoogleAuthHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const hasHandledAuth = useRef(false);

  const isLoginSuccess = searchParams.get("login_success");
  const accessToken = searchParams.get("access_token");
  const errorParam = searchParams.get("error");

  const shouldFetchProfile =
    isLoginSuccess === "true" && !!accessToken && !hasHandledAuth.current;

  const { data, error, isSuccess, isError } = useQuery({
    queryKey: ["profile", "google-auth"],
    queryFn: getProfile,
    enabled: shouldFetchProfile,
    retry: false,
  });

  useEffect(() => {
    // Handle success only if it's from Google auth
    if (isSuccess && data && isLoginSuccess === "true" && accessToken) {
      const userData = data.data.data;
      const token = localStorage.getItem("accessToken") || "";

      // Save to redux store
      dispatch(loginSuccess({ user: userData, accessToken: token }));

      toast.success("Login with Google successful!");

      // Clean URL params and redirect to home
      router.replace("/");
      hasHandledAuth.current = true;
    }
  }, [isSuccess, data, isLoginSuccess, accessToken, dispatch, router]);

  useEffect(() => {
    // Handle error only if it's from Google auth
    if (isError && error && isLoginSuccess === "true" && accessToken) {
      toast.error(
        (error as any).response?.data?.message ||
          "Failed to fetch user profile. Please try again."
      );
      dispatch(loginFailure());
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
      hasHandledAuth.current = true;
    }
  }, [isError, error, isLoginSuccess, accessToken, dispatch, router]);

  useEffect(() => {
    // Handle Google auth failure
    if (errorParam === "google_auth_failed" && !hasHandledAuth.current) {
      hasHandledAuth.current = true;
      toast.error("Google authentication failed. Please try again.");

      // Clean error param from URL
      router.replace(ROUTES.LOGIN);
    }
  }, [errorParam, router]);

  useEffect(() => {
    // Save access token to localStorage when available
    if (isLoginSuccess === "true" && accessToken && !hasHandledAuth.current) {
      localStorage.setItem("accessToken", accessToken);
    }
  }, [isLoginSuccess, accessToken]);

  return null;
};

export default GoogleAuthHandler;
