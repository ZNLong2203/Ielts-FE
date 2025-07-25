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

  const handleFileChange = (
    files: FileList | null,
    onChange: (value: any) => void
  ) => {
    if (!files) return;

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
      return;
    }

    // Store files directly as File objects
    if (multiple) {
      onChange(validFiles); // Array of File objects
    } else {
      onChange(validFiles[0] || null); // Single File object or null
    }
  };

  const removeFile = (
    indexToRemove: number,
    currentFiles: File | File[] | null,
    onChange: (value: any) => void
  ) => {
    if (multiple && Array.isArray(currentFiles)) {
      const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
      onChange(updatedFiles.length > 0 ? updatedFiles : null);
    } else {
      onChange(null);
    }
  };

  const previewFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } else {
      // For non-image files, open in new tab
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    }
  };

  const FilePreviewItem = ({
    file,
    index,
    onRemove,
    onPreview,
  }: {
    file: File;
    index: number;
    onRemove: () => void;
    onPreview: () => void;
  }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 flex-1">
        {getFileIcon(file.type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <Badge variant="secondary" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Selected
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)} • {file.type}
          </p>
          {file.type.startsWith("image/") && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
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
      render={({ field }) => {
        const files = field.value;
        const fileArray = multiple && Array.isArray(files) ? files : files ? [files] : [];
        const hasFiles = fileArray.length > 0;

        return (
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
                      : hasFiles
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400",
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
                  onClick={() => fileInputRef.current?.click()}
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
                  />

                  <div className="text-center">
                    <Upload
                      className={cn(
                        "mx-auto h-12 w-12",
                        hasFiles ? "text-green-500" : "text-gray-400"
                      )}
                    />
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900">
                        {hasFiles
                          ? multiple
                            ? `${fileArray.length} file(s) selected`
                            : "File selected"
                          : placeholder}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {accept.includes("image") && "Images, "}
                        PDF, DOC, DOCX up to {maxSize}MB
                      </p>
                      {hasFiles && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          ✓ Ready to upload
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Preview */}
                {hasFiles && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        Selected Files:
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {fileArray.length} {fileArray.length === 1 ? 'file' : 'files'}
                      </Badge>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {fileArray.map((file: File, index: number) => (
                        <FilePreviewItem
                          key={`${file.name}-${index}`}
                          file={file}
                          index={index}
                          onRemove={() =>
                            removeFile(index, field.value, field.onChange)
                          }
                          onPreview={() => previewFile(file)}
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
        );
      }}
    />
  );
};

export default FileUploadField;