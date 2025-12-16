"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCertificateMutation } from "@/hooks/useTeacherProfile";
import { ITeacher, ITeacherUpdate } from "@/interface/teacher";
import {
  Award,
  Briefcase,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Save,
  Star,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ProfessionalInformationCardProps {
  teacher?: ITeacher;
  onUpdate: (data: ITeacherUpdate) => void;
  isUpdating: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const SPECIALIZATIONS = [
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
];

const ProfessionalInformationCard = ({
  teacher,
  onUpdate,
  isUpdating,
  isEditing,
  setIsEditing,
}: ProfessionalInformationCardProps) => {
  const [form, setForm] = useState<ITeacherUpdate>({
    qualification: "",
    experience_years: 0,
    specializations: [],
    ielts_band_score: 0,
    teaching_style: "",
    hourly_rate: 0,
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [certUrl, setCertUrl] = useState("");
  const [certBlobUrl, setCertBlobUrl] = useState("");
  const certInputRef = useRef<HTMLInputElement>(null);
  const updateCertMutation = useUpdateCertificateMutation();

  useEffect(() => {
    if (teacher) {
      // Filter out invalid specializations that don't exist in SPECIALIZATIONS
      const validSpecializations = (teacher.specializations || []).filter(
        (spec) => SPECIALIZATIONS.some((s) => s.value === spec)
      );

      setForm({
        qualification: teacher.qualification || "",
        experience_years: teacher.experience_years || 0,
        specializations: validSpecializations,
        ielts_band_score: teacher.ielts_band_score || 0,
        teaching_style: teacher.teaching_style || "",
        hourly_rate: teacher.hourly_rate || 0,
      });
    }
  }, [teacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", form);
    onUpdate(form);
  };

  const toggleSpecialization = (value: string) => {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations?.includes(value)
        ? prev.specializations.filter((s) => s !== value)
        : [...(prev.specializations || []), value],
    }));
  };

  const getFileType = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith(".pdf")) return "pdf";
    if (lowerUrl.match(/\.(jpg|jpeg|png)$/)) return "image";
    return "unknown";
  };

  const handleViewCert = async (url: string) => {
    setCertUrl(url);
    setShowCertModal(true);

    // Only fetch blob if not already cached for this URL
    if (getFileType(url) === "pdf" && !certBlobUrl && url !== certUrl) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        if (certBlobUrl) URL.revokeObjectURL(certBlobUrl);
        setCertBlobUrl(blobUrl);
      } catch (error) {
        console.error("Failed to load PDF:", error);
      }
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (certBlobUrl) {
        URL.revokeObjectURL(certBlobUrl);
      }
    };
  }, [certBlobUrl]);

  // Clear blob cache when certificate URL actually changes
  useEffect(() => {
    const currentCertUrl = teacher?.certificate_urls?.[0];
    if (certBlobUrl && currentCertUrl && currentCertUrl !== certUrl) {
      URL.revokeObjectURL(certBlobUrl);
      setCertBlobUrl("");
      setCertUrl("");
    }
  }, [teacher?.certificate_urls?.[0]]);

  const handleDownloadCert = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "certificate";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCertUpload = () => {
    certInputRef.current?.click();
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      alert(
        "Invalid file type. Please upload a PDF or image file (JPG, PNG, JPEG)."
      );
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 10MB.");
      return;
    }

    updateCertMutation.mutate(file);
    // Reset input
    if (certInputRef.current) {
      certInputRef.current.value = "";
    }
  };

  if (!teacher) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-center">
          No professional information available
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              Professional Information
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Your teaching credentials
            </p>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {!isEditing ? (
          <div>
            <InfoRow
              icon={Award}
              label="Qualification"
              value={form.qualification || "Not set"}
            />
            <InfoRow
              icon={Briefcase}
              label="Experience"
              value={`${form.experience_years || 0} years`}
            />
            <InfoRow
              icon={Star}
              label="IELTS Band Score"
              value={form.ielts_band_score?.toString() || "Not set"}
            />
            <InfoRow
              icon={DollarSign}
              label="Hourly Rate"
              value={`${(form.hourly_rate || 0).toLocaleString()} VND`}
            />
            <InfoRow
              icon={Star}
              label="Rating"
              value={
                teacher.ratings
                  ? `${teacher.ratings.toFixed(1)} / 5.0`
                  : "Not rated yet"
              }
              isReadonly
            />
            <InfoRow
              icon={Award}
              label="Email Verified Status"
              value={teacher.is_verified ? "Verified" : "Not Verified"}
              isReadonly
            />
            <div className="py-3 border-b">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                Specializations
              </p>
              <div className="flex flex-wrap gap-2">
                {form.specializations && form.specializations.length > 0 ? (
                  form.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">
                      {spec}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Not set</span>
                )}
              </div>
            </div>
            {form.teaching_style && (
              <div className="py-3 border-b">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Teaching Style
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {form.teaching_style}
                </p>
              </div>
            )}
            {teacher.certificate_urls &&
              teacher.certificate_urls.length > 0 && (
                <div className="py-3">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-2">
                    Certification
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="p-2 bg-white rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Certificate Document
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getFileType(teacher.certificate_urls[0]) === "pdf"
                          ? "PDF Document"
                          : "Image File"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewCert(teacher.certificate_urls[0])
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadCert(teacher.certificate_urls[0])
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCertUpload}
                        disabled={updateCertMutation.isPending}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {updateCertMutation.isPending
                          ? "Uploading..."
                          : "Replace"}
                      </Button>
                    </div>
                  </div>
                  <input
                    ref={certInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleCertChange}
                    className="hidden"
                  />
                </div>
              )}
            {(!teacher.certificate_urls ||
              teacher.certificate_urls.length === 0) && (
              <div className="py-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Certification
                </p>
                <Button
                  variant="outline"
                  onClick={handleCertUpload}
                  disabled={updateCertMutation.isPending}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {updateCertMutation.isPending
                    ? "Uploading..."
                    : "Upload Certificate"}
                </Button>
                <input
                  ref={certInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleCertChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="qualification"
                className="text-sm font-medium text-gray-700"
              >
                Qualification
              </Label>
              <Input
                id="qualification"
                value={form.qualification}
                onChange={(e) =>
                  setForm({ ...form, qualification: e.target.value })
                }
                required
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="experience_years"
                  className="text-sm font-medium text-gray-700"
                >
                  Experience (years)
                </Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={form.experience_years}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      experience_years: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="ielts_band_score"
                  className="text-sm font-medium text-gray-700"
                >
                  IELTS Band Score
                </Label>
                <Input
                  id="ielts_band_score"
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={form.ielts_band_score}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      ielts_band_score: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="hourly_rate"
                className="text-sm font-medium text-gray-700"
              >
                Hourly Rate (VND)
              </Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                value={form.hourly_rate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hourly_rate: parseInt(e.target.value) || 0,
                  })
                }
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Specializations
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2 p-4 bg-gray-50 rounded-lg">
                {SPECIALIZATIONS.map((spec) => (
                  <label
                    key={spec.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.specializations?.includes(spec.value)}
                      onChange={() => toggleSpecialization(spec.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{spec.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="teaching_style"
                className="text-sm font-medium text-gray-700"
              >
                Teaching Style (Optional)
              </Label>
              <Textarea
                id="teaching_style"
                value={form.teaching_style}
                onChange={(e) =>
                  setForm({ ...form, teaching_style: e.target.value })
                }
                rows={3}
                className="resize-none"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        )}
      </div>

      {/* Certificate Preview Modal */}
      <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Certificate Preview</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                className="mr-5"
                onClick={() => handleDownloadCert(certUrl)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <DialogDescription>
              View or download your certificate document
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {certUrl && getFileType(certUrl) === "pdf" ? (
              <iframe
                src={certBlobUrl || certUrl}
                className="w-full h-[70vh] border rounded"
                title="Certificate PDF"
              />
            ) : certUrl && getFileType(certUrl) === "image" ? (
              <Image
                src={certUrl}
                alt="Certificate"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto rounded"
              />
            ) : (
              <p className="text-center text-gray-500">
                Unable to preview this file type
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  isReadonly = false,
}: {
  icon: any;
  label: string;
  value: string;
  isReadonly?: boolean;
}) => {
  return (
    <div
      className={`flex items-start gap-3 py-3 border-b last:border-b-0 ${
        isReadonly ? "bg-gray-50" : ""
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          isReadonly ? "bg-gray-100" : "bg-gray-50"
        }`}
      >
        <Icon
          className={`w-4 h-4 ${
            isReadonly ? "text-gray-400" : "text-gray-600"
          }`}
        />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
          {label}
          {isReadonly && (
            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
              READ ONLY
            </span>
          )}
        </p>
        <p
          className={`text-sm font-medium mt-1 ${
            isReadonly ? "text-gray-500" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default ProfessionalInformationCard;
