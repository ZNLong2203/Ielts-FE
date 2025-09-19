import * as z from "zod";

const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(32, { message: "Password must be at most 32 characters long" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "Password must contain at least one special character",
  });

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: PasswordSchema,
});

export const StudentRegisterSchema = z
  .object({
    full_name: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: PasswordSchema,
    role: z.enum(["STUDENT"]),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const TeacherRegisterSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    phone: z.string().min(1, "Phone number is required"),
    date_of_birth: z.date(),
    gender: z.enum(["male", "female", "other"]),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    qualification: z.string().min(1, "Qualification is required"),
    experience_years: z.number().min(0, "Experience must be 0 or more").max(50),
    specializations: z
      .array(z.string())
      .min(1, "At least one specialization is required"),
    ielts_band_score: z.number().min(0, "Band score must be 0 or more").max(9),
    file: z.instanceof(File),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const ResetTeacherPasswordSchema = z
  .object({
    new_password: PasswordSchema,
    confirm_password: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
