"use client";
import toast from "react-hot-toast";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  GithubIcon,
  ArrowRight,
  GraduationCap,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { teacherRegister } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeacherRegisterSchema } from "@/validation/auth";
import ROUTES from "@/constants/route";

// Import các field components
import TextField from "@/components/form/text-field";
import DateField from "@/components/form/date-field";
import SelectField from "@/components/form/select-field";
import TagsField from "@/components/form/tags-field";
import FileUploadField from "@/components/form/file-field";

const TeacherRegisterForm = ({
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
    mutate: teacherRegisterHandler,
    isError,
    isPending,
  } = useMutation({
    mutationFn: teacherRegister,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
    onSuccess: (response) => {
      toast.success(
        response.data.message || "Application submitted successfully!"
      );
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    },
  });

  const form = useForm<z.infer<typeof TeacherRegisterSchema>>({
    resolver: zodResolver(TeacherRegisterSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone: "",
      date_of_birth: new Date(),
      gender: "male",
      country: "",
      qualification: "",
      experience_years: 0,
      specializations: [],
      ielts_band_score: 0,
      confirmPassword: "",
      file: [],
    },
  });

  const onSubmit = (data: z.infer<typeof TeacherRegisterSchema>) => {
    console.log("Form Data:", data);
    teacherRegisterHandler(data);
  };

  // Gender options
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

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
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg"
            >
              <GraduationCap className="h-6 w-6" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800"
            >
              Apply as an IELTS Teacher
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-balance text-sm text-muted-foreground max-w-md"
            >
              Join our team of expert IELTS instructors and help students
              achieve their dreams
            </motion.p>
          </div>

          <div className="grid gap-6">
            {/* Personal Information Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
              </div>

              {/* Full Name */}
              <TextField
                control={form.control}
                name="full_name"
                label="Full Name"
                placeholder="John Doe"
                required
                className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
              />

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  control={form.control}
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                />

                <TextField
                  control={form.control}
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                />
              </div>

              {/* Date of Birth, Gender, Country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DateField
                  control={form.control}
                  name="date_of_birth"
                  label="Date of Birth"
                  placeholder="Select your birth date"
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                />

                <SelectField
                  control={form.control}
                  name="gender"
                  label="Gender"
                  placeholder="Select gender"
                  options={genderOptions}
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                />

                <TextField
                  control={form.control}
                  name="country"
                  label="Country"
                  placeholder="United States"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                />
              </div>
            </motion.div>

            {/* Professional Information Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Professional Information
                </h3>
              </div>

              {/* Qualification */}
              <TextField
                control={form.control}
                name="qualification"
                label="Highest Qualification"
                placeholder="Master's in English Literature, TESOL Certificate, etc."
                required
                className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
              />

              {/* Experience and IELTS Band Score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  control={form.control}
                  name="experience_years"
                  label="Years of Teaching Experience"
                  type="number"
                  placeholder="5"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                />

                <div className="relative">
                  <TextField
                    control={form.control}
                    name="ielts_band_score"
                    label={
                      <div className="flex items-center gap-1">
                        Your IELTS Band Score
                        <Star className="h-3 w-3 text-yellow-500" />
                      </div>
                    }
                    type="number"
                    placeholder="8.5"
                    required
                    className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              {/* Specializations using TagsField */}
              <TagsField
                control={form.control}
                name="specializations"
                label="Teaching Specializations"
                placeholder="Type specialization and press Enter (e.g., Speaking, Writing)"
                className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
              />
            </motion.div>

             {/* Documents & Media Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Documents & Media
                </h3>
              </div>

              {/* Certificates */}
              <FileUploadField
                control={form.control}
                name="file"
                label="Teaching Certificates & Qualifications"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple={true}
                maxSize={5}
                placeholder="Upload your certificates (TESOL, CELTA, etc.)"
                description="You can upload multiple files. Include IELTS certificate, teaching qualifications, etc."
                className="border-muted-foreground/20 bg-background/50 backdrop-blur-sm"
              />
            </motion.div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-2 w-2 rounded-full bg-red-600"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Security
                </h3>
              </div>

              {/* Custom Password Field with Strength Indicator */}
              <div className="space-y-2">
                <TextField
                  control={form.control}
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  onValueChange={handlePasswordChange}
                  placeholder="********"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500 pr-10"
                />

                {/* Password Toggle Button */}
                <div className="relative -mt-11">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                <div className="flex gap-1 mt-2">
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
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, number,
                  and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <TextField
                  control={form.control}
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  onValueChange={handlePasswordChange}
                  placeholder="********"
                  required
                  className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500 pr-10"
                />

                {/* Confirm Password Toggle Button */}
                <div className="relative -mt-11">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Terms and Conditions */}
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
                  . I understand that my application will be reviewed before
                  approval.
                </label>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    <span>Submitting Application...</span>
                  </div>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    <span>Submit Teacher Application</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Divider */}
            <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            {/* Social Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl border-muted-foreground/20 hover:bg-muted/50 transition-all duration-300"
                type="button"
              >
                <GithubIcon className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default TeacherRegisterForm;
