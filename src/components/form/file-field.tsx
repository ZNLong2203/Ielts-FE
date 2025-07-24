import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  FileText,
  Eye,
  Check,
} from "lucide-react";
import { Control } from "react-hook-form";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface FileUploadFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
  description?: string;
}

// Separate interface for internal metadata
interface FileMetadata {
  name: string;
  type: string;
  size: number;
  base64Data: string;
  originalFile: File;
}

const FileUploadField = ({
  control,
  name,
  label,
  accept = "image/*,.pdf,.doc,.docx",
  multiple = false,
  maxSize = 5, // 5MB default
  className,
  placeholder = "Click to upload or drag and drop",
  description,
}: FileUploadFieldProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  // Store file metadata separately for UI display
  const [fileMetadata, setFileMetadata] = useState<FileMetadata[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const validateFile = (file: File) => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  // Convert File to base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (data:image/jpeg;base64,)
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (
    files: FileList | null,
    onChange: (value: any) => void
  ) => {
    if (!files) return;

    setIsConverting(true);
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files first
    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
      setIsConverting(false);
      return;
    }

    try {
      const base64Strings: string[] = [];
      const metadata: FileMetadata[] = [];

      for (const file of validFiles) {
        const base64Data = await fileToBase64(file);
        base64Strings.push(base64Data);
        
        // Store metadata for UI display
        metadata.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data: base64Data,
          originalFile: file,
        });
      }

      // Update metadata state
      if (multiple) {
        setFileMetadata(prev => [...prev, ...metadata]);
      } else {
        setFileMetadata(metadata);
      }

      // Send only base64 strings to form (matching File: string[] interface)
      if (multiple) {
        // For multiple files, append to existing array
        const currentValue = Array.isArray(onChange) ? onChange : [];
        onChange([...currentValue, ...base64Strings]);
      } else {
        // For single file, replace
        onChange(base64Strings[0] || null);
      }
      
    } catch (error) {
      console.error("Error converting files:", error);
      alert("Error processing files. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const removeFile = (
    indexToRemove: number,
    currentFiles: string[],
    onChange: (value: any) => void
  ) => {
    // Remove from metadata
    const updatedMetadata = fileMetadata.filter((_, index) => index !== indexToRemove);
    setFileMetadata(updatedMetadata);

    // Remove from form value
    if (multiple) {
      const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
      onChange(updatedFiles.length > 0 ? updatedFiles : []);
    } else {
      onChange(null);
      setFileMetadata([]);
    }
  };

  const previewFile = (metadata: FileMetadata) => {
    if (metadata.type.startsWith("image/")) {
      const url = URL.createObjectURL(metadata.originalFile);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } else {
      // For non-image files, create blob from base64 and open
      const byteCharacters = atob(metadata.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: metadata.type });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const FilePreviewItem = ({
    metadata,
    index,
    onRemove,
    onPreview,
  }: {
    metadata: FileMetadata;
    index: number;
    onRemove: () => void;
    onPreview: () => void;
  }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 flex-1">
        {getFileIcon(metadata.type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {metadata.name}
            </p>
            <Badge variant="secondary" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Converted
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {formatFileSize(metadata.size)} • {metadata.type}
          </p>
          <p className="text-xs text-blue-600">
            Binary size: {formatFileSize(metadata.base64Data.length * 0.75)}
          </p>
          {metadata.type.startsWith("image/") && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(metadata.originalFile)}
                alt={metadata.name}
                className="h-12 w-12 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold">{label}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
                  dragOver
                    ? "border-blue-500 bg-blue-50"
                    : field.value && (Array.isArray(field.value) ? field.value.length > 0 : field.value)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400",
                  isConverting && "opacity-50 pointer-events-none",
                  className
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileChange(e.dataTransfer.files, field.onChange);
                }}
                onClick={() => !isConverting && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  onChange={(e) =>
                    handleFileChange(e.target.files, field.onChange)
                  }
                  className="hidden"
                  disabled={isConverting}
                />

                <div className="text-center">
                  <Upload
                    className={cn(
                      "mx-auto h-12 w-12",
                      isConverting
                        ? "animate-spin text-blue-500"
                        : field.value && (Array.isArray(field.value) ? field.value.length > 0 : field.value)
                        ? "text-green-500"
                        : "text-gray-400"
                    )}
                  />
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                      {isConverting
                        ? "Converting files to binary format..."
                        : fileMetadata.length > 0
                        ? multiple
                          ? `${fileMetadata.length} file(s) converted`
                          : "File converted"
                        : placeholder}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {accept.includes("image") && "Images, "}
                      PDF, DOC, DOCX up to {maxSize}MB
                    </p>
                    {fileMetadata.length > 0 && !isConverting && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        ✓ Ready to submit as binary data
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Preview */}
              {fileMetadata.length > 0 && !isConverting && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      Converted Files:
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {fileMetadata.length} {fileMetadata.length === 1 ? 'file' : 'files'}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {fileMetadata.map((metadata, index) => (
                      <FilePreviewItem
                        key={index}
                        metadata={metadata}
                        index={index}
                        onRemove={() =>
                          removeFile(index, field.value || [], field.onChange)
                        }
                        onPreview={() => previewFile(metadata)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
          </FormControl>
          <FormMessage />

          {/* Image Preview Dialog */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
              </DialogHeader>
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-96 object-contain rounded-lg"
                    onLoad={() => {
                      return () => URL.revokeObjectURL(previewUrl);
                    }}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </FormItem>
      )}
    />
  );
};

export default FileUploadField;