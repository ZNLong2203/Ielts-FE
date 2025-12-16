"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IUser, IUserUpdate } from "@/interface/user";
import {
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PersonalInformationCardProps {
  profile: IUser;
  onUpdate: (data: IUserUpdate) => void;
  isUpdating: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PersonalInformationCard = ({
  profile,
  onUpdate,
  isUpdating,
  isEditing,
  setIsEditing,
}: PersonalInformationCardProps) => {
  const [form, setForm] = useState<IUserUpdate>({
    full_name: "",
    phone: "",
    date_of_birth: undefined,
    gender: "",
    country: "",
    city: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth,
        gender: profile.gender || "",
        country: profile.country || "",
        city: profile.city || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(form);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  const getDateInputValue = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              Personal Information
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Your basic profile details
            </p>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {!isEditing ? (
          <div>
            <InfoRow
              icon={Mail}
              label="Email"
              value={profile.email || "Not set"}
              isReadonly
            />
            <InfoRow
              icon={User}
              label="Full Name"
              value={profile.full_name || "Not set"}
            />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={profile.phone || "Not set"}
            />
            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(profile.date_of_birth)}
            />
            <InfoRow
              icon={User}
              label="Gender"
              value={profile.gender || "Not set"}
            />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={
                profile.country && profile.city
                  ? `${profile.city}, ${profile.country}`
                  : "Not set"
              }
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="full_name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                required
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="date_of_birth"
                className="text-sm font-medium text-gray-700"
              >
                Date of Birth
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={getDateInputValue(form.date_of_birth)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date_of_birth: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-sm font-medium text-gray-700"
              >
                Gender
              </Label>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-gray-700"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-gray-700"
                >
                  City
                </Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  isReadonly = false,
}: {
  icon: any;
  label: string;
  value: string;
  isReadonly?: boolean;
}) => {
  return (
    <div
      className={`flex items-start gap-3 py-3 border-b last:border-b-0 ${
        isReadonly ? "bg-gray-50" : ""
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          isReadonly ? "bg-gray-100" : "bg-gray-50"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${
            isReadonly ? "text-gray-400" : "text-gray-600"
          }`}
        />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
          {label}
          {isReadonly && (
            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
              READ ONLY
            </span>
          )}
        </p>
        <p
          className={`text-sm font-medium mt-1 ${
            isReadonly ? "text-gray-500" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default PersonalInformationCard;
