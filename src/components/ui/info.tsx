import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  verified?: boolean;
  className?: string;
  IconPos?: LucideIcon;
  IconNeg?: LucideIcon; 
}


export const TextInfoField = ({ 
  label, 
  value, 
  fallback = "Not provided",
  verified,
  IconPos,
  IconNeg,
  className = "" 
}: TextInfoFieldProps) => {
  return (
    <InfoField label={label} className={className}>
      <p className="text-sm text-gray-900">
        { verified === true ? (
          <span className="text-green-600 font-semibold flex gap-2 items-center">
            {value || fallback}
            {IconPos && <IconPos className="h-4 w-4 text-green-500" />}
          </span>
        ) : verified === false ? (
          <span className="text-red-600 font-semibold flex gap-2 items-center">
            {value || fallback}
            {IconNeg && <IconNeg className="h-4 w-4 text-red-500" />}
          </span>
        ) : (
          value || fallback
        )}
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

interface TextIconInfoProps {
  icon: LucideIcon;
  value?: string | number | null;
  fallback?: string;
}

export const TextIconInfo = ({ 
  icon: Icon, 
  value, 
  fallback = "Not provided"
}: TextIconInfoProps) => {
  return (
    <div className="flex items-center space-x-3 text-sm">
      <Icon className="h-4 w-4 text-gray-400" />
      <span className="text-gray-600">
        {value || fallback}
      </span>
    </div>
  );
};

interface TextBadgeInforProps {
  label: string;
  status: string;
}

const getBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

export const TextBadgeInfo = ({ label, status }: TextBadgeInforProps) => {
  return (  
    <div>
      <h4 className="font-medium text-sm text-gray-900 mb-2">
        {label}
      </h4>
      <Badge className={`text-xs ${getBadgeColor(status)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </div>
  )
}