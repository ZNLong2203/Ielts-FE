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
  Users,
  GraduationCap,
  FolderOpen,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Ticket,
  BookOpen,
  Package,
  NotepadText,
  BookCheck,
  Grid3X3,
} from "lucide-react";
import { Logout } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout, selectUser } from "@/redux/features/user/userSlice";
import { toast } from "react-hot-toast";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}

const AdminSidebar = ({
  isOpen,
  onToggle,
  isCollapsed,
  onCollapse,
}: AdminSidebarProps) => {
  const { t } = useI18n();
  const pathName = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routes = [
    {
      href: ROUTES.ADMIN,
      label: t("sidebar.overview"),
      icon: LayoutDashboard,
      active: pathName === ROUTES.ADMIN,
    },
    {
      href: ROUTES.ADMIN_STUDENTS,
      label: t("sidebar.students"),
      icon: Users,
      active: pathName === ROUTES.ADMIN_STUDENTS,
    },
    {
      href: ROUTES.ADMIN_TEACHERS,
      label: t("sidebar.teachers"),
      icon: GraduationCap,
      active: pathName === ROUTES.ADMIN_TEACHERS,
    },
    {
      href: ROUTES.ADMIN_BLOG_CATEGORIES,
      label: t("sidebar.blogCategories"),
      icon: FolderOpen,
      active: pathName === ROUTES.ADMIN_BLOG_CATEGORIES,
    },
    {
      href: ROUTES.ADMIN_BLOGS,
      label: t("sidebar.blogs"),
      icon: FileText,
      active: pathName === ROUTES.ADMIN_BLOGS,
    },
    {
      href: ROUTES.ADMIN_COURSE_CATEGORIES,
      label: t("sidebar.courseCategories"),
      icon: FolderOpen,
      active: pathName === ROUTES.ADMIN_COURSE_CATEGORIES,
    },
    {
      href: ROUTES.ADMIN_COURSES,
      label: t("sidebar.courses"),
      icon: BookOpen,
      active: pathName === ROUTES.ADMIN_COURSES,
    },
    {
      href: ROUTES.ADMIN_COUPONS,
      label: t("sidebar.coupons"),
      icon: Ticket,
      active: pathName === ROUTES.ADMIN_COUPONS,
    },
    {
      href: ROUTES.ADMIN_COURSE_COMBO,
      label: t("sidebar.comboCourses"),
      icon: Package,
      active: pathName === ROUTES.ADMIN_COURSE_COMBO,
    },
    {
      href: ROUTES.ADMIN_ORDERS,
      label: t("sidebar.orders"),
      icon: NotepadText,
      active: pathName === ROUTES.ADMIN_ORDERS,
    },
    {
      href: ROUTES.ADMIN_MOCK_TESTS,
      label: t("sidebar.mockTests"),
      icon: BookCheck,
      active: pathName === ROUTES.ADMIN_MOCK_TESTS,
    },
    {
      href: ROUTES.ADMIN_SETTINGS,
      label: t("sidebar.settings"),
      icon: Settings,
      active: pathName === ROUTES.ADMIN_SETTINGS,
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
              href="/"
              className="flex items-center group transition-all duration-200"
            >
              <div className="flex items-center space-x-3 px-2 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50/80 group-hover:shadow-sm">
                {/* Simple Logo */}
                <div className="p-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                  <Grid3X3 className="h-5 w-5 text-white" />
                </div>

                {/* Clean Typography */}
                <div>
                  <h1 className="font-bold text-xl text-gray-900 tracking-tight transition-colors duration-300 group-hover:text-blue-700">
                    IELTS
                  </h1>
                </div>
              </div>
            </Link>
          )}

          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="hidden lg:flex h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
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
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <IconComponent
                  className={cn(
                    "flex-shrink-0 h-5 w-5 transition-colors duration-200",
                    route.active
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate">{route.label}</span>
                )}
                {route.active && !isCollapsed && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "admin@ielts.vn"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
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
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  A
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 px-0 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
              </Button>
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

export default AdminSidebar;
