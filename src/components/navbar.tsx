"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
  logout,
} from "@/redux/features/user/userSlice";
import NavbarTitle from "@/components/navbarTitle";
import NavbarLink from "@/components/navbarLink";
import ROUTES from "@/constants/route";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  BookOpen,
  Award,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Logout } from "@/api/auth";
import Link from "next/link";
import { useI18n } from "@/context/I18nContext";

const LandingNavbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  // Redux selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    Logout()
      .then(() => {
        console.log("Logout successful");
        toast.success(t("common.loggedOutSuccessfully"));
        router.push(ROUTES.HOME);
        dispatch(logout());
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        toast.error(t("common.logoutFailed"));
      });

    setMobileMenuOpen(false);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email.split("@")[0];
    return t("common.user");
  };

  // Get user avatar initials
  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50"
      style={{
        background: "linear-gradient(180deg, #011657 0%, #022571 100%)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <nav className="font-svn-poppins relative bg-transparent md:max-lg:-mb-2">
        <div className="max-w-screen-3xl 3xl:px-[108px] relative mx-auto w-full px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                suppressHydrationWarning={true}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[rgba(5,6,15,0.3)] md:max-lg:order-2 lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>

              <a href="/" className="md:max-lg:order-1 flex items-center gap-2">
                <div className="mr-0 rounded-[140px] px-3 py-2.5 max-md:bg-[rgba(5,6,15,0.17)] md:mr-5 md:px-0 md:py-2.5 lg:mr-1 lg:px-5 lg:py-3 flex items-center gap-2">
                  <img
                    src="/icons/logo.png"
                    alt="TLL Logo"
                    className="h-12 w-12 object-contain rounded-lg"
                  />
                  <span className="font-bold text-xl text-white">IELTS</span>
                </div>
              </a>

              <a
                href="/"
                className="md:max-lg:order-1"
                style={{ display: "none" }}
              >
                <div style={{ display: "none" }}>
                  {/* SVG logo đã thay thế */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="85"
                    height="24"
                    viewBox="0 0 85 24"
                    fill="none"
                    className="h-6 w-[85px]"
                  >
                    {/* SVG content giữ nguyên */}
                    <g clipPath="url(#clip0_30428_22879)">
                      <path
                        d="M29.3774 19.0263C29.282 18.9321 29.2344 18.8143 29.2344 18.6769V5.35796C29.2344 5.20879 29.2781 5.08318 29.3694 4.98897C29.4608 4.89476 29.58 4.84766 29.7309 4.84766H35.28C36.9483 4.84766 38.2631 5.23627 39.2124 6.0135C40.1657 6.79074 40.6424 7.92126 40.6424 9.40899C40.6424 10.8967 40.1657 11.9958 39.2124 12.7534C38.2591 13.5111 36.9483 13.8879 35.28 13.8879H32.2373V18.6769C32.2373 18.8261 32.1897 18.9478 32.0943 19.0341C31.999 19.1244 31.8719 19.1676 31.7209 19.1676H29.7349C29.5958 19.1676 29.4806 19.1205 29.3813 19.0223M35.1807 11.5954C35.9831 11.5954 36.5908 11.407 37.0118 11.0341C37.4329 10.6612 37.6434 10.1116 37.6434 9.38544C37.6434 8.65924 37.4408 8.12538 37.0317 7.72891C36.6226 7.33245 36.0069 7.13617 35.1767 7.13617H32.1936V11.5954H35.1767H35.1807Z"
                        fill="#EDF1F7"
                      ></path>
                      <path
                        d="M44.0805 19.0263C43.9852 18.9321 43.9375 18.8143 43.9375 18.6769V5.35796C43.9375 5.20879 43.9812 5.08318 44.0726 4.98897C44.1639 4.89476 44.2831 4.84766 44.434 4.84766H49.7964C51.4925 4.84766 52.8232 5.23627 53.7805 6.0135C54.7378 6.79074 55.2184 7.89378 55.2184 9.32656C55.2184 10.3236 54.9761 11.1558 54.4915 11.831C54.0069 12.5061 53.3316 12.9929 52.4617 13.2952L55.4647 18.512C55.5044 18.5945 55.5282 18.669 55.5282 18.7358C55.5282 18.8575 55.4845 18.9595 55.3932 19.042C55.3018 19.1244 55.2025 19.1637 55.0913 19.1637H53.1886C52.9662 19.1637 52.7954 19.1126 52.6723 19.0106C52.5491 18.9085 52.4379 18.775 52.3426 18.6102L49.6931 13.7623H46.857V18.673C46.857 18.8104 46.8094 18.9242 46.714 19.0223C46.6187 19.1165 46.4916 19.1637 46.3406 19.1637H44.434C44.295 19.1637 44.1798 19.1165 44.0805 19.0223M49.7329 11.4306C50.563 11.4306 51.1827 11.25 51.5958 10.8889C52.0089 10.5277 52.2155 9.9978 52.2155 9.30301C52.2155 8.60821 52.0089 8.07042 51.5958 7.69751C51.1827 7.32067 50.5591 7.13617 49.7329 7.13617H46.857V11.4345H49.7329V11.4306Z"
                        fill="#EDF1F7"
                      ></path>
                      <path
                        d="M59.0727 19.0263C58.9774 18.9321 58.9297 18.8143 58.9297 18.6769V5.35798C58.9297 5.20881 58.9734 5.08713 59.0647 4.98899C59.1561 4.89478 59.2753 4.84375 59.4262 4.84375H68.5582C68.7091 4.84375 68.8362 4.89085 68.9316 4.98899C69.0269 5.0832 69.0746 5.20881 69.0746 5.35798V6.72795C69.0746 6.87712 69.0269 6.9988 68.9316 7.08516C68.8362 7.17545 68.7091 7.21863 68.5582 7.21863H61.7658V10.7986H68.1014C68.2523 10.7986 68.3755 10.8457 68.4748 10.9438C68.5701 11.0381 68.6217 11.1637 68.6217 11.3128V12.6004C68.6217 12.7495 68.5741 12.8712 68.4748 12.9576C68.3794 13.0479 68.2523 13.0911 68.1014 13.0911H61.7658V16.7927H68.721C68.872 16.7927 68.9951 16.8359 69.0944 16.9262C69.1897 17.0165 69.2374 17.1342 69.2374 17.2834V18.673C69.2374 18.8222 69.1897 18.9438 69.0944 19.0302C68.9991 19.1205 68.872 19.1637 68.721 19.1637H59.4262C59.2872 19.1637 59.172 19.1166 59.0727 19.0224"
                        fill="#EDF1F7"
                      ></path>
                      <path
                        d="M73.0063 19.0263C72.911 18.9321 72.8594 18.8143 72.8594 18.6769V5.35796C72.8594 5.20879 72.9031 5.08318 72.9944 4.98897C73.0858 4.89476 73.205 4.84766 73.3559 4.84766H78.905C80.5733 4.84766 81.8881 5.23627 82.8374 6.0135C83.7907 6.79074 84.2674 7.92126 84.2674 9.40899C84.2674 10.8967 83.7907 11.9958 82.8374 12.7534C81.8841 13.5111 80.5733 13.8879 78.905 13.8879H75.8623V18.6769C75.8623 18.8261 75.8147 18.9478 75.7154 19.0341C75.62 19.1244 75.4929 19.1676 75.342 19.1676H73.3559C73.2169 19.1676 73.1017 19.1205 73.0024 19.0223M78.7977 11.5954C79.5961 11.5954 80.2079 11.407 80.6289 11.0341C81.0499 10.6612 81.2605 10.1116 81.2605 9.38544C81.2605 8.65924 81.0579 8.12538 80.6488 7.72891C80.2396 7.33245 79.6239 7.13617 78.7977 7.13617H75.8147V11.5954H78.7977Z"
                        fill="#EDF1F7"
                      ></path>
                      <path
                        d="M0 4.80079V2.53582C0 1.13445 1.14795 0 2.56601 0H24.4605V21.4642C24.4605 22.8656 23.3125 24 21.8945 24H9.7834V19.2385H18.677C19.1656 19.2385 19.5628 18.8459 19.5628 18.3631V4.80079H0Z"
                        fill="#1479F3"
                      ></path>
                      <path
                        d="M0 19.947V22.4828C0 23.8842 1.14795 23.998 2.56601 23.998H4.89369V9.59961H0V19.9509V19.947Z"
                        fill="#1479F3"
                      ></path>
                      <path
                        d="M14.0156 9.58203H10.4446C10.0792 9.58203 9.78125 9.87251 9.78125 10.2376V13.7665C9.78125 14.1277 10.0752 14.4221 10.4446 14.4221H14.0156C14.381 14.4221 14.6789 14.1316 14.6789 13.7665V10.2376C14.6789 9.87644 14.381 9.58203 14.0156 9.58203Z"
                        fill="#FF9E00"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_30428_22879">
                        <rect width="85" height="24" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </a>

              {/* Navigation Menu - giữ nguyên */}
              <div className="font-svn-poppins hidden items-center gap-x-2.5 rounded-[32px] bg-black bg-opacity-[0.17] font-semibold text-white text-opacity-60 lg:flex lg:max-2xl:py-0.5 2xl:gap-x-0">
                <Link
                  href={ROUTES.HOME}
                  className="rounded-[32px] px-5 py-3 text-xs tracking-[0.06px] hover:text-white lg:max-2xl:px-3 2xl:text-sm 2xl:tracking-[0.07px] pointer-events-none bg-black bg-opacity-[0.24] text-white hover:cursor-default"
                >
                  {t("nav.home")}
                </Link>

                <NavbarTitle text={t("nav.courses")}>
                  <div className="absolute inset-x-0 left-1/2 top-[calc(100%-4px)] z-[1050] hidden min-w-max -translate-x-1/2 cursor-auto group-hover/parent:block">
                    <div className="h-3 w-full"></div>
                    <div className="min-w-[150px] rounded-2xl border-2 border-white border-opacity-10 bg-black bg-opacity-50 p-2 backdrop-blur-[47.5px]">
                      <div className="flex flex-col">
                        <NavbarLink text={t("nav.ielts")} href="/#learning-path" />
                      </div>
                    </div>
                  </div>
                </NavbarTitle>
{/* 
                <NavbarTitle text={t("nav.testPractice")}>
                  <div className="absolute inset-x-0 left-1/2 top-[calc(100%-4px)] z-[1050] hidden min-w-max -translate-x-1/2 cursor-auto group-hover/parent:block">
                    <div className="h-3 w-full"></div>
                    <div className="min-w-[150px] rounded-2xl border-2 border-white border-opacity-10 bg-black bg-opacity-50 p-2 backdrop-blur-[47.5px]">
                      <div className="flex flex-col">
                        <NavbarLink
                          text={t("nav.practiceIELTS")}
                          href="/practice/ielts"
                        />
                      </div>
                    </div>
                  </div>
                </NavbarTitle> */}

                {/* <NavbarTitle text={t("nav.placementTest")}>
                  <div className="absolute inset-x-0 left-1/2 top-[calc(100%-4px)] z-[1050] hidden min-w-max -translate-x-1/2 cursor-auto group-hover/parent:block">
                    <div className="h-3 w-full"></div>
                    <div className="min-w-[150px] rounded-2xl border-2 border-white border-opacity-10 bg-black bg-opacity-50 p-2 backdrop-blur-[47.5px]">
                      <div className="flex flex-col">
                        <NavbarLink
                          text={t("nav.ielts")}
                          href="/placement/ielts"
                        />
                      </div>
                    </div>
                  </div>
                </NavbarTitle> */}

                <NavbarLink text={t("nav.blog")} href="/blogs" />
              </div>
            </div>

            {/* Right side - Login & Register HOẶC User Menu */}
            <div className="font-svn-poppins hidden items-center gap-x-2.5 rounded-[32px] bg-black bg-opacity-[0.17] font-semibold text-white text-opacity-60 lg:flex lg:max-2xl:py-0.5 2xl:gap-x-0">
              {!isAuthenticated ? (
                <>
                  {/* Login Dropdown */}
                  <NavbarTitle text={t("nav.login")}>
                    <div className="absolute inset-x-0 left-1/2 top-[calc(100%-4px)] z-[1050] hidden min-w-max -translate-x-1/2 cursor-auto group-hover/parent:block">
                      <div className="h-3 w-full"></div>
                      <div className="min-w-[180px] rounded-2xl border-2 border-white border-opacity-10 bg-black bg-opacity-50 p-2 backdrop-blur-[47.5px]">
                        <div className="flex flex-col">
                          <NavbarLink text={t("nav.login")} href={ROUTES.LOGIN} />
                          <div className="border-t border-white/20 my-1"></div>
                          <NavbarLink text={t("nav.adminPortal")} href={ROUTES.ADMIN} />
                        </div>
                      </div>
                    </div>
                  </NavbarTitle>

                  {/* Register Dropdown */}
                  <NavbarTitle text={t("nav.register")}>
                    <div className="absolute inset-x-0 left-1/2 top-[calc(100%-4px)] z-[1050] hidden min-w-max -translate-x-1/2 cursor-auto group-hover/parent:block">
                      <div className="h-3 w-full"></div>
                      <div className="min-w-[180px] rounded-2xl border-2 border-white border-opacity-10 bg-black bg-opacity-50 p-2 backdrop-blur-[47.5px]">
                        <div className="flex flex-col">
                          <NavbarLink
                            text={t("nav.joinAsStudent")}
                            href={ROUTES.STUDENT_REGISTER}
                          />
                        </div>
                      </div>
                    </div>
                  </NavbarTitle>
                </>
              ) : (
                /* User Menu khi đã đăng nhập - REDESIGNED */
                <div className="relative group/parent">
                  <div className="flex items-center gap-3 rounded-[32px] px-4 py-2 cursor-pointer hover:bg-white/10 transition-all duration-200">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {getUserInitials()}
                    </div>

                    {/* User Name & Role */}
                    <div className="flex flex-col items-start">
                      <span className="text-white text-sm font-medium max-w-[120px] truncate">
                        {getUserDisplayName()}
                      </span>
                    </div>

                    <ChevronRight className="h-4 w-4 text-white/60 transform group-hover/parent:rotate-90 transition-transform duration-200" />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-[calc(100%+8px)] z-[1050] hidden min-w-[280px] group-hover/parent:block">
                    <div className="rounded-2xl border-2 border-white/10 bg-black/80 backdrop-blur-[47.5px] p-3 shadow-2xl">
                      {/* User Info Header */}
                      <div className="flex items-center gap-3 p-3 border-b border-white/10 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getUserInitials()}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-white/60 text-xs truncate">
                            {user?.email}
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        {/* Profile Link */}
                        {user?.role !== "admin" && (
                          <a
                            href={
                              user?.role === "teacher"
                                ? ROUTES.TEACHER_PROFILE
                                : ROUTES.STUDENT_PROFILE
                            }
                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
                          >
                            <User className="h-4 w-4" />
                            <span>{t("nav.myProfile")}</span>
                            <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}

                        {/* My Learning (Student) */}
                        {user?.role === "student" && (
                          <a
                            href="/student/dashboard"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>{t("nav.studentDashboard")}</span>
                            <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}

                        {/* My Classes (Teacher) */}
                        {user?.role === "teacher" && (
                          <a
                            href="/teacher/dashboard"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>{t("nav.teacherDashboard")}</span>
                            <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        )}

                        {/* Admin Dashboard (Admin only) */}
                        {user?.role === "admin" && (
                          <>
                            <div className="border-t border-white/10 my-2"></div>
                            <a
                              href={ROUTES.ADMIN}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              <span>{t("nav.adminDashboard")}</span>
                              <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </>
                        )}

                        {/* Settings */}
                        <div className="border-t border-white/10 my-2"></div>
                        <a
                          href={
                            user?.role === "admin"
                              ? ROUTES.ADMIN_SETTINGS
                              : user?.role === "teacher"
                              ? "/teacher/dashboard/settings"
                              : "/student/dashboard/settings"
                          }
                          className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors group"
                        >
                          <Settings className="h-4 w-4" />
                          <span>{t("nav.settings")}</span>
                          <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>

                        {/* Logout */}
                        <div className="border-t border-white/10 my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-lg transition-colors group"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t("nav.signOut")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu - REDESIGNED */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-[#011657]/95 backdrop-blur-md"
        >
          <div className="px-4 py-6 space-y-4">
            <a href="/" className="block py-2 text-white font-medium">
              {t("nav.home")}
            </a>
            <a
              href="/#learning-path"
              className="block py-2 text-white/70 hover:text-white"
            >
              {t("nav.courses")}
            </a>
            <a
              href="/practice"
              className="block py-2 text-white/70 hover:text-white"
            >
              {t("nav.testPractice")}
            </a>
            <a
              href="/placement"
              className="block py-2 text-white/70 hover:text-white"
            >
              {t("nav.placementTest")}
            </a>
            <a
              href="/blogs"
              className="block py-2 text-white/70 hover:text-white"
            >
              {t("nav.blog")}
            </a>

            {/* Mobile User Menu */}
            <div className="border-t border-white/20 pt-4 mt-4">
              {!isAuthenticated ? (
                <>
                  <div className="space-y-2">
                    <div className="text-white/50 text-sm font-medium">
                      {t("nav.login")}
                    </div>

                    <a
                      href={ROUTES.LOGIN}
                      className="block py-1 pl-4 text-white/70 hover:text-white text-sm"
                    >
                      {t("nav.login")}
                    </a>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="text-white/50 text-sm font-medium">
                      {t("nav.register")}
                    </div>
                    <a
                      href={ROUTES.STUDENT_REGISTER}
                      className="block py-1 pl-4 text-white/70 hover:text-white text-sm"
                    >
                      {t("nav.joinAsStudent")}
                    </a>
                    <a
                      href={ROUTES.TEACHER_REGISTER}
                      className="block py-1 pl-4 text-white/70 hover:text-white text-sm"
                    >
                      {t("nav.joinAsTeacher")}
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 border-b border-white/20 pb-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-white/50 text-sm">{user?.email}</div>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="space-y-2">
                    <a
                      href={
                        user?.role === "teacher"
                          ? ROUTES.TEACHER_PROFILE
                          : ROUTES.STUDENT_PROFILE
                      }
                      className="flex items-center gap-3 py-2 text-white/70 hover:text-white"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.myProfile")}
                    </a>

                    {user?.role === "student" && (
                      <a
                        href="/student/dashboard"
                        className="flex items-center gap-3 py-2 text-white/70 hover:text-white"
                      >
                        <BookOpen className="h-4 w-4" />
                        {t("nav.studentDashboard")}
                      </a>
                    )}

                    {user?.role === "TEACHER" && (
                      <a
                        href="/my-classes"
                        className="flex items-center gap-3 py-2 text-white/70 hover:text-white"
                      >
                        <BookOpen className="h-4 w-4" />
                        {t("nav.myClasses")}
                      </a>
                    )}

                    <a
                      href="/achievements"
                      className="flex items-center gap-3 py-2 text-white/70 hover:text-white"
                    >
                      <Award className="h-4 w-4" />
                      {t("nav.achievements")}
                    </a>

                    {user?.role === "admin" && (
                      <a
                        href={ROUTES.ADMIN}
                        className="flex items-center gap-3 py-2 text-white/70 hover:text-white"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {t("nav.adminDashboard")}
                      </a>
                    )}

                    <a
                      href={
                        user?.role === "admin"
                          ? ROUTES.ADMIN_SETTINGS
                          : user?.role === "teacher"
                          ? "/teacher/dashboard/settings"
                          : "/student/dashboard/settings"
                      }
                      className="flex items-center gap-3 py-2 text-white/70 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      {t("nav.settings")}
                    </a>

                    {user?.role === "admin" && (
                      <a
                        href={ROUTES.ADMIN}
                        className="flex items-center gap-3 py-2 text-white/70 hover:text-white"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {t("nav.adminDashboard")}
                      </a>
                    )}

                    <div className="border-t border-white/20 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full py-2 text-red-300 hover:text-red-100"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav.signOut")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LandingNavbar;
