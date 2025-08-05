"use client";
import {
  Form,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import FileUploadField from "@/components/form/file-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextField from "@/components/richTextEditor";
import { Switch } from "@/components/ui/switch";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createBlog } from "@/api/blog";
import { BlogCreateSchema } from "@/validation/blog";
import { useState } from "react";
import {
  Save,
  Eye,
  FileText,
  Image,
  Tag,
  Settings,
} from "lucide-react";
import ROUTES from "@/constants/route";
import { getBlogCategories } from "@/api/blogCategory";
import TagsField from "@/components/form/tags-field";

const BlogForm = () => {
  const router = useRouter();
  const param = useParams();

  const createBlogMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof BlogCreateSchema>) => {
      return createBlog(formData);
    },
    onSuccess: () => {
      router.push(ROUTES.ADMIN_BLOGS);
    },
  });

  const { data: blogCategories, isPending: isCategoriesPending } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: () => getBlogCategories({ page: 1 }),
  });

  const categoriesOptions = blogCategories?.result?.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const blogForm = useForm<z.infer<typeof BlogCreateSchema>>({
    resolver: zodResolver(BlogCreateSchema),
    defaultValues: {
      category_id: "",
      title: "",
      content: "",
      tags: [],
      file: null,
    },
  });

  const onSubmit = async (data: z.infer<typeof BlogCreateSchema>) => {
    console.log("Blog data:", data);
    const formData = {
      ...data,
      tags,
    };
    createBlogMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Heading
                title="Create New Blog Post"
                description="Write and publish your blog content"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  /* Preview logic */
                }}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...blogForm}>
          <form
            onSubmit={blogForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Blog Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TextField
                      control={blogForm.control}
                      name="title"
                      label="Blog Title"
                      placeholder="Enter an engaging blog title..."
                      required
                      className="text-lg font-medium"
                    />
                    <div>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                        Content
                      </FormLabel>
                      <Controller
                        name="content"
                        control={blogForm.control}
                        render={({ field }) => (
                          <RichTextField
                            content={field.value}
                            onChange={field.onChange}
                            placeholder="Start writing your blog content..."
                            minHeight="400px"
                          />
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Image className="h-5 w-5 text-green-600" />
                      <span>Featured Image</span>content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploadField
                      control={blogForm.control}
                      name="file"
                      label="Upload Featured Image"
                      accept="image/*"
                      maxSize={5}
                      description="Recommended size: 1200x630px for best social media sharing"
                    />
                  </CardContent>
                </Card>

                {/* Tags Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-purple-600" />
                      <span>Tags</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TagsField
                      control={blogForm.control}
                      name="tags"
                      label="Tags"
                      placeholder="Add a tag..."
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <span>Options</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SelectField
                      control={blogForm.control}
                      name="category_id"
                      label="Category"
                      placeholder="Select category"
                      options={categoriesOptions ?? []}
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        disabled={createBlogMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {createBlogMutation.isPending
                            ? "Creating..."
                            : "Create Blog Post"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BlogForm;
