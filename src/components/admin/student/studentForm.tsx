"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import ROUTES from "@/constants/route";
import toast from "react-hot-toast";

import { StudentFormSchema } from "@/validation/student";
import { ProfileFormSchema } from "@/validation/profile";
import { getStudent, updateStudent } from "@/api/student";
import { updateProfile } from "@/api/profile";

const StudentForm = () => {
    const params = useParams();
    const router = useRouter();

    const userId = params.userId as string;

    // Get student details
    const { data, isPending, isError } = useQuery({
        queryKey: ["studentDetail", userId],
        queryFn: () => getStudent(userId),
        retry: false,
    });

    const studentId = data?.students?.id

    // Update profile form
    const updateProfileMutation = useMutation({
        mutationFn: async (formData: z.infer<typeof ProfileFormSchema>) => {
           const updatedFormData = {
               ...formData,
               date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : undefined
           };
           updateProfile(updatedFormData, studentId);
        },
        onSuccess: () => {
            toast.success("Student details updated successfully");
            router.push(ROUTES.ADMIN_STUDENTS);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update student details");
        },
    })

    // Update student details
    const updateStudentMutation = useMutation({
        mutationFn: async (formData: z.infer<typeof StudentFormSchema>) => {
           updateStudent(studentId, formData);
        },
        onSuccess: () => {
            toast.success("Student details updated successfully");
            router.push(ROUTES.ADMIN_STUDENTS);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update student details");
        },
    });

    // Student form
    const studentForm = useForm<z.infer<typeof StudentFormSchema>>({
        resolver: zodResolver(StudentFormSchema),
        defaultValues: data?.data,
    });

    // Profile form
    const profileForm = useForm<z.infer<typeof ProfileFormSchema>>({
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: response?.
    })

    // Handle student form submission
    const onStudentFormSubmit = (formData: z.infer<typeof StudentFormSchema>) => {
        updateStudentMutation.mutate(formData);
    }


    return (
        <div>
        </div>
    )
};

export default StudentForm;
