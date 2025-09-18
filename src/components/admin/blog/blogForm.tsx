"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import FileUploadField from "@/components/form/file-field";
import { TextBadgeInfo } from "@/components/ui/info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import RichTextField from "@/components/richTextEditor";
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBlog } from "@/api/blog";
import { BlogCreateSchema, BlogUpdateSchema } from "@/validation/blog";
import { useEffect, useState } from "react";
import {
  Save,
  Eye,
  FileText,
  ImageIcon,
  Tag,
  Settings,
  Loader2,
  Shield,
  RefreshCw,
} from "lucide-react";
import ROUTES from "@/constants/route";
import {
  getBlog,
  updateBlogByAdmin,
  publishBlog,
  draftBlog,
  archiveBlog,
} from "@/api/blog";
import { getBlogCategories } from "@/api/blogCategory";
import TagsField from "@/components/form/tags-field";
import toast from "react-hot-toast";

const BlogForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  let title = "";
  let description = "";
  if (slug === undefined || param.slug === "") {
    title = "Create New Blog Post";
    description = "Write and publish your blog content";
  } else {
    title = "Update Blog Post";
    description = "Update your blog content";
  }

  const createBlogMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof BlogCreateSchema>) => {
      return createBlog(formData);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });
      router.push(ROUTES.ADMIN_BLOGS);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof BlogUpdateSchema>) => {
      return updateBlogByAdmin(slug, formData);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["blog"],
      });
      router.push(ROUTES.ADMIN_BLOGS);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateBlogStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (status === "published") {
        return publishBlog(slug);
      } else if (status === "draft") {
        return draftBlog(slug);
      } else if (status === "archived") {
        return archiveBlog(slug);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setCurrentStatus(data.data.status);
      queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["blog"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Get blog detail
  const { data: blogData, isPending: isBlogPending } = useQuery({
    queryKey: ["blogs", slug],
    queryFn: () => getBlog(slug),
    enabled: slug !== undefined && slug !== "",
  });

  // Get blog categories
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
      is_featured: false,
    },
  });

  useEffect(() => {
    if (blogData) {
      setCurrentStatus(blogData.status);
      blogForm.reset({
        category_id: blogData.category_id,
        title: blogData.title,
        content: blogData.content,
        tags: blogData.tags,
        is_featured: blogData.is_featured,
      });
    }
  }, [blogData, blogForm]);

  const onSubmit = async (formData: z.infer<typeof BlogCreateSchema>) => {
    console.log("Blog data:", formData);
    if (slug && slug !== "") {
      return updateBlogMutation.mutate({
        ...formData,
        is_featured: formData.is_featured ?? false,
      } as z.infer<typeof BlogUpdateSchema>);
    } else {
      return createBlogMutation.mutate(formData);
    }
  };

  const BLOG_STATUS = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Heading title={title} description={description} />
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
                      <ImageIcon className="h-5 w-5 text-green-600" />
                      <span>Featured Image Content</span>
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
                      currentImage={blogData?.image}
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

                    {/* Featured Switch */}
                    <FormField
                      control={blogForm.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">
                              Featured Post
                            </FormLabel>
                            <FormDescription className="text-sm text-muted-foreground">
                              Display this post prominently on the homepage
                            </FormDescription>
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
                  </CardContent>
                </Card>

                {/* Status Change Section */}
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardHeader className="">
                   <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Blog Status Management</span>
                </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current Status Display */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Current Status
                          </h4>
                          <p className="text-sm text-gray-600">
                            Account status
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <TextBadgeInfo status={currentStatus} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Blog Status
                          </label>
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              updateBlogStatusMutation.mutate(e.target.value)
                            }
                            disabled={updateBlogStatusMutation.isPending}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            {BLOG_STATUS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end">
                          <Button
                            onClick={() => {
                              const select = document.querySelector(
                                "select"
                              ) as HTMLSelectElement;
                              if (select) {
                                updateBlogStatusMutation.mutate(select.value);
                              }
                            }}
                            disabled={updateBlogStatusMutation.isPending}
                            variant="outline"
                            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            {updateBlogStatusMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update Status
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
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
                          {slug && slug !== ""
                            ? "Update Blog Post"
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
