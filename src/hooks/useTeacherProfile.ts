import { Logout } from "@/api/auth";
import {
  getProfile,
  updateAvatar,
  updateCertificate,
  updateOwnProfile,
  updateOwnTeacherProfile,
  updatePassword,
} from "@/api/profile";
import ROUTES from "@/constants/route";
import { ITeacherUpdate } from "@/interface/teacher";
import { IUserUpdate } from "@/interface/user";
import { logout } from "@/redux/features/user/userSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

// Fetch profile
export const useTeacherProfile = () => {
  return useQuery({
    queryKey: ["teacher-profile"],
    queryFn: async () => {
      const response = await getProfile();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

// Update user profile mutation
export const useUpdateUserMutation = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
} = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IUserUpdate) => updateOwnProfile(data),
    onSuccess: async (response) => {
      toast.success("User profile updated successfully! 🎉");
      qc.invalidateQueries({ queryKey: ["teacher-profile"] });

      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update user profile"
      );

      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};

// Update teacher profile mutation
export const useUpdateTeacherMutation = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
} = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ITeacherUpdate) => updateOwnTeacherProfile(data),
    onSuccess: async (response) => {
      toast.success("Teacher profile updated successfully! 🎉");
      qc.invalidateQueries({ queryKey: ["teacher-profile"] });

      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update teacher profile"
      );

      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};

// Update password mutation
export const useUpdatePasswordMutation = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
} = {}) => {
  return useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }) => updatePassword(data),
    onSuccess: async (response) => {
      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update password"
      );

      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};

// Update avatar mutation
export const useUpdateAvatarMutation = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
} = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => updateAvatar(file),
    onSuccess: async (response) => {
      toast.success("Avatar updated successfully! 🎉");
      qc.invalidateQueries({ queryKey: ["teacher-profile"] });

      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update avatar");

      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};

// Update certificate mutation
export const useUpdateCertificateMutation = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
} = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => updateCertificate(file),
    onSuccess: async (response) => {
      toast.success("Certificate updated successfully! 🎉");
      qc.invalidateQueries({ queryKey: ["teacher-profile"] });

      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update certificate"
      );

      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};

// Logout mutation
export const useLogoutMutation = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
} = {}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: () => Logout(),
    onSuccess: async (response) => {
      toast.success(
        "Password updated successfully! You must login again to continue."
      );
      dispatch(logout());
      router.push(ROUTES.LOGIN);
      if (onSuccessProp) {
        onSuccessProp(response);
      }
    },
    onError: (error: any) => {
      toast.error("Failed to logout");

      if (onErrorProp) {
        onErrorProp(error);
      }
    },
  });
};
