"use client";

import { motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import LoginForm from "@/components/auth/loginForm";

const LoginStudentPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center gap-2 md:justify-start"
        >
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-lg bg-blue-700">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-lg font-semibold">TLL</span>
          </a>
        </motion.div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm/>
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
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
            alt="IELTS Study"
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
              Achieve Your IELTS Goals
            </h2>
            <p className="text-white/80">
              Join thousands of students who have improved their IELTS scores
              with our comprehensive study platform and expert guidance.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginStudentPage;
