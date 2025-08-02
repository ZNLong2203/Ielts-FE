import React from "react";
import { 
  AlertCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  X,
  RefreshCw,
  Home,
  ArrowLeft
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  title?: string;
  description?: string;
  variant?: "error" | "warning" | "info" | "success";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const Error = ({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  variant = "error",
  size = "md",
  showIcon = true,
  dismissible = false,
  onDismiss,
  onRetry,
  onGoHome,
  onGoBack,
  className,
  children,
}: ErrorProps) => {
  const getIcon = () => {
    const iconClass = cn(
      size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"
    );

    switch (variant) {
      case "error":
        return <XCircle className={cn(iconClass, "text-red-500")} />;
      case "warning":
        return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />;
      case "info":
        return <Info className={cn(iconClass, "text-blue-500")} />;
      case "success":
        return <CheckCircle2 className={cn(iconClass, "text-green-500")} />;
      default:
        return <AlertCircle className={cn(iconClass, "text-red-500")} />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
      case "success":
        return "border-green-200 bg-green-50 text-green-800";
      default:
        return "border-red-200 bg-red-50 text-red-800";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "p-3";
      case "md":
        return "p-4";
      case "lg":
        return "p-6";
      default:
        return "p-4";
    }
  };

  return (
    <Alert className={cn(getVariantStyles(), getSizeStyles(), className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {showIcon && getIcon()}
          <div className="flex-1 min-w-0">
            <AlertTitle 
              className={cn(
                "font-semibold",
                size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
              )}
            >
              {title}
            </AlertTitle>
            <AlertDescription 
              className={cn(
                "mt-1",
                size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
              )}
            >
              {description}
            </AlertDescription>
            
            {children && (
              <div className="mt-3">
                {children}
              </div>
            )}

            {/* Action Buttons */}
            {(onRetry || onGoHome || onGoBack) && (
              <div className="flex items-center space-x-2 mt-4">
                {onRetry && (
                  <Button
                    variant="outline"
                    size={size === "sm" ? "sm" : "default"}
                    onClick={onRetry}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Try Again</span>
                  </Button>
                )}
                
                {onGoBack && (
                  <Button
                    variant="ghost"
                    size={size === "sm" ? "sm" : "default"}
                    onClick={onGoBack}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Go Back</span>
                  </Button>
                )}

                {onGoHome && (
                  <Button
                    variant="ghost"
                    size={size === "sm" ? "sm" : "default"}
                    onClick={onGoHome}
                    className="flex items-center space-x-2"
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

// Preset Error Components
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => (
  <Error
    title="Network Error"
    description="Unable to connect to the server. Please check your internet connection."
    variant="error"
    onRetry={onRetry}
  />
);

export const NotFoundError = ({ onGoHome, onGoBack }: { 
  onGoHome?: () => void; 
  onGoBack?: () => void; 
}) => (
  <Error
    title="Page Not Found"
    description="The page you're looking for doesn't exist or has been moved."
    variant="warning"
    onGoHome={onGoHome}
    onGoBack={onGoBack}
  />
);

export const UnauthorizedError = ({ onGoHome }: { onGoHome?: () => void }) => (
  <Error
    title="Access Denied"
    description="You don't have permission to access this resource."
    variant="error"
    onGoHome={onGoHome}
  />
);

export const ServerError = ({ onRetry }: { onRetry?: () => void }) => (
  <Error
    title="Server Error"
    description="Something went wrong on our end. Please try again later."
    variant="error"
    onRetry={onRetry}
  />
);

export const ValidationError = ({ 
  errors, 
  onDismiss 
}: { 
  errors: string[]; 
  onDismiss?: () => void;
}) => (
  <Error
    title="Validation Error"
    description="Please correct the following errors:"
    variant="warning"
    dismissible
    onDismiss={onDismiss}
  >
    <ul className="list-disc list-inside space-y-1 text-sm">
      {errors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  </Error>
);

export default Error;

// // Basic Error
// <Error 
//   title="Something went wrong" 
//   description="Please try again later" 
// />

// // Error with actions
// <Error
//   title="Failed to load data"
//   description="Unable to fetch the requested information"
//   variant="error"
//   onRetry={() => refetch()}
//   onGoBack={() => router.back()}
// />

// // Warning with dismiss
// <Error
//   title="Warning"
//   description="This action cannot be undone"
//   variant="warning"
//   dismissible
//   onDismiss={() => setShowWarning(false)}
// />

// // Preset components
// <NetworkError onRetry={() => refetch()} />
// <NotFoundError onGoHome={() => router.push("/")} />
// <ValidationError 
//   errors={["Email is required", "Password must be at least 8 characters"]}
//   onDismiss={() => setErrors([])}
// />