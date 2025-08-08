"use client"

import { motion } from "framer-motion"
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"

interface UserInfo {
  name: string
  email: string
  phone: string
  country: string
  avatar: string
}

interface PersonalInfoProps {
  userInfo: UserInfo
}

export default function PersonalInfo({ userInfo }: PersonalInfoProps) {
  return (
    <Card className="shadow-sm border border-gray-200 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Student Information</h3>
            <p className="text-sm text-blue-600">Verify your details before payment</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-start gap-6"
        >
          {/* Avatar */}
          <div className="relative">
            <Image
              src={userInfo.avatar || "/placeholder.svg"}
              alt={userInfo.name}
              width={100}
              height={100}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
              <Shield className="h-4 w-4" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{userInfo.name}</h4>
              <p className="text-gray-600">Ready to start your IELTS learning journey</p>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</div>
                  <div className="text-sm font-semibold text-gray-900">{userInfo.email}</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Phone className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</div>
                  <div className="text-sm font-semibold text-gray-900">{userInfo.phone}</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-all md:col-span-2"
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Country</div>
                  <div className="text-sm font-semibold text-gray-900">{userInfo.country}</div>
                </div>
              </motion.div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">Your information is secure</div>
                  <div className="text-sm text-green-700">
                    All personal data is encrypted and protected according to international standards
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
