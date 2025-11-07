"use client";
import {
  Form,
} from "@/components/ui/form";
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
  Clock,
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
} from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MockTestFormSchema } from "@/validation/mockTest";
import { createMockTest, getMockTest } from "@/api/mockTest";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { useEffect, useState } from "react";
import { IMockTestSection } from "@/interface/mockTest";
import { 
  TEST_TYPE_OPTIONS as testTypeOptions,
  TEST_LEVEL_OPTIONS as testLevelOptions,
  DIFFICULTY_LEVEL_OPTIONS as difficultyLevelOptions,
  SECTION_TYPE_OPTIONS as sectionTypeOptions,
} from "@/constants/mockTest";

const MockTestForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(param.mockTestId)
    ? param.mockTestId[0]
    : param.mockTestId;

  let title = "";
  let description = "";
  if (mockTestId === undefined || param.mockTestId === "") {
    title = "Create New Mock Test";
    description =
      "Create a comprehensive IELTS mock test with multiple sections";
  } else {
    title = "Edit Mock Test";
    description = "Update mock test information and sections";
  }

  // State for sections management
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
    enabled: mockTestId !== undefined && mockTestId !== "",
  });

  // Mutations
  const createMockTestMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof MockTestFormSchema>) => {
      return createMockTest({
        ...formData,
        instructions: formData.instructions || "",
        description: formData.description || "",
        sections: sections,
        time_limit: totalDuration,
        is_active: formData.is_active ?? true,
        difficulty_level: formData.difficulty_level ?? "2",
      });
    },
    onSuccess: (data) => {
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

  // Form setup
  const mockTestForm = useForm<z.infer<typeof MockTestFormSchema>>({
    resolver: zodResolver(MockTestFormSchema),
    defaultValues: {
      title: "",
      test_type: "full_test",
      test_level: "intermediate",
      instructions: "",
      time_limit: 180, // 3 hours default
      is_active: true,
      difficulty_level: "2",
      description: "",
      sections: [],
    },
  });

  const selectedTestType = mockTestForm.watch("test_type");

  // Section management functions
  const addSection = () => {
    const newSection: IMockTestSection = {
      section_name: `Section ${sections.length + 1}`,
      section_type: "reading",
      time_limit: 60,
      ordering: sections.length + 1,
      instructions: "",
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const newSections = sections.filter((_, i) => i !== index);
      // Update ordering
      const updatedSections = newSections.map((section, i) => ({
        ...section,
        ordering: i + 1,
      }));
      setSections(updatedSections);
    }
  };

  const updateSection = (
    index: number,
    field: keyof IMockTestSection,
    value: any
  ) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  // Calculate total duration
  useEffect(() => {
    const total = sections.reduce(
      (sum, section) => sum + section.time_limit,
      0
    );
    setTotalDuration(total);
    mockTestForm.setValue("time_limit", total);
  }, [sections, mockTestForm]);

  // Initialize sections based on test type
  useEffect(() => {
    if (selectedTestType && sections.length === 0) {
      let initialSections: IMockTestSection[] = [];

      switch (selectedTestType) {
        case "full_test":
          initialSections = [
            {
              section_name: "Listening",
              section_type: "listening",
              time_limit: 40,
              ordering: 1,
              instructions:
                "Listen carefully to the audio recordings and answer the questions.",
            },
            {
              section_name: "Reading",
              section_type: "reading",
              time_limit: 60,
              ordering: 2,
              instructions: "Read the passages and answer the questions.",
            },
            {
              section_name: "Writing",
              section_type: "writing",
              time_limit: 40,
              ordering: 4,
              instructions: "Write at least 250 words on the given topic.",
            },
            {
              section_name: "Speaking",
              section_type: "speaking",
              time_limit: 15,
              ordering: 5,
              instructions:
                "Answer questions about yourself and familiar topics.",
            },
          ];
          break;
        case "listening":
          initialSections = [
            {
              section_name: "Listening Test",
              section_type: "listening",
              time_limit: 40,
              ordering: 1,
              instructions:
                "Listen to the recordings and answer all questions.",
            },
          ];
          break;
        case "reading":
          initialSections = [
            {
              section_name: "Reading Test",
              section_type: "reading",
              time_limit: 60,
              ordering: 1,
              instructions:
                "Read the passages carefully and answer all questions.",
            },
          ];
          break;
        case "writing":
          initialSections = [
            {
              section_name: "Writing",
              section_type: "writing",
              time_limit: 20,
              ordering: 1,
              instructions: "Write at least 150 words.",
            },
            {
              section_name: "Writing Task 2",
              section_type: "writing_task2",
              time_limit: 40,
              ordering: 2,
              instructions: "Write at least 250 words.",
            },
          ];
          break;
        case "speaking":
          initialSections = [
            {
              section_name: "Speaking",
              section_type: "speaking",
              time_limit: 5,
              ordering: 1,
              instructions: "Introduction and interview.",
            },
          ];
          break;
      }

      setSections(initialSections);
    }
  }, [selectedTestType]);

  // Load existing data
  useEffect(() => {
    if (mockTestData) {
      mockTestForm.reset({
        title: mockTestData.title,
        test_type: mockTestData.test_type,
        test_level: mockTestData.test_level,
        instructions: mockTestData.instructions,
        time_limit: mockTestData.time_limit,
        is_active: mockTestData.is_active,
        difficulty_level: mockTestData.difficulty_level,
        description: mockTestData.description,
        sections: mockTestData.sections || [],
      });

      if (mockTestData.sections) {
        setSections(mockTestData.sections);
      }
    }
  }, [mockTestData, mockTestForm]);

  const onSubmit = async (data: z.infer<typeof MockTestFormSchema>) => {
    if (sections.length === 0) {
      toast.error("Please add at least one section to the test");
      return;
    }

    console.log("Mock Test Form Submitted:", {
      ...data,
      sections,
      time_limit: totalDuration,
    });
    createMockTestMutation.mutate(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
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
            onSubmit={mockTestForm.handleSubmit(onSubmit)}
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
                        options={testTypeOptions.map(option => ({
                          label: option.label,
                          value: option.value
                        }))}
                      />

                      <SelectField
                        control={mockTestForm.control}
                        name="test_level"
                        label="Test Level"
                        placeholder="Select test level"
                        options={testLevelOptions}
                      />
                    </div>

                    <SelectField
                      control={mockTestForm.control}
                      name="difficulty_level"
                      label="Difficulty Level"
                      placeholder="Select difficulty level"
                      options={difficultyLevelOptions.map(option => ({
                        label: option.label,
                        value: option.value // Keep as string, will be converted in form
                      }))}
                    />

                    <TextField
                      control={mockTestForm.control}
                      name="instructions"
                      label="General Instructions"
                      placeholder="Enter general instructions for the test..."
                    />
                  </CardContent>
                </Card>

                {/* Test Sections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-5 w-5 text-green-600" />
                        <span>Test Sections</span>
                        <span className="text-sm text-gray-500">
                          ({sections.length} sections)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSection}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Section</span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {sections.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>
                          No sections added yet. Click "Add Section" to get
                          started.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sections.map((section, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 space-y-4 bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <span className="font-medium">
                                  Section {index + 1}
                                </span>
                              </div>
                              {sections.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSection(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Section Name
                                </label>
                                <TextField
                                  control={{
                                    ...mockTestForm.control,
                                    _formValues: {
                                      [`section_${index}_name`]: section.section_name
                                    }
                                  } as any}
                                  name={`section_${index}_name`}
                                  label=""
                                  placeholder="Enter section name..."
                                  onValueChange={(value) => updateSection(index, "section_name", value)}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Section Type
                                </label>
                                <SelectField
                                  control={{
                                    ...mockTestForm.control,
                                    _formValues: {
                                      [`section_${index}_type`]: section.section_type
                                    }
                                  } as any}
                                  name={`section_${index}_type`}
                                  label=""
                                  placeholder="Select section type"
                                  options={sectionTypeOptions}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Time Limit (minutes)
                                </label>
                                <TextField
                                  control={{
                                    ...mockTestForm.control,
                                    _formValues: {
                                      [`section_${index}_time`]: section.time_limit
                                    }
                                  } as any}
                                  name={`section_${index}_time`}
                                  label=""
                                  type="number"
                                  min={1}
                                  max={180}
                                  placeholder="Enter time limit..."
                                  onValueChange={(value) => updateSection(index, "time_limit", parseInt(value) || 0)}
                                />
                              </div>

                              <div className="flex items-end">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {Math.floor(section.time_limit / 60)}h{" "}
                                    {section.time_limit % 60}m
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Section Instructions
                              </label>
                              <TextField
                                control={{
                                  ...mockTestForm.control,
                                  _formValues: {
                                    [`section_${index}_instructions`]: section.instructions
                                  }
                                } as any}
                                name={`section_${index}_instructions`}
                                label=""
                                placeholder="Enter specific instructions for this section..."
                                onValueChange={(value) => updateSection(index, "instructions", value)}
                              />
                            </div>
                          </div>
                        ))}
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
                                i < parseInt(mockTestForm.watch("difficulty_level") || "0")
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
                          {mockTestForm.watch("is_active") ? (
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
                        checked={mockTestForm.watch("is_active")}
                        onCheckedChange={(checked) =>
                          mockTestForm.setValue("is_active", checked)
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
                        disabled={
                          createMockTestMutation.isPending ||
                          sections.length === 0
                        }
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {createMockTestMutation.isPending
                            ? "Creating..."
                            : "Create Mock Test"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
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