"use client";

import { motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import TeacherRegisterForm from "@/components/auth/teacherRegister";
import Link from "next/link";
import ROUTES from "@/constants/route";

const RegisterTeacherPage = () => {
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
            <span className="text-lg font-semibold">Ielts</span>
          </Link>
        </motion.div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl"> {/* Increased max width for teacher form */}
            <TeacherRegisterForm />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Already have a teacher account?{" "}
                <Link
                  href={ROUTES.LOGIN}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in here
                </Link>
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
        
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')",
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
              Shape the Future of IELTS Learning
            </h2>
            <p className="text-xl mb-6 text-white/90">
              Join our community of expert instructors and help students achieve their academic dreams.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Competitive compensation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Flexible teaching schedule</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Professional development opportunities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Access to cutting-edge teaching tools</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterTeacherPage;