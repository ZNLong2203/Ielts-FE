"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import FileUploadField from "@/components/form/file-field";
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
import { createTeacherBlog, getTeacherBlogDetail, updateTeacherBlog } from "@/api/blog";
import { BlogCreateSchema, BlogUpdateSchema } from "@/validation/blog";
import { useEffect, useState } from "react";
import {
  Eye,
  FileText,
  ImageIcon,
  Tag,
  BookOpen,
  Users,
  Star,
  PenTool,
  Save,
  Settings,
} from "lucide-react";
import ROUTES from "@/constants/route";
import { getBlog } from "@/api/blog";
import { getBlogCategories } from "@/api/blogCategory";
import TagsField from "@/components/form/tags-field";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/userSlice";

const TeacherBlogForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const slug = Array.isArray(param.slug) ? param.slug[0] : param.slug;

  let title = "";
  let description = "";

  if (slug === undefined || param.slug === "") {
    title = "Create New Blog Post";
    description =
      "Share your teaching insights and expertise with the community";
  } else {
    title = "Edit Blog Post";
    description = "Update your blog content and insights";
  }

  // Teacher-specific blog creation
  const createBlogMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof BlogCreateSchema>) => {
      return createTeacherBlog(formData);
    },
    onSuccess: (data) => {
      toast.success("Blog post created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["teacherBlogs"],
      });
      router.push(ROUTES.TEACHER_BLOGS);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create blog post"
      );
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof BlogUpdateSchema>) => {
        return updateTeacherBlog(slug, formData);
    },
    onSuccess: (data) => {
      toast.success("Blog post updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["teacherBlogs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["blog", slug],
      });
      router.push(ROUTES.TEACHER_BLOGS);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update blog post"
      );
    },
  });

  // Get blog detail
  const { data: blogData, isPending: isBlogPending } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => getTeacherBlogDetail(slug),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Teacher-styled Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <PenTool className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{isPreviewMode ? "Edit" : "Preview"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...blogForm}>
          <form
            className="space-y-8"
            onSubmit={blogForm.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Teacher Writing Guidelines */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-green-900 mb-1">
                          Teaching Blog Guidelines
                        </h4>
                        <p className="text-sm text-green-800">
                          Share your IELTS teaching experience, student success
                          stories, study tips, and educational insights to help
                          the learning community.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Blog Content */}
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
                      label="Post Title"
                      placeholder="e.g., '5 Proven Strategies to Improve IELTS Speaking Scores'"
                      required
                      className="text-lg"
                    />

                    <div>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <PenTool className="h-4 w-4" />
                        Content
                      </FormLabel>
                      <Controller
                        name="content"
                        control={blogForm.control}
                        render={({ field }) => (
                          <RichTextField
                            content={field.value}
                            onChange={field.onChange}
                            placeholder="Start writing your teaching insights... Share your experience, tips, and strategies that have worked for your students."
                            minHeight="450px"
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
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                      <span>Featured Image</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploadField
                      control={blogForm.control}
                      name="file"
                      label="Upload Featured Image"
                      accept="image/*"
                      maxSize={5}
                      description="Upload an image that represents your blog content (Max 5MB)"
                      currentImage={blogData?.image}
                    />
                  </CardContent>
                </Card>

                {/* Tags & Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-orange-600" />
                      <span>Tags & Topics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TagsField
                      control={blogForm.control}
                      name="tags"
                      label="Tags"
                      placeholder="Add tags (e.g., IELTS, Speaking, Writing, Tips)"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Teacher Profile Card */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-700">
                      <Users className="h-5 w-5" />
                      <span>Author Info</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                        T
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user?.full_name || "Teacher Name"}
                        </p>
                        <p className="text-sm text-gray-600">
                          IELTS Instructor
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>5+ years experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>200+ students taught</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full flex items-center space-x-2 bg-green-600 hover:bg-green-700"
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

                {/* Tips for Teachers */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-blue-700 text-sm">
                      Writing Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-blue-800">
                    <p>• Share practical teaching strategies</p>
                    <p>• Include student success stories</p>
                    <p>• Provide actionable IELTS tips</p>
                    <p>• Use clear, educational language</p>
                    <p>• Add relevant examples and exercises</p>
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

export default TeacherBlogForm;
