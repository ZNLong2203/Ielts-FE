"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Twitter, 
  Linkedin, 
  MapPin, 
  Phone, 
  Shield, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";

import appstoreIcon from "../../public/icons/appstore.png";
import googlePlayIcon from "../../public/icons/googlePlay.png";

const Footer = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-blue-50/50 to-white border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-br from-[#011657] via-[#022571] to-[#033899] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white max-w-xl">
              <h2 className="text-2xl font-bold mb-2">{t("footer.stayUpdated")}</h2>
              <p className="text-blue-100">
                {t("footer.getExclusiveOffers")}
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder={t("common.enterYourEmail")}
                  className="px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[250px]"
                />
                <Button className="bg-white hover:bg-blue-50 text-blue-700 font-semibold px-6 py-6 rounded-lg transition-all shadow-sm hover:shadow-md">
                  {t("common.subscribe")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#011657] via-[#022571] to-[#033899] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">Ielts</span>
              </div>
              
              <p className="text-gray-600 text-sm">
                {t("footer.description")}
              </p>

              {/* App Download */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {t("footer.downloadMobileApp")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link href="#" className="transition-transform hover:scale-105">
                    <div className="bg-black rounded-xl px-4 py-2 flex items-center space-x-3">
                      <div className="w-7 h-7 flex items-center justify-center">
                        <Image src={googlePlayIcon} alt="Google Play" width={24} height={24} />
                      </div>
                      <div className="text-white">
                        <p className="text-xs opacity-80">{t("footer.downloadOn")}</p>
                        <p className="text-sm font-semibold">{t("footer.googlePlay")}</p>
                      </div>
                    </div>
                  </Link>
                  <Link href="#" className="transition-transform hover:scale-105">
                    <div className="bg-black rounded-xl px-4 py-2 flex items-center space-x-3">
                      <div className="w-7 h-7 flex items-center justify-center">
                        <Image src={appstoreIcon} alt="App Store" width={24} height={24} />
                      </div>
                      <div className="text-white">
                        <p className="text-xs opacity-80">{t("footer.downloadOn")}</p>
                        <p className="text-sm font-semibold">{t("footer.appStore")}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {t("footer.connectWithUs")}
                </h3>
                <div className="flex items-center space-x-3">
                  <Link
                    href="#"
                    className="w-10 h-10 bg-blue-100/80 rounded-full flex items-center justify-center hover:bg-blue-200/80 transition-all hover:scale-105"
                    aria-label="Email us"
                  >
                    <Mail className="w-5 h-5 text-blue-700" />
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 bg-blue-100/80 rounded-full flex items-center justify-center hover:bg-blue-200/80 transition-all hover:scale-105"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-blue-700" />
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 bg-blue-100/80 rounded-full flex items-center justify-center hover:bg-blue-200/80 transition-all hover:scale-105"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5 text-blue-700" />
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 bg-blue-100/80 rounded-full flex items-center justify-center hover:bg-blue-200/80 transition-all hover:scale-105"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-blue-700" />
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 bg-blue-100/80 rounded-full flex items-center justify-center hover:bg-blue-200/80 transition-all hover:scale-105"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Study Programs */}
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800">
                {t("footer.studyPrograms")}
              </h3>
              <ul className="space-y-3">
                {[
                  t("footer.ieltsAcademic"),
                  t("footer.ieltsGeneralTraining"),
                  t("footer.toeicPreparation"),
                  t("footer.hskCourses"),
                  t("footer.englishCommunication"),
                  t("footer.businessEnglish"),
                  t("footer.examSimulation")
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-blue-700 text-sm flex items-center transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mr-2 group-hover:scale-125 transition-transform"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Usage Guide */}
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800">
                {t("footer.usingIelts")}
              </h3>
              <ul className="space-y-3">
                {[
                  t("footer.gettingStartedGuide"),
                  t("footer.practiceRoomsTutorial"),
                  t("footer.buildingLearningPath"),
                  t("footer.paymentActivation"),
                  t("footer.mobileAppGuide"),
                  t("footer.frequentlyAskedQuestions"),
                  t("footer.studentSupportCenter")
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-blue-700 text-sm flex items-center transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mr-2 group-hover:scale-125 transition-transform"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About & Policies */}
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-800">
                {t("footer.aboutIelts")}
              </h3>
              <ul className="space-y-3">
                {[
                  t("footer.ourStory"),
                  t("footer.ourTeam"),
                  t("footer.aiTechnologyPolicy"),
                  t("footer.termsConditions"),
                  t("footer.privacyPolicy"),
                  t("footer.paymentPolicy"),
                  t("footer.refundPolicy"),
                  t("footer.careerOpportunities")
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-blue-700 text-sm flex items-center transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mr-2 group-hover:scale-125 transition-transform"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <MapPin className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">{t("footer.mainCampus")}</h4>
                <p className="text-sm text-gray-600">
                  Km10, Nguyen Trai, Cau Giay District, Hanoi, Vietnam
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <Phone className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">{t("footer.contact")}</h4>
                <p className="text-sm text-gray-600">
                  Hotline: 0903 324 4242<br />
                  Email: support@tll.edu.vn
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <Shield className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">{t("footer.certifications")}</h4>
                <p className="text-sm text-gray-600">
                  Training and Education Certification No. 1309/QD-SGDDT<br />
                  Issued on July 31, 2023
                </p>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              {t("footer.copyright", { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;