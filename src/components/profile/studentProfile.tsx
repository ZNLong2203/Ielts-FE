"use client"

import { selectUser } from "@/redux/features/user/userSlice"
import { useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, Clock, Target, BookOpen, Globe, Star } from "lucide-react"

const StudentProfile = () => {
  const user = useSelector(selectUser)

  // Mock data for IELTS-specific information (you can replace with real data)
  const ieltsData = {
    targetScore: 7.5,
    currentScore: 6.5,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 pt-28">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="border-blue-200 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-2xl ring-4 ring-blue-300/50">
                    <AvatarImage src="/placeholder.svg?height=128&width=128" />
                    <AvatarFallback className="bg-blue-500 text-white text-3xl font-bold">
                      {getInitials(user?.students?.full_name || "Student")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-white text-blue-700 font-semibold px-3 py-1 shadow-lg">
                      Band {ieltsData.currentScore}
                    </Badge>
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">{user?.students?.full_name || "IELTS Student"}</h1>
                <p className="text-blue-100 text-lg mb-4">IELTS Preparation Student</p>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <Badge className={`${getStatusColor(user?.status || "active")} border`}>
                    <Star className="w-3 h-3 mr-1" />
                    {user?.status || "Active"}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Globe className="w-3 h-3 mr-1" />
                    Target: {ieltsData.targetScore}
                  </Badge>
                </div>

                {/* Quick Stats in Profile Card */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-400/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user?.login_count || 0}</div>
                    <div className="text-xs text-blue-200">Logins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{ieltsData.studyStreak}</div>
                    <div className="text-xs text-blue-200">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{ieltsData.completedLessons}</div>
                    <div className="text-xs text-blue-200">Lessons</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="w-5 h-5" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
                      <div className="font-medium text-gray-800">{user?.email || "Not provided"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Role</div>
                      <div className="font-medium text-gray-800 capitalize">{user?.role || "Student"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Member Since</div>
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

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Last Active</div>
                      <div className="font-medium text-gray-800">
                        {user?.last_login
                          ? new Date(user.last_login).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Learning Progress & Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Progress */}
            <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <BookOpen className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Overall Progress */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold text-gray-800">Overall Course Progress</span>
                    <span className="text-sm text-blue-600 font-bold bg-white px-3 py-1 rounded-full">
                      {Math.round((ieltsData.completedLessons / ieltsData.totalLessons) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(ieltsData.completedLessons / ieltsData.totalLessons) * 100}
                    className="h-4 bg-white shadow-inner"
                  />
                  <div className="text-sm text-gray-600 mt-2">
                    {ieltsData.completedLessons} of {ieltsData.totalLessons} lessons completed
                  </div>
                </div>

                {/* IELTS Skills */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">IELTS Skills Assessment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(ieltsData.skillScores).map(([skill, score]) => (
                      <div
                        key={skill}
                        className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm font-medium text-gray-700 capitalize">{skill}</div>
                          <div className="text-xl font-bold text-blue-600">{score}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(score / 9) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Band {score} / 9.0</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Current Goals */}
              <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Target className="w-5 h-5" />
                    Current Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Target Band Score</span>
                      <span className="text-lg font-bold text-blue-600">{ieltsData.targetScore}</span>
                    </div>
                    <Progress value={(ieltsData.currentScore / ieltsData.targetScore) * 100} className="h-3" />
                    <div className="text-xs text-gray-600 mt-1">
                      Current: {ieltsData.currentScore} / Target: {ieltsData.targetScore}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Course Completion</span>
                      <span className="text-lg font-bold text-green-600">
                        {Math.round((ieltsData.completedLessons / ieltsData.totalLessons) * 100)}%
                      </span>
                    </div>
                    <Progress value={(ieltsData.completedLessons / ieltsData.totalLessons) * 100} className="h-3" />
                    <div className="text-xs text-gray-600 mt-1">
                      {ieltsData.totalLessons - ieltsData.completedLessons} lessons remaining
                    </div>
                  </div>
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
