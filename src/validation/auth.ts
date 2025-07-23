import * as z from "zod";

const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(32, { message: "Password must be at most 32 characters long" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
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
    full_name: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: PasswordSchema,
    phone: z.string().min(10, { message: "Phone number is required" }),
    date_of_birth: z.date(),
    gender: z.enum(["male", "female", "other"], { message: "Gender is required" }),
    country: z.string().min(2, { message: "Country is required" }),
    qualification: z.string().min(2, { message: "Qualification is required" }),
    experience_years: z
      .number()
      .int()
      .min(0, { message: "Experience years must be a positive integer" }),
    specializations: z
      .array(z.string().min(2, { message: "Specialization must be at least 2 characters long" }))
      .min(1, { message: "At least one specialization is required" }),
    ielts_band_score: z
      .number()
        .min(0, { message: "IELTS band score must be a positive number" })
        .max(9, { message: "IELTS band score must be at most 9" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
