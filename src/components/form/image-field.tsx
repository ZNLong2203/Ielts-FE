"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { Control } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  disabled?: boolean;
  currentImage?: string;
  fallback?: string;
  maxSize?: number; // in MB
}

const ImageUploadField = ({
  control,
  name,
  label,
  disabled = false,
  currentImage,
  fallback = "U",
  maxSize = 2, // Default 2MB
}: ImageUploadFieldProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

 const handleFileChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Check file size (convert MB to bytes)
  const maxSizeInBytes = maxSize * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    toast.error(`File size must be less than ${maxSize}MB`);
    event.target.value = "";
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select a valid image file');
    event.target.value = "";
    return;
  }

  setIsUploading(true);

  // Create preview for UI
  const reader = new FileReader();
  reader.onloadend = () => {
    const result = reader.result as string;
    setPreview(result);
    
    // Store file object in form (not base64)
    onChange(file as any); // Temporary store file object
    setIsUploading(false);
  };
  
  reader.onerror = () => {
    toast.error('Failed to read file');
    setIsUploading(false);
  };
  
  reader.readAsDataURL(file);
};

  // Simple image compression function
  const compressImage = (
    base64: string, 
    callback: (compressed: string) => void,
    quality: number = 0.8
  ) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800x800 for profile pictures)
      const maxDimension = 800;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Check if compressed image is still under size limit
      const compressedSize = (compressedBase64.length * 3) / 4; // Approximate size
      const maxSizeInBytes = maxSize * 1024 * 1024;
      
      if (compressedSize > maxSizeInBytes && quality > 0.1) {
        // Try with lower quality
        compressImage(base64, callback, quality - 0.1);
      } else {
        callback(compressedBase64);
      }
    };
    
    img.src = base64;
  };

  const clearImage = (onChange: (value: string) => void) => {
    setPreview(null);
    onChange("");
    toast.success('Image removed');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold">{label}</FormLabel>
          <div className="flex items-center space-x-4">
            {/* Avatar Preview */}
            <Avatar className="h-20 w-20">
              <AvatarImage src={preview || field.value || currentImage} />
              <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
            </Avatar>

            {/* Upload Controls */}
            <div className="flex flex-col space-y-2">
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, field.onChange)}
                    disabled={disabled || isUploading}
                    className="hidden"
                    id={`${name}-upload`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById(`${name}-upload`)?.click()
                    }
                    disabled={disabled || isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  
                  {(preview || field.value) && !isUploading && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => clearImage(field.onChange)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, max {maxSize}MB
                <br />
                Supported formats: JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageUploadField;