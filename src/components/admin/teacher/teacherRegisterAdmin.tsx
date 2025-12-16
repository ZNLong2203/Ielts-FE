"use client";

import toast from "react-hot-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Save,
  X,
  UserPlus,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { teacherRegister } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeacherRegisterSchema } from "@/validation/auth";
import ROUTES from "@/constants/route";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Import các field components
import TextField from "@/components/form/text-field";
import DateField from "@/components/form/date-field";
import SelectField from "@/components/form/select-field";
import TagsField from "@/components/form/tags-field";
import FileUploadField from "@/components/form/file-field";

const TeacherRegisterAdminForm = () => {
  const router = useRouter();
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
      toast.success(response.data.message || "Teacher created successfully!");
      setTimeout(() => {
        router.push(ROUTES.ADMIN_TEACHERS);
      }, 2000);
    },
  });

  const form = useForm<z.infer<typeof TeacherRegisterSchema>>({
    resolver: zodResolver(TeacherRegisterSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "Password#123",
      phone: "",
      date_of_birth: new Date(),
      gender: "male",
      country: "",
      city: "",
      qualification: "",
      experience_years: 0,
      specializations: [],
      ielts_band_score: 0,
      confirmPassword: "Password#123",
      file: undefined,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Heading
                title="Register new Teacher"
                description="Fill in the details below to register a new teacher."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.ADMIN_TEACHERS)}
                className="flex items-center space-x-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Back to Teachers</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    control={form.control}
                    name="full_name"
                    label="Full Name"
                    placeholder="Enter full name"
                    required
                  />
                  <TextField
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Enter email"
                    required
                  />
                  <TextField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    placeholder="Enter phone number"
                    required
                  />
                  <DateField
                    control={form.control}
                    name="date_of_birth"
                    label="Date of Birth"
                    placeholder="Select date of birth"
                  />
                  <SelectField
                    control={form.control}
                    name="gender"
                    label="Gender"
                    options={genderOptions}
                  />
                  <TextField
                    control={form.control}
                    name="country"
                    label="Country"
                    placeholder="Enter country"
                    required
                  />
                   <TextField
                    control={form.control}
                    name="city"
                    label="City"
                    placeholder="Enter city"
                    required
                  />
                </CardContent>
              </Card>

              {/* Professional Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    control={form.control}
                    name="qualification"
                    label="Qualification"
                    placeholder="Enter qualification"
                    required
                  />
                  <TextField
                    control={form.control}
                    name="experience_years"
                    label="Years of Experience"
                    placeholder="Enter years of experience"
                    type="number"
                    required
                  />
                  <TagsField
                    control={form.control}
                    name="specializations"
                    label="Specializations"
                    placeholder="Enter specializations"
                  />
                  <TextField
                    control={form.control}
                    name="ielts_band_score"
                    label="IELTS Band Score"
                    placeholder="Enter IELTS band score"
                    type="number"
                    required
                  />
                  <FileUploadField
                    control={form.control}
                    name="file"
                    label="Upload Certificate"
                  />
                </CardContent>
              </Card>

              {/* Submit Button Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <UserPlus className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Ready to Create Teacher Account?
                        </h3>
                        <p className="text-sm text-gray-600 max-w-md mx-auto">
                          Review all the information above and click "Create
                          Teacher" to add this teacher to the system.
                        </p>
                      </div>

                      <Separator className="my-6" />

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push(ROUTES.ADMIN_TEACHERS)}
                          className="w-full sm:w-auto min-w-[140px] flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
                          disabled={isPending}
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            form.reset();
                            toast.success("Form has been reset");
                          }}
                          className="w-full sm:w-auto min-w-[140px] flex items-center space-x-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                          disabled={isPending}
                        >
                          <FileText className="h-4 w-4" />
                          <span>Reset Form</span>
                        </Button>

                        <Button
                          type="submit"
                          className="w-full sm:w-auto min-w-[160px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                          disabled={isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Creating...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>Create Teacher</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {isPending && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <p className="text-sm text-blue-600 flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating teacher account and sending credentials...
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default TeacherRegisterAdminForm;
