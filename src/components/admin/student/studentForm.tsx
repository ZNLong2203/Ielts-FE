"use client";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import TagsField from "@/components/form/tags-field";
import DateField from "@/components/form/date-field";
import ImageUploadField from "@/components/form/image-field";
import Loading from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  GraduationCap,
  Save,
  XCircle,
  ArrowLeft,
  UserCircle,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Target,
  BookOpen,
  Clock,
  Languages,
} from "lucide-react";
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
import { uploadAvatar } from "@/api/file";
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
  
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadAvatar(file);
    },
    onSuccess: (data) => {
      toast.success(data.data.data.message || "Avatar uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: ["studentDetail", userId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload avatar");
    },
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
    defaultValues: {
      bio: "",
      current_level: "",
      language_preference: "",
      learning_goals: [],
      target_ielts_score: undefined,
      timezone: "",
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      full_name: "",
      avatar: "",
      phone: "",
      country: "",
      city: "",
      date_of_birth: undefined,
      gender: "",
    },
  });

  // Handle student form submission
  const onStudentFormSubmit = (formData: z.infer<typeof StudentFormSchema>) => {
    console.log("Student Form Data:", formData);
    updateStudentMutation.mutate(formData);
  };

  // handle profile form submission
  const onProfileFormSubmit = (formData: z.infer<typeof ProfileFormSchema>) => {
    console.log("Profile Form Data:", formData);

    if (formData.avatar && formData.avatar instanceof File) {
      uploadAvatarMutation.mutate(formData.avatar);
    }
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
        full_name: data?.full_name || "",
        avatar: data?.avatar || "",
        city: data?.city || "",
        country: data?.country || "",
        phone: data?.phone && data.phone.trim() !== "" ? data.phone : undefined,
        date_of_birth: data.date_of_birth
          ? new Date(data.date_of_birth)
          : undefined,
        gender: data?.gender || "",
      });
    }
  }, [data]);

  if (isPending) {
    return <Loading />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Heading
                title="Edit Student"
                description="Update student profile and academic information"
              />
            </div>

            {/* Student Avatar & Basic Info */}
            {data && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={data.avatar} />
                  <AvatarFallback>
                    {data.full_name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{data.full_name}</p>
                  <p className="text-sm text-gray-500">{data.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center pb-4">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={data?.avatar} />
                  <AvatarFallback className="text-2xl">
                    {data?.full_name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {data?.full_name || "Student"}
                </CardTitle>
                <p className="text-sm text-gray-500">{data?.email}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <UserCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {data?.gender
                        ? data.gender.charAt(0).toLocaleUpperCase() +
                          data.gender.slice(1)
                        : "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {data?.phone || "No phone"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {data?.city || data?.country || "No location"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Target: {data?.students?.target_ielts_score || "Not set"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">
                    Current Level
                  </h4>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm text-center">
                    {data?.students?.current_level || "Not specified"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onProfileFormSubmit)}
                    className="space-y-6"
                  >
                    <ImageUploadField
                      control={profileForm.control}
                      name="avatar"
                      label="Profile Avatar"
                      currentImage={data?.avatar}
                      fallback={data?.full_name?.charAt(0) || "S"}
                      maxSize={2 * 1024 * 1024} // 2MB
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {updateProfileMutation.isPending
                            ? "Saving..."
                            : "Save Profile Info"}
                        </span>
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <span>Student Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...studentForm}>
                  <form
                    onSubmit={studentForm.handleSubmit(onStudentFormSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField
                        control={studentForm.control}
                        name="language_preference"
                        label="Language Preference"
                        placeholder="Select language preference"
                        options={STUDENT_LANGUAGE}
                      />

                      <TextField
                        control={studentForm.control}
                        name="timezone"
                        label="Timezone"
                        placeholder="e.g., UTC+7, Asia/Ho_Chi_Minh"
                      />
                    </div>

                    <TagsField
                      control={studentForm.control}
                      name="learning_goals"
                      label="Learning Goals"
                      placeholder="Enter a learning goal and press Enter"
                    />

                    <TextField
                      control={studentForm.control}
                      name="bio"
                      label="Student Biography"
                      placeholder="Tell us about this student's background and goals..."
                    />

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
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
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
