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

export const RegisterSchema = z.object({
    full_name: z.string().min(2, { message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: PasswordSchema,
    role: z.enum(["STUDENT", "TEACHER"], {
        message: "Role must be either 'student' or 'teacher'",
    }),
    confirmPassword: z.string().min(8, { message: "Confirm Password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})
