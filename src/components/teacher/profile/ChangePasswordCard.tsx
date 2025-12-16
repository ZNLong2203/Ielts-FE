"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useLogoutMutation,
  useUpdatePasswordMutation,
} from "@/hooks/useTeacherProfile";
import { Eye, EyeOff, Lock, Save } from "lucide-react";
import { useState } from "react";

const ChangePasswordCard = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const logoutMutation = useLogoutMutation();

  const updatePasswordMutation = useUpdatePasswordMutation({
    onSuccess: () => {
      // Call logout after password change success
      logoutMutation.mutate();
    },
  });

  const validateForm = () => {
    const newErrors = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };

    if (!form.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!form.new_password) {
      newErrors.new_password = "New password is required";
    } else if (form.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]/.test(
        form.new_password
      )
    ) {
      newErrors.new_password =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (form.new_password !== form.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      updatePasswordMutation.mutate(form);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b bg-white">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-600" />
          Change Password
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Update your password to keep your account secure
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {/* Fake inputs to prevent autofill */}
          <input
            type="password"
            name="fake_password"
            tabIndex={-1}
            className="hidden"
          />

          {/* Current Password */}
          <div className="space-y-2">
            <Label
              htmlFor="current_password"
              className="text-sm font-medium text-gray-700"
            >
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current_password"
                name="current_password"
                type={showCurrentPassword ? "text" : "password"}
                value={form.current_password}
                onChange={(e) => {
                  setForm({ ...form, current_password: e.target.value });
                  setErrors({ ...errors, current_password: "" });
                }}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                className={`pr-10 ${
                  errors.current_password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.current_password}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="new_password"
              className="text-sm font-medium text-gray-700"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new_password"
                name="new_password"
                type={showNewPassword ? "text" : "password"}
                value={form.new_password}
                onChange={(e) => {
                  setForm({ ...form, new_password: e.target.value });
                  setErrors({ ...errors, new_password: "" });
                }}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className={`pr-10 ${
                  errors.new_password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-xs text-red-500 mt-1">{errors.new_password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, number,
              and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirm_password"
              className="text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirm_password}
                onChange={(e) => {
                  setForm({ ...form, confirm_password: e.target.value });
                  setErrors({ ...errors, confirm_password: "" });
                }}
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className={`pr-10 ${
                  errors.confirm_password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              updatePasswordMutation.isPending || logoutMutation.isPending
            }
          >
            <Save className="w-4 h-4 mr-2" />
            {updatePasswordMutation.isPending || logoutMutation.isPending
              ? "Updating..."
              : "Update Password"}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChangePasswordCard;
