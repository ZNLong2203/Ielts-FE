import * as z from "zod";

export const ProfileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name is required" }),
  avatar: z.union([z.string(), z.any()]).optional(), // Support both string URL and File
  phone: z.string().or(z.undefined()),
  country: z.string().or(z.undefined()),
  city: z.string().or(z.undefined()),
  gender: z.string().or(z.undefined()),
  date_of_birth: z.date().or(z.undefined()),
});