"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Award, Calendar, TrendingUp, Eye, X } from "lucide-react"
import { getCertificates, getCertificateSVG } from "@/api/certificate"
import { ICertificate } from "@/interface/student"
import { selectUserId } from "@/redux/features/user/userSlice"

export default function CertificatesPage() {
  const userId = useSelector(selectUserId)
  const [certificates, setCertificates] = useState<ICertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'earned' | 'in-progress'>('all')
  const [selectedCertificate, setSelectedCertificate] = useState<ICertificate | null>(null)
  const [certificateSVG, setCertificateSVG] = useState<string | null>(null)
  const [loadingSVG, setLoadingSVG] = useState(false)

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
    if (filter === 'in-progress') return false
    return true
  })

  const earnedCerts = certificates.filter(c => c.progress >= 100 && c.certificate_url)

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        {/* Note: In-progress stat is hidden because backend only returns earned certificates */}
        {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-full p-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{inProgressCerts.length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>
        </div> */}
        
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
          {/* Note: In-progress filter is disabled because backend only returns earned certificates */}
          {/* <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            In Progress ({inProgressCerts.length})
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCerts.map((cert) => (
          <div 
            key={cert.id} 
            className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-md relative group"
          >
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Award badge */}
            {cert.progress >= 100 && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Completed
                </div>
              </div>
            )}
            
            <div className="p-6 relative z-0">
              {/* Icon section */}
              <div className="mb-5 flex items-center justify-center">
                <div className="bg-blue-100 p-6 rounded-full shadow-md group-hover:bg-blue-200 transition-colors">
                  <Award className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              
              <div className="text-center mb-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">{cert.description}</p>
              </div>
              
              {/* Progress section */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Progress</span>
                  <span className="font-bold text-blue-600">{cert.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${cert.progress}%` }} 
                  />
                </div>
              </div>
              
              {/* Date section */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{new Date(cert.issued_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </div>
              
              {/* Action button */}
              <div className="flex gap-2">
                {cert.progress >= 100 && cert.certificate_url ? (
                  <button
                    onClick={async () => {
                      setSelectedCertificate(cert);
                      setLoadingSVG(true);
                      setCertificateSVG(null);
                      try {
                        const svg = await getCertificateSVG(cert.id);
                        setCertificateSVG(svg);
                      } catch (error) {
                        console.error("Error loading certificate:", error);
                      } finally {
                        setLoadingSVG(false);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    <Eye className="w-5 h-5" />
                    View Certificate
                  </button>
                ) : cert.progress >= 100 ? (
                  <div className="flex-1 text-center px-4 py-3 bg-gray-100 text-gray-600 rounded-xl">
                    Generating certificate...
                  </div>
                ) : (
                  <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
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

      {/* Certificate Modal - Full Screen */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2" onClick={() => setSelectedCertificate(null)}>
          <div className="bg-white rounded-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-blue-600 text-white px-8 py-5 flex items-center justify-between rounded-t-2xl z-10 shadow-md">
              <div>
                <h2 className="text-2xl font-bold">{selectedCertificate.title}</h2>
                <p className="text-blue-100 text-sm mt-1">{selectedCertificate.description}</p>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50 p-8">
              {selectedCertificate.certificate_url ? (
                <div className="w-full flex flex-col items-center">
                  {loadingSVG ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                      <p className="mt-4 text-gray-600 font-medium">Loading certificate...</p>
                    </div>
                  ) : certificateSVG ? (
                    <div className="w-full flex flex-col items-center py-8">
                      {/* Certificate Container - Responsive và scrollable */}
                      <div className="w-full max-w-7xl px-4 mb-8">
                        <div className="bg-white rounded-xl shadow-2xl p-4 border-2 border-gray-200">
                          <div className="w-full overflow-x-auto overflow-y-auto">
                            <div 
                              className="mx-auto"
                              style={{
                                width: '100%',
                                maxWidth: '1200px',
                                minWidth: '800px',
                              }}
                            >
                              <style>{`
                                .certificate-svg {
                                  width: 100%;
                                  height: auto;
                                  max-width: 1200px;
                                  display: block;
                                }
                                .certificate-svg svg {
                                  width: 100%;
                                  height: auto;
                                  display: block;
                                }
                              `}</style>
                              <div 
                                className="certificate-svg"
                                dangerouslySetInnerHTML={{ __html: certificateSVG }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="w-full max-w-7xl px-4 flex gap-4 justify-center pb-4">
                        <button
                          onClick={() => {
                            const blob = new Blob([certificateSVG], { type: 'image/svg+xml' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `certificate-${selectedCertificate.title.replace(/\s+/g, '-')}.svg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          }}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                        >
                          <Award className="w-5 h-5" />
                          Download Certificate
                        </button>
                        <button
                          onClick={() => {
                            const newWindow = window.open();
                            if (newWindow) {
                              newWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <title>Certificate - ${selectedCertificate.title}</title>
                                    <style>
                                      * { margin: 0; padding: 0; box-sizing: border-box; }
                                      body {
                                        margin: 0;
                                        padding: 20px;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        min-height: 100vh;
                                        background: #f5f5f5;
                                      }
                                      svg {
                                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                                        border-radius: 10px;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    ${certificateSVG}
                                  </body>
                                </html>
                              `);
                              newWindow.document.close();
                            }
                          }}
                          className="px-8 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl font-semibold border-2 border-gray-200 flex items-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          Open in New Tab
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading certificate...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Certificate is being generated...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

