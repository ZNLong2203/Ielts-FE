import Link from "next/link"
import { ChevronDown, Facebook, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">PREP</span>
            </div>

            {/* App Download */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                TẢI ỨNG DỤNG TRÊN ĐIỆN THOẠI
              </h3>
              <div className="space-y-3">
                <Link href="#" className="block">
                  <div className="bg-black rounded-lg px-4 py-2 flex items-center space-x-3 w-fit">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-xs font-bold">▶</span>
                    </div>
                    <div className="text-white">
                      <p className="text-xs">Tải xuống trên</p>
                      <p className="text-sm font-semibold">Google Play</p>
                    </div>
                  </div>
                </Link>
                <Link href="#" className="block">
                  <div className="bg-black rounded-lg px-4 py-2 flex items-center space-x-3 w-fit">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-xs font-bold">🍎</span>
                    </div>
                    <div className="text-white">
                      <p className="text-xs">Tải xuống trên</p>
                      <p className="text-sm font-semibold">App Store</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">KẾT NỐI VỚI CHÚNG TÔI</h3>
              <div className="flex space-x-3">
                <Link
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                >
                  <Mail className="w-5 h-5 text-gray-600" />
                </Link>
                <Link
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                >
                  <Facebook className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>

            {/* Dropdown */}
            <div className="pt-4">
              <Button variant="ghost" className="text-gray-600 p-0 h-auto font-normal">
                Có thể bạn quan tâm <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Study Programs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">CHƯƠNG TRÌNH HỌC</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  IELTS
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  TOEIC
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  HSK
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Tiếng Anh Giao tiếp
                </Link>
              </li>
            </ul>
          </div>

          {/* Usage Guide */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">HƯỚNG DẪN SỬ DỤNG PREP</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Cách sử dụng phòng luyện đề
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Cách xây dựng lộ trình học
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Hướng dẫn thanh toán và kích hoạt mã
                </Link>
              </li>
            </ul>
          </div>

          {/* About PREP */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">VỀ PREP</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Chính sách dùng AI
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Điều kiện & điều khoản
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Chính sách thanh toán
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Company Information */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                CÔNG TY CỔ PHẦN CÔNG NGHỆ PREP
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>MSDN: 0109817671.</p>
                <p>Địa chỉ liên hệ: Tầng 4 10a Vinaconex-34 Láng Hạ, Q.Đống Đa, TP.Hà Nội.</p>
                <p>
                  Địa chỉ kinh doanh: Tầng 4 số 25 Vũ Ngọc Phan, P.Láng Hạ, Q.Đống Đa, TP.Hà Nội và Tầng 2 số 20 Trung
                  Yên, P.Trung Hòa, Q.Cầu Giấy, TP.Hà Nội.
                </p>
                <p>Trụ sở: SN 20, ngách 234/35, D.Hoàng Quốc Việt, P.Cổ Nhuế 1, Q.Bắc Từ Liêm, TP.Hà Nội.</p>
              </div>
            </div>

            {/* Training Center Info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                TRUNG TÂM ĐÀO TẠO NGOẠI NGỮ PREP
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Phòng luyện ảo - Trải nghiệm thực tế - Công nghệ hàng đầu.</p>
                <p>Hotline: 0931 42 8899.</p>
                <p>Trụ sở: Số nhà 20, ngách 234/35, D.Hoàng Quốc Việt, P.Cổ Nhuế 1, Q.Bắc Từ Liêm, TP.Hà Nội.</p>
                <p>
                  Giấy chứng nhận hoạt động đào tạo, bồi dưỡng số 1309/QĐ-SGDĐT ngày 31 tháng 07 năm 2023 do Sở Giáo dục
                  và Đào tạo Hà Nội cấp.
                </p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">CHỨNG NHẬN BỞI</h4>
            <div className="flex flex-wrap items-center gap-6">
              {/* Certification badges */}
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">BTC</span>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-blue-600">BỘ THÔNG TIN</p>
                  <p className="text-gray-500">VÀ TRUYỀN THÔNG</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">DMCA</span>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-green-600">DMCA</p>
                  <p className="text-gray-500">PROTECTED</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">GMO</span>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-blue-600">GMO</p>
                  <p className="text-gray-500">GlobalSign secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;