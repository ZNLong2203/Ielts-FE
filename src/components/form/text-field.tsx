import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Control } from "react-hook-form";
import { useState, ReactNode } from "react";

interface TextFieldProps {
  control: Control<any>;
  name: string;
  label: string | ReactNode;
  placeholder?: string;
  className?: string;
  type?: string;
  inputMode?:
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
  required?: boolean;
  showPasswordToggle?: boolean;
  onValueChange?: (value: string) => void;
}

const TextField = ({
  control,
  name,
  label,
  placeholder,
  className,
  required,
  type = "text",
  inputMode,
  showPasswordToggle = false,
  onValueChange,
}: TextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const actualType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold">{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={actualType}
                inputMode={inputMode}
                placeholder={
                  placeholder || (typeof label === "string" ? label : "")
                }
                className={className}
                {...field}
                value={field.value ?? ""}
                required={required}
                onChange={(e) => {
                  let value: any = e.target.value;

                  // Handle number conversion for number fields
                  if (type === "number") {
                    // Allow empty string for clearing the field
                    if (value === "") {
                      value = 0; // or undefined depending on your schema
                    } else {
                      value = parseFloat(value);
                      if (isNaN(value)) {
                        value = 0; // or handle as needed
                      }
                    }
                  }

                  field.onChange(value);
                  onValueChange?.(e.target.value);
                }}
              />
              {showPasswordToggle && type === "password" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextField;
