"use client";
interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 h-4 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
     
    </header>
  );
};

export default AdminHeader;