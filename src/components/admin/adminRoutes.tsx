"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ROUTES from "@/constants/route";
import { usePathname } from "next/navigation";

const AdminRoutes = ({
  className,
  isMobile = false,
}: React.HTMLAttributes<HTMLElement> & { isMobile?: boolean }) => {
  const pathName = usePathname();

  const routes = [
    {
      href: ROUTES.ADMIN,
      label: "Overview",
      active: pathName === ROUTES.ADMIN,
    },
    {
      href: ROUTES.ADMIN_STUDENTS,
      label: "Students",
      active: pathName === ROUTES.ADMIN_STUDENTS,
    },
    {
      href: ROUTES.ADMIN_TEACHERS,
      label: "Teachers",
      active: pathName === ROUTES.ADMIN_TEACHERS,
    },
    {
      href: ROUTES.ADMIN_BLOG_CATEGORIES,
      label: "Blog Categories",
      active: pathName === ROUTES.ADMIN_BLOG_CATEGORIES,
    },
    {
      href: ROUTES.ADMIN_BLOGS,
      label: "Blogs",
      active: pathName === ROUTES.ADMIN_BLOGS,
    },
  ];

  if (isMobile) {
    return (
      <nav className={cn("flex flex-col space-y-1", className)}>
        {routes.map((route) => (
          <Link
            key={route.label}
            href={route.href}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 group",
              route.active
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <span>{route.label}</span>
            {route.active && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center space-x-1 lg:space-x-2", className)}>
      {routes.map((route) => (
        <Link
          key={route.label}
          href={route.href}
          className={cn(
            "relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group hover:scale-105",
            route.active
              ? "text-blue-700 bg-blue-50 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <span className="relative z-10 flex items-center space-x-2">
            <span>{route.label}</span>
          </span>

          {/* Active indicator */}
          {route.active && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform scale-x-100 transition-transform duration-200"></div>
          )}

          {/* Hover effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              route.active && "opacity-100"
            )}
          ></div>
        </Link>
      ))}
    </nav>
  );
};

export default AdminRoutes;
