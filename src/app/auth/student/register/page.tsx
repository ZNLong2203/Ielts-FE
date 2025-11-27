"use client";

import { motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import RegisterForm from "@/components/auth/studentRegister";
import Link from "next/link";
import ROUTES from "@/constants/route";

const RegisterStudentPage = () => {
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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white bg-blue-700 shadow-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-lg font-semibold">IELTS</span>
          </Link>
        </motion.div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
        
            <RegisterForm role="STUDENT"/>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Already have a student account?{" "}
                <a
                  href={ROUTES.LOGIN}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(1, 114, 250, 0.2) 0%, rgba(1, 22, 87, 0.3) 100%)",
            backdropFilter: "blur(8px)",
          }}
        ></div>
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
            alt="Students studying together"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-md border border-white/20 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Start Your IELTS Journey Today
            </h2>
            <p className="text-white/80">
              Create an account to access personalized study plans, practice
              tests, and expert guidance to help you achieve your target IELTS
              score.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-white/90 text-sm">
                  Personalized study plans
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-white/90 text-sm">
                  AI-powered practice sessions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-white/90 text-sm">
                  Expert feedback on your progress
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudentPage;
