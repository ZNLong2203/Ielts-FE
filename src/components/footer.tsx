import Link from "next/link";
import Image from "next/image";

import { ChevronDown, Facebook, Mail, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

import appstoreIcon from "../../public/icons/appstore.png";
import googlePlayIcon from "../../public/icons/googlePlay.png";

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
                DOWNLOAD THE APP ON YOUR PHONE
              </h3>
              <div className="space-y-3">
                <Link href="#" className="block">
                  <div className="bg-black rounded-lg px-4 py-2 flex items-center space-x-3 w-fit">
                    <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                      <Image src={googlePlayIcon} alt="googlePlay" />
                    </div>
                    <div className="text-white">
                      <p className="text-xs">Download on</p>
                      <p className="text-sm font-semibold">Google Play</p>
                    </div>
                  </div>
                </Link>
                <Link href="#" className="block">
                  <div className="bg-black rounded-lg px-4 py-2 flex items-center space-x-3 w-fit">
                    <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                      <Image src={appstoreIcon} alt="appstore" />
                    </div>
                    <div className="text-white">
                      <p className="text-xs">Download on</p>
                      <p className="text-sm font-semibold">App Store</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                CONNECT WITH US
              </h3>
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
                <Link
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                >
                  <Twitter className="w-5 h-5 text-gray-600" />
                </Link>
              </div>
            </div>

            {/* Dropdown */}
            <div className="pt-4">
              <Button
                variant="ghost"
                className="text-gray-600 p-0 h-auto font-normal"
              >
                You may also be interested in{" "}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Study Programs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              STUDY PROGRAMS
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  IELTS
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  TOEIC
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  HSK
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  English Communication
                </Link>
              </li>
            </ul>
          </div>

          {/* Usage Guide */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              USING PREP
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  How to use the practice rooms
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  How to build a learning path
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Payment and code activation guide
                </Link>
              </li>
            </ul>
          </div>

          {/* About PREP */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              ABOUT PREP
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  AI policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Payment policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Careers
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
                Posts and Telecommunications Institute of Technology{" "}
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>MSDN: 012345678.</p>
                <p>
                  Contact Address: Km10, Nguyen Trai Street, Ha Dong District, Hanoi.
                </p>
                <p>
                  Business Address: 4th Floor, 25 Vu Ngoc Phan, Lang Ha Ward,
                  Dong Da District, Hanoi City and 2nd Floor, 20 Trung Yen,
                  Trung Hoa Ward, Cau Giay District, Hanoi City.
                </p>
                <p>
                  Headquarters: 122 Hoang Quoc Viet, Cau Giay District, Hanoi.
                </p>
              </div>
            </div>

            {/* Training Center Info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                PREP CENTER
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Virtual training rooms - Real-life experiences - Leading
                  technology.
                </p>
                <p>Hotline: 0903 324 4242.</p>
                <p>
                  Headquarters: No. 20, Alley 234/35, Hoang Quoc Viet Street, Co
                  Nhue 1 Ward, Bac Tu Liem District, Hanoi City.
                </p>
                <p>
                  Training and Education Certification No. 1309/QD-SGDDT issued
                  on July 31, 2023 by the Hanoi Department of Education and
                  Training.
                </p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">
              CERTIFIED BY
            </h4>
            <div className="flex flex-wrap items-center gap-6">
              {/* Certification badges */}
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">BTC</span>
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-blue-600">
                    MINISTRY OF INFORMATION
                  </p>
                  <p className="text-gray-500">AND COMMUNICATION</p>
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
  );
};

export default Footer;
