"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "./adminSidebar";
import AdminHeader from "./adminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isCollapsed={isCollapsed}
        onCollapse={toggleCollapse}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          "lg:ml-64", // Default margin for expanded sidebar
          isCollapsed && "lg:ml-16" // Reduced margin for collapsed sidebar
        )}
      >
        {/* Header */}
        <AdminHeader onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;