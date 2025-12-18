"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, EyeIcon, EyeOffIcon } from "lucide-react";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";

import { Login } from "@/api/auth";
import { LoginSchema } from "@/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { API_URL } from "@/constants/api";
import ROUTES from "@/constants/route";
import { loginSuccess } from "@/redux/features/user/userSlice";
import { useDispatch } from "react-redux";

const LoginForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: loginHandler, isPending } = useMutation({
    mutationFn: Login,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    },
    onSuccess: (response) => {
      const { user, access_token } = response.data.data;

      // Save to redux store
      dispatch(loginSuccess({ user, accessToken: access_token }));
      router.push(ROUTES.HOME);
      toast.success(response.data.message);
    },
  });

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    loginHandler(data);
  };

  const handleGoogleLogin = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    window.location.href = `${baseUrl}${API_URL.GOOGLE_LOGIN}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-clip-text text-blue-600"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-balance text-sm text-muted-foreground max-w-xs"
            >
              Sign in to your account to continue your IELTS journey
            </motion.p>
          </div>

          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="grid gap-2"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="your.email@example.com"
                        required
                        className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              ></FormField>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="grid gap-2"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">
                        Password
                      </FormLabel>
                      <a
                        href="#"
                        className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="********"
                          required
                          className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 backdrop-blur-sm focus-visible:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          suppressHydrationWarning={true}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              ></FormField>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-900 text-white transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isPending}
                suppressHydrationWarning={true}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>

            <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-11 rounded-xl border-muted-foreground/20 hover:bg-muted/50 transition-all duration-300"
                suppressHydrationWarning={true}
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm"
          >
            Don&apos;t have an account?{" "}
            <a
              href={ROUTES.STUDENT_REGISTER}
              className="text-blue-700 hover:text-blue-800 transition-colors font-medium"
            >
              Create an account
            </a>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
};

export default LoginForm;
