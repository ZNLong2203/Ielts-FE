"use client";

import { Card } from "@/components/ui/card";
import { useUpdateAvatarMutation } from "@/hooks/useTeacherProfile";
import { IUser } from "@/interface/user";
import { Camera, CheckCircle, Mail, Star, User } from "lucide-react";
import { useRef } from "react";

interface ProfileSummaryCardProps {
  profile: IUser;
}

const ProfileSummaryCard = ({ profile }: ProfileSummaryCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateAvatarMutation = useUpdateAvatarMutation();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      updateAvatarMutation.mutate(file);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 group-hover:ring-white/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
              onClick={handleAvatarClick}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.full_name || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 text-white" />
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>

              {/* Loading overlay */}
              {updateAvatarMutation.isPending && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-white drop-shadow-md">
              {profile.full_name}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3 text-white/90">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{profile.email}</span>
              </div>
              {profile.email_verified && (
                <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <CheckCircle className="w-4 h-4 text-green-200" />
                  <span className="text-sm font-medium text-green-100">
                    Verified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* IELTS Score Badge */}
          {profile.teachers && (
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow-md" />
                  <span className="text-4xl font-bold text-white drop-shadow-md">
                    {profile.teachers.ielts_band_score || "N/A"}
                  </span>
                </div>
                <p className="text-sm font-medium text-white/90">
                  IELTS Band Score
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProfileSummaryCard;
