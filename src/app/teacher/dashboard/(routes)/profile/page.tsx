"use client";

import ChangePasswordCard from "@/components/teacher/profile/ChangePasswordCard";
import PersonalInformationCard from "@/components/teacher/profile/PersonalInformationCard";
import ProfessionalInformationCard from "@/components/teacher/profile/ProfessionalInformationCard";
import ProfileSummaryCard from "@/components/teacher/profile/ProfileSummaryCard";
import { Badge } from "@/components/ui/badge";
import Error from "@/components/ui/error";
import Heading from "@/components/ui/heading";
import Loading from "@/components/ui/loading";
import {
  useTeacherProfile,
  useUpdateTeacherMutation,
  useUpdateUserMutation,
} from "@/hooks/useTeacherProfile";
import { useState } from "react";

const TeacherProfilePage = () => {
  const { data: profile, isLoading, error } = useTeacherProfile();
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);

  const updateUserMutation = useUpdateUserMutation({
    onSuccess: () => {
      setIsEditingUser(false);
    },
  });

  const updateTeacherMutation = useUpdateTeacherMutation({
    onSuccess: () => {
      setIsEditingTeacher(false);
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error title="Failed to load profile" />;
  if (!profile) return <Error title="No profile data available" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Heading
              title="Teacher Profile"
              description="Manage your personal and professional information"
            />
          </div>
          <Badge
            variant="outline"
            className={`${
              profile.teachers?.status === "approved"
                ? "bg-green-100 text-green-800 border-green-300 shadow-sm"
                : "bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm"
            } px-4 py-2 text-sm font-semibold w-fit uppercase tracking-wide`}
          >
            {profile.teachers?.status || "Pending"}
          </Badge>
        </div>

        {/* Profile Summary Card */}
        <ProfileSummaryCard profile={profile} />

        {/* Information Cards Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PersonalInformationCard
            profile={profile}
            onUpdate={updateUserMutation.mutate}
            isUpdating={updateUserMutation.isPending}
            isEditing={isEditingUser}
            setIsEditing={setIsEditingUser}
          />
          <ProfessionalInformationCard
            teacher={{
              is_verified: profile.email_verified,
              ...profile.teachers,
            }}
            onUpdate={updateTeacherMutation.mutate}
            isUpdating={updateTeacherMutation.isPending}
            isEditing={isEditingTeacher}
            setIsEditing={setIsEditingTeacher}
          />
        </div>

        {/* Change Password Section */}
        <ChangePasswordCard />
      </div>
    </div>
  );
};

export default TeacherProfilePage;
