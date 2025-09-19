"use client";
import toast from "react-hot-toast";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Lock,
  ArrowRight,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { resetTeacherPassword } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetTeacherPasswordSchema } from "@/validation/auth";
import ROUTES from "@/constants/route";

// Import field components
import TextField from "@/components/form/text-field";

const TeacherResetPasswordForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (value: string) => {
    // Simple password strength calculation
    let strength = 0;
    if (value.length >= 8) strength += 1;
    if (/[A-Z]/.test(value)) strength += 1;
    if (/[a-z]/.test(value)) strength += 1;
    if (/[0-9]/.test(value)) strength += 1;
    if (/[!@#$%^&*]/.test(value)) strength += 1;
    setPasswordStrength(strength);
  };

  const {
    mutate: resetPasswordHandler,
    isPending,
  } = useMutation({
    mutationFn: (data: z.infer<typeof ResetTeacherPasswordSchema>) => {
      if (!token) {
        throw new Error("Reset token is missing");
      }
      return resetTeacherPassword({ ...data, token });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as { message?: string })?.message || "Password reset failed";
      toast.error(errorMessage);
    },
    onSuccess: (response) => {
      toast.success(
        response.data.message || "Password reset successfully!"
      );
      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 2000);
    },
  });

  const form = useForm<z.infer<typeof ResetTeacherPasswordSchema>>({
    resolver: zodResolver(ResetTeacherPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof ResetTeacherPasswordSchema>) => {
    console.log("Reset Password Data:", data);
    resetPasswordHandler(data);
  };

  // If no token, show error message
  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full text-center"
      >
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-4">
              The password reset link is invalid or has expired.
            </p>
            <Button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

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
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg"
            >
              <Lock className="h-6 w-6" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800"
            >
              Reset Your Password
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-balance text-sm text-muted-foreground max-w-md"
            >
              Please enter your new password below. Make sure it&apos;s secure and easy to remember.
            </motion.p>
          </div>

          <div className="grid gap-6">
            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  New Password
                </h3>
              </div>

              {/* New Password Field with Strength Indicator */}
              <div className="space-y-2">
                <TextField
                  control={form.control}
                  name="new_password"
                  label="New Password"
                  type="password"
                  showPasswordToggle={true}
                  onValueChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-green-500"
                />

                {/* Password Strength Indicator */}
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength
                          ? [
                              "bg-red-500",
                              "bg-orange-500",
                              "bg-yellow-500",
                              "bg-blue-500",
                              "bg-green-500",
                            ][Math.min(passwordStrength - 1, 4)]
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, number,
                  and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <TextField
                  control={form.control}
                  name="confirm_password"
                  label="Confirm New Password"
                  type="password"
                  showPasswordToggle={true}
                  placeholder="Confirm your new password"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-green-500"
                />
              </div>
            </motion.div>

            {/* Security Tips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Password Security Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use a combination of letters, numbers, and symbols</li>
                <li>• Avoid using personal information</li>
                <li>• Don&apos;t reuse passwords from other accounts</li>
                <li>• Consider using a password manager</li>
              </ul>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Reset Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => router.push(ROUTES.LOGIN)}
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign in here
                </button>
              </p>
            </motion.div>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default TeacherResetPasswordForm;
