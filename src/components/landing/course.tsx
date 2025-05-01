import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function CourseSection() {
  return (
    <section className="w-full bg-blue-500 text-white py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="md:w-1/2">
            <p className="text-lg mb-2">Xin chào bạn!</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Thiết kế lộ trình học
              <br />
              dành riêng cho
              <br />
              bạn, ngay tại đây!
            </h1>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <Image
              src="/placeholder.svg?height=120&width=120"
              width={120}
              height={120}
              alt="IELTS Bee Mascot"
              className="animate-bounce"
            />
          </div>
        </div>

        {/* IELTS Level Selection */}
        <div className="bg-blue-600 rounded-xl p-6 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Current Level */}
            <div>
              <h2 className="text-xl font-semibold text-center mb-4">Trình độ của tôi</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  Mới học - IELTS 3.5
                </Button>
                <Button variant="outline" className="w-full bg-blue-600 text-white border-white hover:bg-blue-700">
                  IELTS 4.0-4.5
                </Button>
                <Button variant="outline" className="w-full bg-blue-600 text-white border-white hover:bg-blue-700">
                  IELTS 5.0-5.5
                </Button>
                <Button variant="outline" className="w-full bg-blue-600 text-white border-white hover:bg-blue-700">
                  IELTS 6.0-6.5
                </Button>
              </div>
            </div>

            {/* Target Level */}
            <div>
              <h2 className="text-xl font-semibold text-center mb-4">Mục tiêu của tôi</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  IELTS 5.0+
                </Button>
                <Button variant="outline" className="w-full bg-blue-600 text-white border-white hover:bg-blue-700">
                  IELTS 6.0+
                </Button>
                <Button variant="outline" className="w-full bg-blue-600 text-white border-white hover:bg-blue-700">
                  IELTS 6.5-7.0+
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 text-sm">
            <p>
              Bạn chưa rõ trình độ bản thân?{" "}
              <Link href="#" className="underline">
                Kiểm tra điểm số
              </Link>
            </p>
          </div>
        </div>

        {/* Course Options */}
        <div className="bg-blue-600 rounded-xl p-6 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Option 1 */}
            <div className="text-center">
              <div className="inline-block bg-blue-700 p-3 rounded-lg mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">Chương 1</h3>
              <p className="mb-4">Lấy gốc IELTS 4.0</p>

              <div className="bg-blue-700 rounded-lg p-4 flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" x2="21" y1="9" y2="9"></line>
                  <line x1="9" x2="9" y1="21" y2="9"></line>
                </svg>
                <div className="text-left">
                  <p className="font-semibold">18 bài</p>
                  <p className="text-xs">Chắm chắc với giao tiếp</p>
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <div className="text-center">
              <div className="inline-block bg-blue-700 p-3 rounded-lg mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">Chương 2</h3>
              <p className="mb-4">Chinh phục IELTS 5.0</p>

              <div className="bg-blue-700 rounded-lg p-4 flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" x2="21" y1="9" y2="9"></line>
                  <line x1="9" x2="9" y1="21" y2="9"></line>
                </svg>
                <div className="text-left">
                  <p className="font-semibold">2 chặng</p>
                  <p className="text-xs">Giàu từ khoa học mẫu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Chọn gói phù hợp</h2>
          <p className="text-xl mb-8">
            Chinh phục lộ trình <span className="text-yellow-300 font-bold">IELTS mới gốc đến 5.0</span>
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Self-study Package */}
            <Card className="bg-white text-blue-900 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <h3 className="font-bold">Tự học chủ động</h3>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold">
                    3.400.000 <span className="text-gray-400 text-sm">VNĐ</span>
                  </p>
                  <div className="flex items-center">
                    <p className="text-gray-400 text-sm line-through mr-2">4.000.000 VNĐ</p>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">-15%</span>
                  </div>
                </div>

                <div className="flex space-x-2 mb-4">
                  <Button className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200">Đăng ký học ngay</Button>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Nhập mã Coupon
                  </Button>
                </div>

                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold">QUYỀN LỢI</h4>
                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-1 rounded-full mr-2 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                    </div>
                    <p>Sở hữu lộ giáo trình học hợp chuyên sâu</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-1 rounded-full mr-2 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                    </div>
                    <p>Luyện đề Listening & Reading có giải thích đáp án chi tiết</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Full Course Package */}
            <Card className="bg-white text-blue-900 rounded-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Nổi bật
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <h3 className="font-bold">Học và luyện đề toàn diện</h3>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold">
                    5.100.000 <span className="text-gray-400 text-sm">VNĐ</span>
                  </p>
                  <div className="flex items-center">
                    <p className="text-gray-400 text-sm line-through mr-2">6.000.000 VNĐ</p>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">-15%</span>
                  </div>
                </div>

                <div className="flex space-x-2 mb-4">
                  <Button className="flex-1 bg-blue-500 text-white hover:bg-blue-600">Đăng ký học ngay</Button>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Nhập mã Coupon
                  </Button>
                </div>

                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold">QUYỀN LỢI</h4>
                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-1 rounded-full mr-2 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                    </div>
                    <p>Sở hữu lộ giáo trình học hợp chuyên sâu</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-1 rounded-full mr-2 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 12 2 2 4-4"></path>
                      </svg>
                    </div>
                    <p>Luyện đề Listening & Reading có giải thích đáp án chi tiết</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
