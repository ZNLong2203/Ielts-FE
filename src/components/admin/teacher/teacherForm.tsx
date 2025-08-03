"use client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import TagsField from "@/components/form/tags-field";
import DateField from "@/components/form/date-field";
import ImageUploadField from "@/components/form/image-field";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  ArrowRight,
  GraduationCap,
  Save,
  XCircle,
  UserCircle,
  Phone,
  MapPin,
  Target,
} from "lucide-react";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";

import { getTeacher, updateTeacher } from "@/api/teacher";
import { ProfileFormSchema } from "@/validation/profile";
import { TeacherFormSchema } from "@/validation/teacher";
import { updateProfile } from "@/api/profile";
import { uploadAvatar } from "@/api/file";
import { TextIconInfo } from "@/components/ui/info";
import { USER_GENDER } from "@/constants/user";

const TeacherForm = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const userId = params.userId as string;

  // Get teacher details
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["teacherDetail", userId],
    queryFn: () => getTeacher(userId),
    retry: false,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadAvatar(file, userId);
    },
    onSuccess: (data) => {
      toast.success(data.data.message || "Avatar uploaded successfully");
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
    mutationFn: (formData: z.infer<typeof ProfileFormSchema>) => {
      return updateProfile(userId, formData);
    },
    onSuccess: (data) => {
      toast.success(data.data.data.message || "Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacherDetail", userId] });
      router.push(ROUTES.ADMIN_TEACHERS);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Update teacher details
  const updateTeacherMutation = useMutation({
    mutationFn: (FormData: z.infer<typeof TeacherFormSchema>) => {
      return updateTeacher(userId, FormData);
    },
    onSuccess: (data) => {
      toast.success(data.data.data.message || "Teacher details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacherDetail", userId] });
      router.push(ROUTES.ADMIN_TEACHERS);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update teacher details");
    },
  });

  const teacherForm = useForm<z.infer<typeof TeacherFormSchema>>({
    resolver: zodResolver(TeacherFormSchema),
    defaultValues: {
      qualification: "",
      experience_years: 0,
      specializations: [],
      ielts_band_score: 0,
      teaching_style: "",
      hourly_rate: 0,
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      full_name: "",
      avatar: undefined,
      phone: "",
      country: "",
      city: "",
      date_of_birth: undefined,
      gender: "",
    },
  });

  // Handle student form submission
  const onTeacherFormSubmit = (formData: z.infer<typeof TeacherFormSchema>) => {
    console.log("Teacher Form Data:", formData);
    updateTeacherMutation.mutate(formData);
  };

  // Handle profile form submission
  const onProfileFormSubmit = (formData: z.infer<typeof ProfileFormSchema>) => {
    console.log("Profile Form Data:", formData);
    updateProfileMutation.mutate(formData);
  };

  // Handle avatar upload
  const onAvatarUpload = (file: File) => {
    console.log("Uploading avatar:", file);
    uploadAvatarMutation.mutate(file);
  };

  useEffect(() => {
    if (data) {
      teacherForm.reset({
        qualification: data?.teachers?.qualification,
        experience_years: data?.teachers?.experience_years,
        specializations: data?.teachers?.specializations,
        ielts_band_score: data?.teachers?.ielts_band_score,
        teaching_style: data?.teachers?.teaching_style,
        hourly_rate: data?.teachers?.hourly_rate,
      });
      profileForm.reset({
        full_name: data?.full_name,
        avatar: data?.avatar,
        phone: data?.phone,
        country: data?.country,
        city: data?.city,
        date_of_birth: data.date_of_birth
          ? new Date(data.date_of_birth)
          : undefined,
        gender: data?.gender,
      });
    }
  }, [data]);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Teacher Not Found"
        description="The requested teacher profile does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_TEACHERS)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
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
                title="Edit Teacher"
                description="Update teacher profile and academic information"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <span>Back to Teacher lists</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
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
                  <TextIconInfo
                    icon={UserCircle}
                    value={`Gender: ${
                      data?.gender
                        ? data.gender.charAt(0).toLocaleUpperCase() +
                          data.gender.slice(1)
                        : "Not specified"
                    }`}
                  />

                  <TextIconInfo
                    icon={Phone}
                    value={`Phone: ${data?.phone || "No phone number"}`}
                  />

                  <TextIconInfo
                    icon={MapPin}
                    value={`Location: ${
                      data?.city || data?.country || "No location"
                    }`}
                  />

                  <TextIconInfo
                    icon={Target}
                    value={`IELTS Band: ${
                      data?.teachers?.ielts_band_score || "No IELTS score"
                    }`}
                  />
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">
                    Qualification
                  </h4>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm text-center">
                    {data?.teachers?.qualification || "Not specified"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Forms */}
          <div className="lg:col-span-2 space-y-8">
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
                      onFileSelected={(file) => setSelectedAvatar(file)}
                      maxSize={2 * 1024 * 1024} // 2MB
                    />

                    {selectedAvatar && (
                      <Button
                        type="button"
                        size={"default"}
                        variant="outline"
                        onClick={() => onAvatarUpload(selectedAvatar)}
                        disabled={uploadAvatarMutation.isPending}
                      >
                        {uploadAvatarMutation.isPending
                          ? "Uploading..."
                          : "Upload Avatar"}
                      </Button>
                    )}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <span>Teacher Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...teacherForm}>
                  <form
                    onSubmit={teacherForm.handleSubmit(onTeacherFormSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={teacherForm.control}
                        name="qualification"
                        label="Qualification"
                        placeholder="Enter qualification"
                      />

                      <TextField
                        control={teacherForm.control}
                        name="experience_years"
                        label="Years of Experience"
                        type="number"
                        placeholder="Enter years of experience"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        control={teacherForm.control}
                        name="ielts_band_score"
                        label="IELTS Band Score"
                        type="number"
                        inputMode="decimal"
                        placeholder="Enter IELTS band score"
                      />
                      <TextField
                        control={teacherForm.control}
                        name="hourly_rate"
                        label="Hourly Rate (USD)"
                        type="number"
                        placeholder="Enter hourly rate in USD"
                      />

                      <TextField
                        control={teacherForm.control}
                        name="teaching_style"
                        label="Teaching Style"
                        placeholder="Describe your teaching style"
                      />
                    </div>

                    <TagsField
                      control={teacherForm.control}
                      name="specializations"
                      label="Specializations"
                      placeholder="Add specializations"
                    />

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        type="submit"
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                        disabled={updateTeacherMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {updateTeacherMutation.isPending
                            ? "Saving..."
                            : "Save Teacher Info"}
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

export default TeacherForm;
