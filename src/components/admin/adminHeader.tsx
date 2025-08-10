"use client";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title - will be updated by individual pages */}
        <div className="flex-1 lg:ml-0">
          <h1 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Notification button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Button>

          {/* User avatar - visible on desktop */}
          <div className="hidden lg:block">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:scale-105 transition-transform duration-200">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;