"use client"

import { useState, useEffect } from "react"
import { selectUser } from "@/redux/features/user/userSlice"
import { useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  User, Mail, Calendar, Target, BookOpen, Star, Edit, 
  Loader2, TrendingUp, Award, CheckCircle2, Clock3, Trophy
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { StudentFormSchema } from "@/validation/student"
import TextField from "@/components/form/text-field"
import TagsField from "@/components/form/tags-field"
import SelectField from "@/components/form/select-field"
import { updateOwnStudentProfile, getProfile } from "@/api/profile"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { IStudentUpdate } from "@/interface/student"
import { STUDENT_LANGUAGE } from "@/constants/student"
import { Textarea } from "@/components/ui/textarea"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const StudentProfile = () => {
  const user = useSelector(selectUser)
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Optimized query with cache settings
  const { 
    data: profileData, 
    isLoading: isLoadingProfile,
    isError,
    error 
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await getProfile()
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cache on mount if data is fresh
    retry: 2, // Retry failed requests 2 times
    retryDelay: 1000, // Wait 1 second between retries
  })

  const studentData = profileData?.students || user?.students

  // Mock data for IELTS-specific information
  const ieltsData = {
    targetScore: studentData?.target_ielts_score || 7.5,
    currentScore: studentData?.current_level || 6.5,
    completedLessons: 45,
    totalLessons: 100,
    studyStreak: 12,
    skillScores: {
      listening: 7.0,
      reading: 6.5,
      writing: 6.0,
      speaking: 6.5,
    },
  }

  // Form setup
  const form = useForm<z.infer<typeof StudentFormSchema>>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: {
      bio: studentData?.bio || "",
      target_ielts_score: studentData?.target_ielts_score,
      current_level: studentData?.current_level,
      learning_goals: studentData?.learning_goals || [],
      language_preference: studentData?.language_preference || "vi",
    },
  })

  // Update form values when student data changes
  useEffect(() => {
    if (studentData) {
      form.reset({
        bio: studentData.bio || "",
        target_ielts_score: studentData.target_ielts_score,
        current_level: studentData.current_level,
        learning_goals: studentData.learning_goals || [],
        language_preference: studentData.language_preference || "vi",
      })
    }
  }, [studentData, form])

  // Optimized mutation with proper cache invalidation
  const updateMutation = useMutation({
    mutationFn: async (data: IStudentUpdate) => {
      return updateOwnStudentProfile(data)
    },
    onSuccess: (response, variables: IStudentUpdate) => {
      const typedResponse = response as { data?: { message?: string } } | undefined
      toast.success(typedResponse?.data?.message || "Profile updated successfully")
      
      // Optimistically update cache
      queryClient.setQueryData(["profile"], (old: unknown) => {
        if (!old) return old
        const previous = old as { students?: IStudentUpdate }
        return {
          ...previous,
          students: {
            ...previous.students,
            ...variables,
          },
        }
      })
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      
      setIsEditDialogOpen(false)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || "Update failed")
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })

  const onSubmit = (data: z.infer<typeof StudentFormSchema>) => {
    const updateData: IStudentUpdate = {
      bio: data.bio || undefined,
      target_ielts_score: data.target_ielts_score ? Number(data.target_ielts_score) : undefined,
      current_level: data.current_level ? Number(data.current_level) : undefined,
      learning_goals: data.learning_goals && data.learning_goals.length > 0 ? data.learning_goals : undefined,
      language_preference: data.language_preference || undefined,
    }
    updateMutation.mutate(updateData)
  }

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "ST"
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "premium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getBandColor = (score: number) => {
    if (score >= 8) return "text-purple-600 bg-purple-50"
    if (score >= 7) return "text-blue-600 bg-blue-50"
    if (score >= 6) return "text-green-600 bg-green-50"
    if (score >= 5) return "text-yellow-600 bg-yellow-50"
    return "text-orange-600 bg-orange-50"
  }

  // Loading skeleton
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 pt-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-8">
                  <Skeleton className="w-32 h-32 rounded-full mx-auto mb-6" />
                  <Skeleton className="h-6 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto mb-6" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 pt-28 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <User className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Failed to Load Profile</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || "Unable to fetch your profile data"}
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["profile"] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Profile</h1>
          <p className="text-gray-600">Manage your learning journey and track your progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="border-2 border-blue-100 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
              <CardContent className="p-8 text-center relative z-10">
                <div className="relative mb-6">
                  <Avatar className="w-36 h-36 mx-auto border-4 border-white/90 shadow-2xl ring-4 ring-blue-300/50 hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={user?.avatar || "/placeholder.svg?height=144&width=144"} />
                    <AvatarFallback className="bg-blue-500/90 text-white text-4xl font-bold">
                      {getInitials(user?.full_name || "Student")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className={`${getBandColor(ieltsData.currentScore)} border-2 border-white/50 font-bold px-4 py-1.5 shadow-lg text-base`}>
                      <Trophy className="w-4 h-4 mr-1" />
                      Band {ieltsData.currentScore}
                    </Badge>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">{user?.full_name || "IELTS Student"}</h1>
                <p className="text-blue-100 text-lg mb-6 font-medium">IELTS Preparation Student</p>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge className={`${getStatusColor(user?.status || "active")} border shadow-md`}>
                    <Star className="w-3 h-3 mr-1" />
                    {user?.status || "Active"}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 shadow-md">
                    <Target className="w-3 h-3 mr-1" />
                    Target: {ieltsData.targetScore}
                  </Badge>
                </div>

                {/* Quick Stats in Profile Card */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-400/30">
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold group-hover:scale-110 transition-transform">
                      {ieltsData.completedLessons}
                    </div>
                    <div className="text-xs text-blue-200 mt-1">Lessons</div>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold group-hover:scale-110 transition-transform">{ieltsData.studyStreak}</div>
                    <div className="text-xs text-blue-200 mt-1">Day Streak</div>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold group-hover:scale-110 transition-transform">
                      {ieltsData.totalLessons}
                    </div>
                    <div className="text-xs text-blue-200 mt-1">Total Lessons</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-900 font-bold">
                  <User className="w-5 h-5" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Email</div>
                      <div className="font-medium text-gray-800">{user?.email || "Not provided"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Role</div>
                      <div className="font-medium text-gray-800 capitalize">{user?.role || "Student"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Member Since</div>
                      <div className="font-medium text-gray-800">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Removed Last Active (last_login) since field is no longer tracked */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Learning Progress & Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Progress */}
            <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-900 font-bold text-xl">
                  <BookOpen className="w-6 h-6" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Overall Progress */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Overall Course Progress
                    </span>
                    <span className="text-lg text-blue-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm border border-blue-200">
                      {Math.round((ieltsData.completedLessons / ieltsData.totalLessons) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(ieltsData.completedLessons / ieltsData.totalLessons) * 100}
                    className="h-4 bg-white shadow-inner border border-blue-200"
                  />
                  <div className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {ieltsData.completedLessons} of {ieltsData.totalLessons} lessons completed
                  </div>
                </div>

                {/* IELTS Skills */}
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    IELTS Skills Assessment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(ieltsData.skillScores).map(([skill, score]) => (
                      <div
                        key={skill}
                        className="p-5 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm font-semibold text-gray-700 capitalize flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getBandColor(score)}`}></div>
                            {skill}
                          </div>
                          <div className={`text-2xl font-bold ${getBandColor(score)} px-3 py-1 rounded-lg`}>
                            {score}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 group-hover:scale-105 ${
                              score >= 8 ? 'bg-purple-500' :
                              score >= 7 ? 'bg-blue-500' :
                              score >= 6 ? 'bg-green-500' :
                              score >= 5 ? 'bg-yellow-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${(score / 9) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">Band {score} / 9.0</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Achievements */}
            <div className="grid grid-cols-1 gap-6">
              {/* Current Goals */}
              <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-900 font-bold text-xl">
                      <Target className="w-6 h-6" />
                      Current Goals
                    </CardTitle>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 border-blue-200 hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">Edit Student Profile</DialogTitle>
                          <DialogDescription className="text-base">
                            Update your student information and learning goals
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold">Bio</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Tell us about yourself..."
                                      className="resize-none min-h-[100px]"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <TextField
                                control={form.control}
                                name="current_level"
                                label="Current Level (IELTS Band)"
                                type="number"
                                inputMode="decimal"
                                placeholder="0.0 - 9.0"
                                min={0.0}
                                max={9.0}
                                step={0.5}
                              />
                              <TextField
                                control={form.control}
                                name="target_ielts_score"
                                label="Target IELTS Band"
                                type="number"
                                inputMode="decimal"
                                placeholder="0.0 - 9.0"
                                min={0.0}
                                max={9.0}
                                step={0.5}
                              />
                            </div>

                            <TagsField
                              control={form.control}
                              name="learning_goals"
                              label="Learning Goals"
                              placeholder="Enter a goal and press Enter"
                            />

                            <SelectField
                              control={form.control}
                              name="language_preference"
                              label="Language Preference"
                              options={STUDENT_LANGUAGE}
                              placeholder="Select language"
                            />

                            <DialogFooter className="gap-2 mt-6">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                disabled={updateMutation.isPending}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={updateMutation.isPending} className="min-w-[120px]">
                                {updateMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save Changes"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Target Band Score
                      </span>
                      <span className="text-2xl font-bold text-blue-600">{ieltsData.targetScore}</span>
                    </div>
                    <Progress 
                      value={(ieltsData.currentScore / ieltsData.targetScore) * 100} 
                      className="h-3 bg-white shadow-inner border border-blue-200"
                    />
                    <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <Clock3 className="w-4 h-4" />
                      Current: {ieltsData.currentScore} / Target: {ieltsData.targetScore}
                    </div>
                  </div>
                  
                  {studentData?.bio && (
                    <div className="p-5 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                      <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Bio
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">{studentData.bio}</div>
                    </div>
                  )}

                  {studentData?.learning_goals && studentData.learning_goals.length > 0 && (
                    <div className="p-5 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                      <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Learning Goals
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {studentData.learning_goals.map((goal: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
