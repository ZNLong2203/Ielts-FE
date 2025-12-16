"use client";
import toast from "react-hot-toast";
import {
  Form,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { studentRegister } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentRegisterSchema } from "@/validation/auth";
import ROUTES from "@/constants/route";
import TextField from "../form/text-field";
import { FaGoogle } from "react-icons/fa";

const StudentRegisterForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (value: string) => {
    // Simple password strength calculation
    let strength = 0;
    if (value.length >= 8) strength += 1;
    if (/[A-Z]/.test(value)) strength += 1;
    if (/[0-9]/.test(value)) strength += 1;
    if (/[^A-Za-z0-9]/.test(value)) strength += 1;
    setPasswordStrength(strength);
  };

  const {
    mutate: studentRegisterHandler,
    isError,
    isPending,
  } = useMutation({
    mutationFn: studentRegister,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      // Redirect to login page after successful registration;
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    },
  });

  const form = useForm<z.infer<typeof StudentRegisterSchema>>({
    resolver: zodResolver(StudentRegisterSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    },
  });

  const onSubmit = (data: z.infer<typeof StudentRegisterSchema>) => {
    studentRegisterHandler(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-blue-700"
            >
              <span>Create a Student Account</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-balance text-sm text-muted-foreground max-w-xs"
            >
              Join thousands of students preparing for IELTS success
            </motion.p>
          </div>

          <div className="grid gap-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-2"
            >
              <TextField
                control={form.control}
                name="full_name"
                label="Full Name"
                placeholder="John Doe"
                required
                className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="grid gap-2"
            >
              <TextField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                required
                className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="grid gap-2"
            >
              <TextField
                control={form.control}
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                onValueChange={handlePasswordChange}
                placeholder="********"
                required
                className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
              />

              <div className="flex gap-1 mt-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < passwordStrength
                        ? [
                            "bg-red-500",
                            "bg-orange-500",
                            "bg-yellow-500",
                            "bg-green-500",
                          ][Math.min(passwordStrength - 1, 3)]
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters with uppercase, number,
                and special character
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="grid gap-2"
            >
              <TextField
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                required
                className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start space-x-2 mt-2"
            >
              <div className="flex items-center h-5 mt-1">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                type="submit"
                suppressHydrationWarning={true}
                className="w-full h-11 rounded-xl bg-blue-700 hover:bg-blue-900 text-white transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>

            <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                variant="outline"
                suppressHydrationWarning={true}
                className="w-full h-11 rounded-xl border-muted-foreground/20 hover:bg-muted/50 transition-all duration-300"
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default StudentRegisterForm;
