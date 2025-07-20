"use client";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import TagsField from "@/components/form/tags-field";
import DateField from "@/components/form/date-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, GraduationCap, Save, XCircle } from "lucide-react";
import { USER_GENDER } from "@/constants/user";
import { STUDENT_LEVEL, STUDENT_LANGUAGE } from "@/constants/student";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";

import { StudentFormSchema } from "@/validation/student";
import { ProfileFormSchema } from "@/validation/profile";
import { getStudent, updateStudent } from "@/api/student";
import { updateProfile } from "@/api/profile";

const StudentForm = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const userId = params.userId as string;

  // Get student details
  const { data, isPending, isError } = useQuery({
    queryKey: ["studentDetail", userId],
    queryFn: () => getStudent(userId),
    retry: false,
  });

  // Update profile form
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ProfileFormSchema>) => {
      const updatedFormData = {
        ...formData,
        date_of_birth: formData.date_of_birth
          ? new Date(formData.date_of_birth)
          : undefined,
      };
      return updateProfile(userId, updatedFormData);
    },
    onSuccess: (data) => {
      toast.success(data.data.data.message || "Profile updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      queryClient.invalidateQueries({
        queryKey: ["studentDetail", userId],
      });
      router.push(ROUTES.ADMIN_STUDENTS);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Update student details
  const updateStudentMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof StudentFormSchema>) => {
      return updateStudent(userId, formData);
    },
    onSuccess: (data) => {
      toast.success(
        data.data.data.message || "Student information updated successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      queryClient.invalidateQueries({
        queryKey: ["studentDetail", userId],
      });
      router.push(ROUTES.ADMIN_STUDENTS);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update student information");
    },
  });

  // Student form
  const studentForm = useForm<z.infer<typeof StudentFormSchema>>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: data?.students,
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: data,
  });

  // Handle student form submission
  const onStudentFormSubmit = (formData: z.infer<typeof StudentFormSchema>) => {
    console.log("Student Form Data:", formData);
    updateStudentMutation.mutate(formData);
  };

  // handle profile form submission
  const onProfileFormSubmit = (formData: z.infer<typeof ProfileFormSchema>) => {
    console.log("Profile Form Data:", formData);
    updateProfileMutation.mutate(formData);
  };

  useEffect(() => {
    if (data) {
      studentForm.reset({
        bio: data.students?.bio || "",
        current_level: data.students?.current_level || "",
        language_preference: data.students?.language_preference || "",
        learning_goals: data.students?.learning_goals || [],
        target_ielts_score: data.students?.target_ielts_score || undefined,
        timezone: data.students?.timezone || "",
      });
      profileForm.reset({
        full_name: data.full_name || "",
        avatar: data.avatar || "",
        city: data.city || "",
        country: data.country || "",
        phone: data.phone || "",
        date_of_birth: data.date_of_birth
          ? new Date(data.date_of_birth)
          : undefined,
        gender: data.gender || "",
      });
    }
  }, [data]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-sm text-muted-foreground">
          Loading student details...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="text-sm text-muted-foreground">
          Error loading student details
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <User className="h-12 w-12 text-gray-400" />
        <p className="text-sm text-muted-foreground">Student not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between py-6 px-10">
        <Heading
          title="Edit Student"
          description="Update student profile and academic information"
        />
      </div>

      {/* Edit Form Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Profile Information</TabsTrigger>
          <TabsTrigger value="academic">Student Information</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <div className="">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileFormSubmit)}
                    className="space-y-4"
                  >
                    <TextField
                      control={profileForm.control}
                      name="full_name"
                      label="Full Name"
                      placeholder="Enter full name"
                    />

                    <SelectField
                      control={profileForm.control}
                      name="gender"
                      label="Gender"
                      placeholder="Select gender"
                      options={USER_GENDER}
                    />

                     {/* Date of Birth Field */}
                  <DateField
                    control={profileForm.control}
                    name="date_of_birth"
                    label="Date of Birth"
                    placeholder="Select date of birth"
                  />

                    <TextField
                      control={profileForm.control}
                      name="phone"
                      label="Phone Number"
                      placeholder="Enter phone number"
                    />

                    <TextField
                      control={profileForm.control}
                      name="country"
                      label="Country"
                      placeholder="Enter country"
                    />

                    <TextField
                      control={profileForm.control}
                      name="city"
                      label="City"
                      placeholder="Enter city"
                    />

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="flex items-center space-x-2"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {updateProfileMutation.isPending
                            ? "Saving..."
                            : "Save Basic Info"}
                        </span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic" className="space-y-4">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...studentForm}>
                  <form
                    onSubmit={studentForm.handleSubmit(onStudentFormSubmit)}
                    className="space-y-4"
                  >
                    <SelectField
                      control={studentForm.control}
                      name="current_level"
                      label="Current IELTS Level"
                      placeholder="Select current level"
                      options={STUDENT_LEVEL}
                    />

                    <TextField
                      control={studentForm.control}
                      name="target_ielts_score"
                      label="Target IELTS Score"
                      placeholder="e.g., 7.0, 8.0"
                      type="number"
                    />

                    <TagsField
                      control={studentForm.control}
                      name="learning_goals"
                      label="Learning Goals"
                      placeholder="Enter a learning goal"
                    />

                    <SelectField
                      control={studentForm.control}
                      name="language_preference"
                      label="Language Preference"
                      placeholder="Select language preference"
                      options={STUDENT_LANGUAGE}
                    />

                    <TextField
                      control={studentForm.control}
                      name="bio"
                      label="Student Bio"
                      placeholder="Enter student biography"
                    />

                    <TextField
                      control={studentForm.control}
                      name="timezone"
                      label="Timezone"
                      placeholder="e.g., UTC+7, Asia/Ho_Chi_Minh"
                    />

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="flex items-center space-x-2"
                        disabled={updateStudentMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {updateStudentMutation.isPending
                            ? "Saving..."
                            : "Save Student Info"}
                        </span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentForm;
