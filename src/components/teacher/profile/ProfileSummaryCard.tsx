"use client";

import { Card } from "@/components/ui/card";
import { useUpdateAvatarMutation } from "@/hooks/useTeacherProfile";
import { IUser } from "@/interface/user";
import { Camera, CheckCircle, Mail, User } from "lucide-react";
import Image from "next/image";
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
    <Card className="overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative bg-slate-800 p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
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
              className="w-28 h-28 rounded-full bg-white flex items-center justify-center ring-4 ring-white/20 group-hover:ring-white/40 transition-all duration-300 cursor-pointer relative overflow-hidden shadow-lg"
              onClick={handleAvatarClick}
            >
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.full_name || "User"}
                  className="w-full h-full rounded-full object-cover"
                  width={100}
                  height={100}
                />
              ) : (
                <User className="w-14 h-14 text-slate-600" />
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>

              {/* Loading overlay */}
              {updateAvatarMutation.isPending && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-600 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">
              {profile.full_name}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 border border-white/20">
                <Mail className="w-4 h-4 text-white/90" />
                <span className="text-sm font-medium text-white">{profile.email}</span>
              </div>
              {profile.email_verified && (
                <div className="flex items-center gap-1.5 bg-green-600/20 rounded-lg px-3 py-2 border border-green-500/30">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-medium text-green-100">
                    Verified
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSummaryCard;
