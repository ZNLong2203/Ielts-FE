"use client";

import { motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import TeacherResetPasswordForm from "@/components/auth/teacherResetPassword";
import Link from "next/link";

const ResetTeacherPasswordPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center gap-2 md:justify-start"
        >
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white bg-green-700 shadow-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-lg font-semibold">Ielts</span>
          </Link>
        </motion.div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <TeacherResetPasswordForm />
          </div>
        </div>
      </div>
      
      <div className="relative hidden lg:block">
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(21, 128, 61, 0.3) 100%)",
            backdropFilter: "blur(8px)",
          }}
        ></div>
        
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        
        {/* Content Overlay */}
        <div className="relative z-20 flex h-full flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Secure Your Account
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Reset your password to regain access to your teaching dashboard and continue helping students succeed.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Enhanced security measures</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Quick and easy password reset</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Secure token-based verification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Immediate access after reset</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetTeacherPasswordPage;
