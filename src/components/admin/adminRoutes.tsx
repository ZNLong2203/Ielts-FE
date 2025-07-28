"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ROUTES from "@/constants/route";

import { useParams, usePathname } from "next/navigation";

const AdminRoutes = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const params = useParams();
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
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes.map((route) => (
        <Link
          key={route.label}
          href={route.href}
          className={cn(
            "text-md font-medium transition-colors hover:text-black",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
};

export default AdminRoutes;
