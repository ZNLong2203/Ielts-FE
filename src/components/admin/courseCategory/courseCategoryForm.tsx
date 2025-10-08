"use client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";

import { ArrowRight, Save, FileText, FolderOpen } from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect } from "react";
import {
  CourseCategoryCreateSchema,
  CourseCategoryUpdateSchema,
} from "@/validation/courseCategory";
import {
  getCourseCategory,
  createCourseCategory,
  updateCourseCategory,
} from "@/api/courseCategory";

const CourseCategoryForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  let title = "";
  let description = "";
  if (slug === undefined || param.slug === "") {
    title = "Add Course Category";
    description = "Create a new category for courses";
  } else {
    title = "Update Course Category";
    description = "Update a Course Category for courses";
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courseCategory", slug],
    queryFn: () => getCourseCategory(slug),
    enabled: slug !== undefined && slug !== "",
  });

  const createCourseCategoryMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseCategoryCreateSchema>) =>
      createCourseCategory(formData),
    onSuccess: (data) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({ queryKey: ["courseCategories"] });
      router.push(ROUTES.ADMIN_COURSE_CATEGORIES);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateCourseCategoryMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CourseCategoryUpdateSchema>) =>
      updateCourseCategory(slug, formData),
    onSuccess: () => {
      toast.success("Course category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["courseCategories"] });
      queryClient.invalidateQueries({ queryKey: ["courseCategory"] });

      router.push(ROUTES.ADMIN_COURSE_CATEGORIES);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const courseCategoryForm = useForm({
    resolver: zodResolver(CourseCategoryCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      ordering: 0,
      icon: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (data) {
      courseCategoryForm.reset(data);
    }
  }, [data, courseCategoryForm]);

  const onSubmit = (formData: z.infer<typeof CourseCategoryCreateSchema>) => {
    console.log("Course category form submitted:", formData);
    if (slug === undefined || param.slug === "") {
      return createCourseCategoryMutation.mutate(formData);
    } else {
      return updateCourseCategoryMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Course Category Not Found"
        description="The requested course category does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_COURSE_CATEGORIES)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <span>Back to Course Categories</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Blog Category Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...courseCategoryForm}>
              <form
                onSubmit={courseCategoryForm.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    control={courseCategoryForm.control}
                    name="name"
                    label="Category Name"
                    placeholder="Enter course category name"
                    required
                  />

                  <TextField
                    control={courseCategoryForm.control}
                    name="icon"
                    label="Icon"
                    placeholder="Enter course category icon"
                    required
                  />
                </div>

                <TextField
                  control={courseCategoryForm.control}
                  name="description"
                  label="Description"
                  placeholder="Enter course category description"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    control={courseCategoryForm.control}
                    name="ordering"
                    label="Display Order"
                    type="number"
                    placeholder="Enter display order"
                  />

                  <FormField
                    control={courseCategoryForm.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            Active Status
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable or disable this category
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                    disabled={createCourseCategoryMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {slug && slug !== ""
                        ? "Update Category"
                        : "Create Category"}
                    </span>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseCategoryForm;
