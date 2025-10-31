"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Award, Calendar, TrendingUp, BookOpen, Eye } from "lucide-react"
import { getCertificates } from "@/api/certificate"
import { ICertificate } from "@/interface/student"
import { selectUserId } from "@/redux/features/user/userSlice"
import Image from "next/image"

export default function CertificatesPage() {
  const userId = useSelector(selectUserId)
  const [certificates, setCertificates] = useState<ICertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'earned' | 'in-progress'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (!userId) return
        const data = await getCertificates()
        setCertificates(data)
      } catch (err) {
        console.error("Error fetching certificates:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  const filteredCerts = certificates.filter(cert => {
    if (filter === 'earned') return cert.progress >= 100 && cert.certificate_url
    if (filter === 'in-progress') return cert.progress < 100
    return true
  })

  const earnedCerts = certificates.filter(c => c.progress >= 100 && c.certificate_url)
  const inProgressCerts = certificates.filter(c => c.progress < 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-600 mt-2">View your learning achievements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{earnedCerts.length}</div>
              <div className="text-sm text-gray-600">Certificates Earned</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-full p-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{inProgressCerts.length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {certificates.length > 0 
                  ? Math.round(certificates.reduce((sum, c) => sum + c.progress, 0) / certificates.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Average Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All ({certificates.length})
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'earned' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Earned ({earnedCerts.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            In Progress ({inProgressCerts.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert) => (
          <div key={cert.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all shadow-sm">
            {cert.thumbnail && (
              <div className="relative h-48 w-full">
                <Image src={cert.thumbnail} alt={cert.title} fill className="object-cover" />
                {cert.progress >= 100 && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                )}
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{cert.title}</h3>
                {cert.progress >= 100 && <Award className="w-6 h-6 text-yellow-500" />}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{cert.description}</p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{cert.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${cert.progress}%` }} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4" />
                <span>{new Date(cert.issued_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex gap-2">
                {cert.progress >= 100 && cert.certificate_url ? (
                  <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Eye className="w-4 h-4" />
                    View
                  </a>
                ) : cert.progress >= 100 ? (
                  <div className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    Generating certificate...
                  </div>
                ) : (
                  <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                    Continue Learning
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-600">Complete your learning paths to earn certificates</p>
        </div>
      )}
    </div>
  )
}

