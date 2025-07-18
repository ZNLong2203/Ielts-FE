import * as z from "zod";

export const ProfileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name is required" }),
  avatar: z.string().url({ message: "Invalid URL for avatar" }).optional(),
  phone: z.string().optional(),
  country: z.string().min(2, { message: "Country must be at least 2 characters long" }).optional(),
  city: z.string().min(2, { message: "City must be at least 2 characters long" }).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: z.string().optional(),
});

