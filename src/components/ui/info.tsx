import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface InfoFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const InfoField = ({ label, children, className = "" }: InfoFieldProps) => {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
};

// Text info field
interface TextInfoFieldProps {
  label: string;
  value?: string | number | null;
  fallback?: string;
  className?: string;
}

export const TextInfoField = ({ 
  label, 
  value, 
  fallback = "Not provided",
  className = "" 
}: TextInfoFieldProps) => {
  return (
    <InfoField label={label} className={className}>
      <p className="text-sm text-gray-900">
        {value || fallback}
      </p>
    </InfoField>
  );
};

// Date info field
interface DateInfoFieldProps {
  label: string;
  value?: string | Date | null;
  fallback?: string;
  showTime?: boolean;
  className?: string;
}

export const DateInfoField = ({ 
  label, 
  value, 
  fallback = "Not provided",
  showTime = false,
  className = "" 
}: DateInfoFieldProps) => {
  const formatDate = () => {
    if (!value) return fallback;
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return showTime ? date.toLocaleString() : date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  return (
    <InfoField label={label} className={className}>
      <p className="text-sm text-gray-900">
        {formatDate()}
      </p>
    </InfoField>
  );
};



interface ContactInfoItemProps {
  icon: LucideIcon;
  value?: string | number | null;
  fallback?: string;
}

export const ContactInfoItem = ({ 
  icon: Icon, 
  value, 
  fallback = "Not provided" 
}: ContactInfoItemProps) => {
  return (
    <div className="flex items-center space-x-3 text-sm">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="text-gray-600">
        {value || fallback}
      </span>
    </div>
  );
};