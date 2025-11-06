"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ROUTES from "@/constants/route";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}

const AdminSidebar = ({ isOpen, onToggle, isCollapsed, onCollapse }: AdminSidebarProps) => {
  const pathName = usePathname();

  const routes = [
    {
      href: ROUTES.ADMIN,
      label: "Overview",
      icon: LayoutDashboard,
      active: pathName === ROUTES.ADMIN,
    },
    {
      href: ROUTES.ADMIN_STUDENTS,
      label: "Students",
      icon: Users,
      active: pathName === ROUTES.ADMIN_STUDENTS,
    },
    {
      href: ROUTES.ADMIN_TEACHERS,
      label: "Teachers",
      icon: GraduationCap,
      active: pathName === ROUTES.ADMIN_TEACHERS,
    },
    {
      href: ROUTES.ADMIN_BLOG_CATEGORIES,
      label: "Blog Categories",
      icon: FolderOpen,
      active: pathName === ROUTES.ADMIN_BLOG_CATEGORIES,
    },
    {
      href: ROUTES.ADMIN_BLOGS,
      label: "Blogs",
      icon: FileText,
      active: pathName === ROUTES.ADMIN_BLOGS,
    },
    {
      href: ROUTES.ADMIN_COURSE_CATEGORIES,
      label: "Course Categories",
      icon: FolderOpen,
      active: pathName === ROUTES.ADMIN_COURSE_CATEGORIES,
    },
    {
      href: ROUTES.ADMIN_COURSES,
      label: "Courses",
      icon: BookOpen,
      active: pathName === ROUTES.ADMIN_COURSES,
    },
    {
      href: ROUTES.ADMIN_COUPONS,
      label: "Coupons",
      icon: Ticket,
      active: pathName === ROUTES.ADMIN_COUPONS,
    },
    {
      href: ROUTES.ADMIN_COURSE_COMBO,
      label: "Combo Courses",
      icon: Package,
      active: pathName === ROUTES.ADMIN_COURSE_COMBO,
    },
    {
      href: ROUTES.ADMIN_ORDERS,
      label: "Orders",
      icon: NotepadText,
      active: pathName === ROUTES.ADMIN_ORDERS,
    },
    {
      href: ROUTES.ADMIN_MOCK_TESTS,
      label: "Mock Tests",
      icon: BookCheck,
      active: pathName === ROUTES.ADMIN_MOCK_TESTS,
    }
  ];

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
              className="flex items-center group transition-all duration-200 hover:scale-105"
            >
              <div className="relative rounded-lg px-2 py-1.5 transition-all duration-300 hover:bg-blue-50/50">
                {/* Logo SVG - Smaller version */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="70"
                  height="20"
                  viewBox="0 0 85 24"
                  fill="none"
                  className="h-5 w-[70px] transition-all duration-200 group-hover:brightness-110"
                >
                  <g clipPath="url(#clip0_30428_22879)">
                    <path
                      d="M29.3774 19.0263C29.282 18.9321 29.2344 18.8143 29.2344 18.6769V5.35796C29.2344 5.20879 29.2781 5.08318 29.3694 4.98897C29.4608 4.89476 29.58 4.84766 29.7309 4.84766H35.28C36.9483 4.84766 38.2631 5.23627 39.2124 6.0135C40.1657 6.79074 40.6424 7.92126 40.6424 9.40899C40.6424 10.8967 40.1657 11.9958 39.2124 12.7534C38.2591 13.5111 36.9483 13.8879 35.28 13.8879H32.2373V18.6769C32.2373 18.8261 32.1897 18.9478 32.0943 19.0341C31.999 19.1244 31.8719 19.1676 31.7209 19.1676H29.7349C29.5958 19.1676 29.4806 19.1205 29.3813 19.0223M35.1807 11.5954C35.9831 11.5954 36.5908 11.407 37.0118 11.0341C37.4329 10.6612 37.6434 10.1116 37.6434 9.38544C37.6434 8.65924 37.4408 8.12538 37.0317 7.72891C36.6226 7.33245 36.0069 7.13617 35.1767 7.13617H32.1936V11.5954H35.1767H35.1807Z"
                      fill="#1F2937"
                    />
                    <path
                      d="M44.0805 19.0263C43.9852 18.9321 43.9375 18.8143 43.9375 18.6769V5.35796C43.9375 5.20879 43.9812 5.08318 44.0726 4.98897C44.1639 4.89476 44.2831 4.84766 44.434 4.84766H49.7964C51.4925 4.84766 52.8232 5.23627 53.7805 6.0135C54.7378 6.79074 55.2184 7.89378 55.2184 9.32656C55.2184 10.3236 54.9761 11.1558 54.4915 11.831C54.0069 12.5061 53.3316 12.9929 52.4617 13.2952L55.4647 18.512C55.5044 18.5945 55.5282 18.669 55.5282 18.7358C55.5282 18.8575 55.5845 18.9595 55.3932 19.042C55.3018 19.1244 55.2025 19.1637 55.0913 19.1637H53.1886C52.9662 19.1637 52.7954 19.1126 52.6723 19.0106C52.5491 18.9085 52.4379 18.775 52.3426 18.6102L49.6931 13.7623H46.857V18.673C46.857 18.8104 46.8094 18.9242 46.714 19.0223C46.6187 19.1165 46.4916 19.1637 46.3406 19.1637H44.434C44.295 19.1637 44.1798 19.1165 44.0805 19.0223M49.7329 11.4306C50.563 11.4306 51.1827 11.25 51.5958 10.8889C52.0089 10.5277 52.2155 9.9978 52.2155 9.30301C52.2155 8.60821 52.0089 8.07042 51.5958 7.69751C51.1827 7.32067 50.5591 7.13617 49.7329 7.13617H46.857V11.4345H49.7329V11.4306Z"
                      fill="#1F2937"
                    />
                    <path
                      d="M59.0727 19.0263C58.9774 18.9321 58.9297 18.8143 58.9297 18.6769V5.35798C58.9297 5.20881 58.9734 5.08713 59.0647 4.98899C59.1561 4.89478 59.2753 4.84375 59.4262 4.84375H68.5582C68.7091 4.84375 68.8362 4.89085 68.9316 4.98899C69.0269 5.0832 69.0746 5.20881 69.0746 5.35798V6.72795C69.0746 6.87712 69.0269 6.9988 68.9316 7.08516C68.8362 7.17545 68.7091 7.21863 68.5582 7.21863H61.7658V10.7986H68.1014C68.2523 10.7986 68.3755 10.8457 68.4748 10.9438C68.5701 11.0381 68.6217 11.1637 68.6217 11.3128V12.6004C68.6217 12.7495 68.5741 12.8712 68.4748 12.9576C68.3794 13.0479 68.2523 13.0911 68.1014 13.0911H61.7658V16.7927H68.721C68.872 16.7927 68.9951 16.8359 69.0944 16.9262C69.1897 17.0165 69.2374 17.1342 69.2374 17.2834V18.673C69.2374 18.8222 69.1897 18.9438 69.0944 19.0302C68.9991 19.1205 68.872 19.1637 68.721 19.1637H59.4262C59.2872 19.1637 59.172 19.1166 59.0727 19.0224"
                      fill="#1F2937"
                    />
                    <path
                      d="M73.0063 19.0263C72.911 18.9321 72.8594 18.8143 72.8594 18.6769V5.35796C72.8594 5.20879 72.9031 5.08318 72.9944 4.98897C73.0858 4.89476 73.205 4.84766 73.3559 4.84766H78.905C80.5733 4.84766 81.8881 5.23627 82.8374 6.0135C83.7907 6.79074 84.2674 7.92126 84.2674 9.40899C84.2674 10.8967 83.7907 11.9958 82.8374 12.7534C81.8841 13.5111 80.5733 13.8879 78.905 13.8879H75.8623V18.6769C75.8623 18.8261 75.8147 18.9478 75.7154 19.0341C75.62 19.1244 75.4929 19.1676 75.342 19.1676H73.3559C73.2169 19.1676 73.1017 19.1205 73.0024 19.0223M78.7977 11.5954C79.5961 11.5954 80.2079 11.407 80.6289 11.0341C81.0499 10.6612 81.2605 10.1116 81.2605 9.38544C81.2605 8.65924 81.0579 8.12538 80.6488 7.72891C80.2396 7.33245 79.6239 7.13617 78.7977 7.13617H75.8147V11.5954H78.7977Z"
                      fill="#1F2937"
                    />
                    <path
                      d="M0 4.80079V2.53582C0 1.13445 1.14795 0 2.56601 0H24.4605V21.4642C24.4605 22.8656 23.3125 24 21.8945 24H9.7834V19.2385H18.677C19.1656 19.2385 19.5628 18.8459 19.5628 18.3631V4.80079H0Z"
                      fill="#1479F3"
                    />
                    <path
                      d="M0 19.947V22.4828C0 23.8842 1.14795 23.998 2.56601 23.998H4.89369V9.59961H0V19.9509V19.947Z"
                      fill="#1479F3"
                    />
                    <path
                      d="M14.0156 9.58203H10.4446C10.0792 9.58203 9.78125 9.87251 9.78125 10.2376V13.7665C9.78125 14.1277 10.0752 14.4221 10.4446 14.4221H14.0156C14.381 14.4221 14.6789 14.1316 14.6789 13.7665V10.2376C14.6789 9.87644 14.381 9.58203 14.0156 9.58203Z"
                      fill="#FF9E00"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_30428_22879">
                      <rect width="85" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
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
                    route.active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600",
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    admin@tll.vn
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
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
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