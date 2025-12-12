"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ROUTES from "@/constants/route";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/I18nContext";
import {
  X,
  LayoutDashboard,
  User,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FileText,
  Settings,
} from "lucide-react";
import { Logout } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout, selectUser } from "@/redux/features/user/userSlice";
import { toast } from "react-hot-toast";

interface TeacherSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}

const TeacherSidebar = ({
  isOpen,
  onToggle,
  isCollapsed,
  onCollapse,
}: TeacherSidebarProps) => {
  const { t } = useI18n();
  const pathName = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routes = [
    {
      href:  ROUTES.TEACHER,
      label: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      active: pathName === ROUTES.HOME,
    },
    {
      href: ROUTES.TEACHER_BLOGS,
      label: t("sidebar.myBlogs"),
      icon: FolderOpen,
      active: pathName === ROUTES.TEACHER_BLOGS,
    },
    {
      href: ROUTES.TEACHER_WRITING_GRADING,
      label: t("sidebar.writingGrading"),
      icon: FileText,
      active: pathName === ROUTES.TEACHER_WRITING_GRADING || pathName?.startsWith(ROUTES.TEACHER_WRITING_GRADING),
    },
    {
      href: "/teacher/dashboard/settings",
      label: t("sidebar.settings"),
      icon: Settings,
      active: pathName === "/teacher/dashboard/settings",
    },
  ];

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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link
              href={ROUTES.HOME}
              className="flex items-center group transition-all duration-200 hover:scale-105"
            >
              <div className="relative rounded-lg px-2 py-1.5 transition-all duration-300 hover:bg-green-50/50">
                {/* Teacher Logo */}
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Teacher
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="hidden lg:flex h-8 w-8 p-0 hover:bg-green-50"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-green-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-green-600" />
            )}
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {routes.map((route) => {
            const IconComponent = route.icon;
            return (
              <Link
                key={route.label}
                href={route.href}
                onClick={() => {
                  // Close mobile menu when clicking on mobile
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  route.active
                    ? "bg-green-50 text-green-700 border-r-2 border-green-500 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <IconComponent
                  className={cn(
                    "flex-shrink-0 h-5 w-5 transition-colors duration-200",
                    route.active
                      ? "text-green-600"
                      : "text-gray-400 group-hover:text-gray-600",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate">{route.label}</span>
                )}
                {route.active && !isCollapsed && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-3">
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  T
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    IELTS Instructor
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1">
                <Link href={ROUTES.TEACHER_PROFILE}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 px-0 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  T
                </div>
              </Button>
              <Link href={ROUTES.TEACHER_PROFILE}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 px-0 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 px-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;
