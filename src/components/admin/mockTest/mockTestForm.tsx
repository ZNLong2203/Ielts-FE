"use client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  Target,
  FileText,
  Star,
  ArrowRight,
  Plus,
  Trash2,
  Calculator,
  Settings,
  Award,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MockTestFormSchema,
  MockTestFormUpdateSchema,
} from "@/validation/mockTest";
import { createMockTest, getMockTest, updateMockTest } from "@/api/mockTest";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect, useState } from "react";
import { IMockTestSection } from "@/interface/mockTest";
import {
  TEST_TYPE_OPTIONS,
  DIFFICULTY_LEVEL_OPTIONS,
  SECTION_TYPE_OPTIONS,
} from "@/constants/mockTest";

const MockTestForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(param.slug) ? param.slug[0] : param.slug;
  const isEditing = !!mockTestId;

  const title = isEditing ? "Update Mock Test" : "Create New Mock Test";
  const description = isEditing
    ? "Update mock test information and sections"
    : "Create a comprehensive IELTS mock test with multiple sections";

  const [sections, setSections] = useState<IMockTestSection[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);

  // Queries
  const {
    data: mockTestData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["mockTest", mockTestId],
    queryFn: () => getMockTest(mockTestId),
    enabled: !!mockTestId,
  });

  // Form setup - Use different schemas based on mode
  const schema = isEditing ? MockTestFormUpdateSchema : MockTestFormSchema;

  const mockTestForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      test_type: "full_test",
      instructions: "",
      duration: 180,
      deleted: false,
      difficulty_level: "2",
      description: "",
      test_sections: [],
    },
  });

  const selectedTestType = mockTestForm.watch("test_type");

  // Mutations
  const createMockTestMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof MockTestFormSchema>) => {
      const payload = {
        ...formData,
        test_sections: sections,
        duration: totalDuration,
        instructions: formData.instructions || "",
        deleted: formData.deleted || false,
        difficulty_level: formData.difficulty_level || "1",
        description: formData.description || "",
      };
      console.log("Creating with payload:", payload);
      return createMockTest(payload);
    },
    onSuccess: () => {
      toast.success("Mock test created successfully");
      queryClient.invalidateQueries({ queryKey: ["mockTests"] });
      router.push(ROUTES.ADMIN_MOCK_TESTS);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create mock test"
      );
    },
  });

  const updateMockTestMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof MockTestFormUpdateSchema>) => {
      const payload = {
        ...formData,
        test_sections: sections,
        duration: totalDuration,
        instructions: formData.instructions || "",
        deleted: formData.deleted || false,
        difficulty_level: formData.difficulty_level || "1",
        description: formData.description || "",
      };
      console.log("Updating with payload:", payload);
      return updateMockTest(mockTestId!, payload);
    },
    onSuccess: (data) => {
      console.log("Update success:", data);
      toast.success("Mock test updated successfully");
      queryClient.invalidateQueries({ queryKey: ["mockTests"] });
      queryClient.invalidateQueries({ queryKey: ["mockTest", mockTestId] });
      router.push(ROUTES.ADMIN_MOCK_TESTS);
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update mock test"
      );
    },
  });

  // Section management functions
  const addSection = () => {
    const newSection: IMockTestSection = {
      section_name: `Section ${sections.length + 1}`,
      section_type: "reading",
      duration: 60,
      ordering: sections.length + 1,
      description: "",
    };
    mockTestForm.setValue("test_sections", [...sections, newSection]);
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const newSections = sections.filter((_, i) => i !== index);
      const updatedSections = newSections.map((section, i) => ({
        ...section,
        ordering: i + 1,
      }));
      setSections(updatedSections);
      mockTestForm.setValue("test_sections", updatedSections);
    }
  };

  const updateSection = (
    index: number,
    field: keyof IMockTestSection,
    value: any
  ) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    mockTestForm.setValue("test_sections", newSections);
    setSections(newSections);
  };

  // Get initial sections based on test type
  const getInitialSections = (testType: string): IMockTestSection[] => {
    const sectionsMap: Record<string, IMockTestSection[]> = {
      full_test: [
        {
          section_name: "Listening",
          section_type: "listening",
          duration: 40,
          ordering: 1,
          description:
            "Listen carefully to the audio recordings and answer the questions.",
        },
        {
          section_name: "Reading",
          section_type: "reading",
          duration: 60,
          ordering: 2,
          description: "Read the passages and answer the questions.",
        },
        {
          section_name: "Writing",
          section_type: "writing",
          duration: 40,
          ordering: 3,
          description: "Write at least 250 words on the given topic.",
        },
        {
          section_name: "Speaking",
          section_type: "speaking",
          duration: 15,
          ordering: 4,
          description: "Answer questions about yourself and familiar topics.",
        },
      ],
      listening: [
        {
          section_name: "Listening Test",
          section_type: "listening",
          duration: 40,
          ordering: 1,
          description: "Listen to the recordings and answer all questions.",
        },
      ],
      reading: [
        {
          section_name: "Reading Test",
          section_type: "reading",
          duration: 60,
          ordering: 1,
          description: "Read the passages carefully and answer all questions.",
        },
      ],
      writing: [
        {
          section_name: "Writing",
          section_type: "writing",
          duration: 60,
          ordering: 1,
          description: "Write at least 150 words.",
        
        },
      ],
      speaking: [
        {
          section_name: "Speaking",
          section_type: "speaking",
          duration: 15,
          ordering: 1,
          description: "Introduction and interview.",
        },
      ],
    };
    return sectionsMap[testType] || [];
  };
  useEffect(() => {
    // Update form sections field whenever sections state changes
    mockTestForm.setValue("test_sections", sections);
  }, [sections, mockTestForm]);

  // Calculate total duration
  useEffect(() => {
    const total = sections.reduce((sum, section) => sum + section.duration, 0);
    setTotalDuration(total);
    mockTestForm.setValue("duration", total);
  }, [sections, mockTestForm]);

  // Initialize sections based on test type (only for new tests)
  useEffect(() => {
    if (
      selectedTestType &&
      sections.length === 0 &&
      !isEditing &&
      !mockTestData
    ) {
      console.log("Initializing sections for:", selectedTestType);
      setSections(getInitialSections(selectedTestType));
    }
  }, [selectedTestType, isEditing, mockTestData]);

  // Load existing data
  useEffect(() => {
    if (mockTestData && isEditing) {

      // Reset form with existing data
      mockTestForm.reset({
        title: mockTestData.title || "",
        test_type: mockTestData.test_type || "full_test",
        instructions: mockTestData.instructions || "",
        duration: mockTestData.duration || 180,
        difficulty_level: mockTestData.difficulty_level?.toString() || "2",
        description: mockTestData.description || "",
        deleted: mockTestData.deleted || false,
        test_sections: mockTestData.test_sections || [],
      });

      // Set sections state
      if (
        mockTestData.test_sections &&
        Array.isArray(mockTestData.test_sections)
      ) {
        console.log("Setting sections:", mockTestData.test_sections);
        setSections(mockTestData.test_sections);
      } else {
        // Fallback to default sections if none exist
        const initialSections = getInitialSections(mockTestData.test_type);
        setSections(initialSections);
      }
    }
  }, [mockTestData, isEditing, mockTestForm]);

  // Update onSubmit to use correct types
  const onSubmit = async (data: any) => {
    if (sections.length === 0) {
      toast.error("Please add at least one section to the test");
      return;
    }

    try {
      if (isEditing) {
        await updateMockTestMutation.mutateAsync(data);
      } else {
        await createMockTestMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const isSubmitting =
    createMockTestMutation.isPending || updateMockTestMutation.isPending;

  if (isLoading && isEditing) {
    return <Loading />;
  }

  if (isError && isEditing) {
    return (
      <Error
        title="Mock Test Not Found"
        description="The requested mock test does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.ADMIN_MOCK_TESTS)}
              className="flex items-center space-x-2"
            >
              <span>Back to Mock Tests</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...mockTestForm}>
          <form
            onSubmit={(e) => {
              mockTestForm.handleSubmit(onSubmit)(e);
            }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TextField
                      control={mockTestForm.control}
                      name="title"
                      label="Test Title"
                      placeholder="Enter test title..."
                      required
                    />

                    <TextField
                      control={mockTestForm.control}
                      name="description"
                      label="Description"
                      placeholder="Enter test description..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField
                        control={mockTestForm.control}
                        name="test_type"
                        label="Test Type"
                        placeholder="Select test type"
                        options={TEST_TYPE_OPTIONS.map((option) => ({
                          label: option.label,
                          value: option.value,
                        }))}
                      />
                    </div>

                    <SelectField
                      control={mockTestForm.control}
                      name="difficulty_level"
                      label="Difficulty Level"
                      placeholder="Select difficulty level"
                      options={DIFFICULTY_LEVEL_OPTIONS}
                    />

                    <TextField
                      control={mockTestForm.control}
                      name="instructions"
                      label="General Instructions"
                      placeholder="Enter general instructions for the test..."
                    />
                  </CardContent>
                </Card>

                {/* Test Sections - Enhanced Design */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="border-t">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-xl">
                          <Settings className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Test Sections
                          </h3>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSection}
                        className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Section</span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {sections.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Target className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No sections yet
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                          Create your first section to start building your mock
                          test. Each section can have its own timing and
                          instructions.
                        </p>
                        <Button
                          type="button"
                          onClick={addSection}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Section
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {sections.map((section, index) => (
                          <div key={index} className="relative group">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300">
                              {/* Section Header */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                                      {index + 1}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {section.section_name ||
                                        `Section ${index + 1}`}
                                    </h4>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                      <span className="capitalize">
                                        {section.section_type.replace("_", " ")}
                                      </span>
                                      <span>•</span>
                                      <span>{section.duration} minutes</span>
                                    </div>
                                  </div>
                                </div>

                                {sections.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSection(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {/* Section Form Fields */}
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                      <FileText className="h-4 w-4 text-gray-500" />
                                      <span>Section Name</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={section.section_name}
                                      onChange={(e) =>
                                        updateSection(
                                          index,
                                          "section_name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                      placeholder="e.g., Listening Comprehension"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                      <Settings className="h-4 w-4 text-gray-500" />
                                      <span>Section Type</span>
                                    </label>
                                    <select
                                      value={section.section_type}
                                      onChange={(e) =>
                                        updateSection(
                                          index,
                                          "section_type",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                    >
                                      {SECTION_TYPE_OPTIONS.map((option) => (
                                        <option
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-gray-500" />
                                      <span>Duration</span>
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="number"
                                        min="1"
                                        max="180"
                                        value={section.duration}
                                        onChange={(e) =>
                                          updateSection(
                                            index,
                                            "duration",
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                                        placeholder="60"
                                      />
                                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-sm text-gray-500 font-medium">
                                          minutes
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    <span>Section Instructions</span>
                                  </label>
                                  <textarea
                                    value={section.description}
                                    onChange={(e) =>
                                      updateSection(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                                    placeholder="Provide specific description for this section..."
                                  />
                                </div>
                              </div>

                              {/* Section Footer */}
                              <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <span>
                                    Section {index + 1} of {sections.length}
                                  </span>
                                  <div className="flex items-center space-x-4">
                                    <span>Order: {section.ordering}</span>
                                    <span>•</span>
                                    <span className="capitalize">
                                      {section.section_type.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {index < sections.length - 1 && (
                              <div className="flex justify-center my-4">
                                <div className="w-px h-6 bg-gray-300"></div>
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-center pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addSection}
                            className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                          >
                            <Plus className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-600 font-medium">
                              Add Another Section
                            </span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Test Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      <span>Test Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Sections:</span>
                        <span className="font-medium">{sections.length}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Duration:</span>
                        <span className="font-medium">
                          {Math.floor(totalDuration / 60)}h {totalDuration % 60}
                          m
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Test Type:</span>
                        <span className="font-medium capitalize">
                          {selectedTestType?.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Difficulty:</span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i <
                                parseInt(
                                  mockTestForm.watch("difficulty_level") || "0"
                                )
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Status:</span>
                        <div className="flex items-center space-x-2">
                          {!mockTestForm.watch("deleted") ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <span>Test Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-green-600" />
                          <label className="text-sm font-medium">
                            Active Test
                          </label>
                        </div>
                        <div className="text-sm text-gray-600">
                          Test is visible to students
                        </div>
                      </div>
                      <Switch
                        checked={!mockTestForm.watch("deleted")}
                        onCheckedChange={(checked) =>
                          mockTestForm.setValue("deleted", !checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting || sections.length === 0}
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {isSubmitting
                            ? isEditing
                              ? "Updating..."
                              : "Creating..."
                            : isEditing
                            ? "Update Mock Test"
                            : "Create Mock Test"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default MockTestForm;
