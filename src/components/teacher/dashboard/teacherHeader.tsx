"use client";

interface TeacherHeaderProps {
  onToggleSidebar: () => void;
}

const TeacherHeader = ({ onToggleSidebar }: TeacherHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 h-6 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
     
    </header>
  );
};

export default TeacherHeader;
