import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Control } from "react-hook-form";
import { useState } from "react";

interface TagsFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
}

const TagsField = ({
  control,
  name,
  label,
  placeholder = "Type and press Enter",
  className,
}: TagsFieldProps) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const tags = field.value || [];

        const addTag = (newTag: string) => {
          const trimmedTag = newTag.trim();
          if (trimmedTag && !tags.includes(trimmedTag)) {
            field.onChange([...tags, trimmedTag]);
            setInputValue("");
          }
        };

        const removeTag = (tagToRemove: string) => {
          field.onChange(tags.filter((tag: string) => tag !== tagToRemove));
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
          }
        };

        return (
          <FormItem>
            <FormLabel className="text-lg font-semibold">{label}</FormLabel>
            <FormControl>
              <div className="space-y-2">
                {/* Display tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                    {tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Input field */}
                <Input
                  type="text"
                  placeholder={placeholder}
                  className={className}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (inputValue.trim()) {
                      addTag(inputValue);
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Press Enter or comma to add a goal
                </p>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default TagsField;