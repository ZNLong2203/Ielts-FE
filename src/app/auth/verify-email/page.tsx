"use client";

import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  useEffect(() => {
    if (status === "success") {
      toast.success("Email verified successfully!", {
        duration: 3000,
      });
      // Redirect sau 2 giây
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      return () => clearTimeout(timer);
    } else if (status === "failed") {
      toast.error(message || "Email verification failed!", {
        duration: 3000,
      });
      // Redirect sau 2 giây
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, message, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="flex flex-col items-center space-y-4">
          {status === "success" ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-20 w-20 text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800">
                Verification Successful!
              </h1>
              <p className="text-center text-gray-600">
                Your email has been verified successfully. Redirecting to login
                page...
              </p>
            </>
          ) : status === "failed" ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <XCircle className="h-20 w-20 text-red-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800">
                Verification Failed!
              </h1>
              <p className="text-center text-gray-600">
                {message ||
                  "The verification link is invalid or has expired. Redirecting to home page..."}
              </p>
            </>
          ) : (
            <>
              <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-800">Verifying...</h1>
              <p className="text-center text-gray-600">Please wait a moment</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
