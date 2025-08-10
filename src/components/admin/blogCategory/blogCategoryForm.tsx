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

import { ArrowRight, Save, FileText } from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BlogCategoryCreateSchema,
  BlogCategoryUpdateSchema,
} from "@/validation/blogCategory";
import {
  createBlogCategory,
  getBlogCategory,
  updateBlogCategory,
} from "@/api/blogCategory";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect } from "react";

const BlogCategoryForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  let title = "";
  let description = "";
  if (slug === undefined || param.slug === "") {
    title = "Add New Blog Category";
    description = "Create a new category for blog posts";
  } else {
    title = "Update Blog Category";
    description = "Update a Blog Category for blog posts";
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["blogCategory", slug],
    queryFn: () => getBlogCategory(slug),
    enabled: slug !== undefined && slug !== "",
  });

  const createBlogCategoryMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof BlogCategoryCreateSchema>) => {
      return createBlogCategory(formData);
    },
    onSuccess: (data) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({
        queryKey: ["blogCategories"],
      });
      router.push(ROUTES.ADMIN_BLOG_CATEGORIES);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create blog category.");
    },
  });

  const updateBlogCategoryMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof BlogCategoryUpdateSchema>) => {
      return updateBlogCategory(slug, formData);
    },
    onSuccess: (data) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({
        queryKey: ["blogCategories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["blogCategory"],
      });
      router.push(ROUTES.ADMIN_BLOG_CATEGORIES);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update blog category.");
    },
  });

  const blogCategoryForm = useForm<z.infer<typeof BlogCategoryCreateSchema>>({
    resolver: zodResolver(BlogCategoryCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      ordering: 0,
      is_active: true,
      slug: "",
    },
  });

  useEffect(() => {
    if (data) {
      blogCategoryForm.reset({
        name: data.name,
        description: data.description,
        ordering: data.ordering,
        is_active: data.is_active,
        slug: data.slug,
      });
    }
  }, [data]);

  const onSubmit = (formData: z.infer<typeof BlogCategoryCreateSchema>) => {
    console.log("Blog Category Form Data:", formData);
    if (slug && slug !== "") {
      return updateBlogCategoryMutation.mutate(formData);
    } else {
      // If slug is not present, create a new blog category
      return createBlogCategoryMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Blog Category Not Found"
        description="The requested blog category does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_BLOG_CATEGORIES)}
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
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <span>Back to Blog Categories</span>
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
            <Form {...blogCategoryForm}>
              <form
                onSubmit={blogCategoryForm.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    control={blogCategoryForm.control}
                    name="name"
                    label="Category Name"
                    placeholder="Enter category name"
                    required
                  />

                  <TextField
                    control={blogCategoryForm.control}
                    name="slug"
                    label="Slug"
                    placeholder="Enter URL slug"
                    required
                  />
                </div>

                <TextField
                  control={blogCategoryForm.control}
                  name="description"
                  label="Description"
                  placeholder="Enter category description"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    control={blogCategoryForm.control}
                    name="ordering"
                    label="Display Order"
                    type="number"
                    placeholder="Enter display order"
                  />

                  <FormField
                    control={blogCategoryForm.control}
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
                    disabled={createBlogCategoryMutation.isPending}
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

export default BlogCategoryForm;
