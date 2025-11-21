"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle,
  ArrowRight,
  Eye,
  AlertTriangle,
  Hash,
  Image as ImageIcon,
  Upload,
  X,
  CheckSquare,
  Circle,
  List,
  Link2,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { IQuestionGroup, IQuestionGroupUpdate, IMatchingOption } from "@/interface/questionGroup";

// Question Group Form Schema
const MatchingOptionSchema = z.object({
  option_text: z.string().min(1, "Option text is required"),
  ordering: z.number().min(1),
});

const QuestionGroupSchema = z.object({
  exercise_id: z.string().min(1, "Exercise ID is required"),
  group_title: z.string().min(1, "Group title is required"),
  group_instructions: z.string().min(1, "Instructions are required"),
  passage_reference: z.string().optional(),
  question_type: z.enum(["fill_blank", "true_false", "multiple_choice", "matching"]),
  question_range: z.string().min(1, "Question range is required"),
  correct_answer_count: z.number().min(1, "Must have at least 1 correct answer"),
  ordering: z.number().min(1),
  image_url: z.string().optional(),
  matching_options: z.array(MatchingOptionSchema).optional(),
});

const QuestionGroupUpdateSchema = QuestionGroupSchema.partial();

// Question type options
const QUESTION_TYPE_OPTIONS = [
  { 
    label: "Fill in the Blanks", 
    value: "fill_blank",
    icon: <FileText className="h-4 w-4" />,
    description: "Students fill in missing words"
  },
  { 
    label: "True/False", 
    value: "true_false",
    icon: <CheckCircle className="h-4 w-4" />,
    description: "True or false statements"
  },
  { 
    label: "Multiple Choice", 
    value: "multiple_choice",
    icon: <Circle className="h-4 w-4" />,
    description: "Choose from multiple options"
  },
  { 
    label: "Matching", 
    value: "matching",
    icon: <Link2 className="h-4 w-4" />,
    description: "Match items with options"
  },
];

const QuestionGroupForm = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const mockTestId = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const questionGroupId = Array.isArray(params.questionGroupId) ? params.questionGroupId[0] : params.questionGroupId;
  const isEditing = !!questionGroupId;

  const title = isEditing ? "Update Question Group" : "Create Question Group";
  const description = isEditing
    ? "Update question group settings and configuration"
    : "Create a new question group with specific type and settings";

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("multiple_choice");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Form setup
  const schema = isEditing ? QuestionGroupUpdateSchema : QuestionGroupSchema;
  const questionGroupForm = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      exercise_id: exerciseId || "",
      group_title: "",
      group_instructions: "",
      passage_reference: "",
      question_type: "multiple_choice",
      question_range: "",
      correct_answer_count: 1,
      ordering: 1,
      image_url: undefined,
      matching_options: [],
    },
  });

  // Matching options field array
  const { fields: matchingFields, append: appendMatching, remove: removeMatching } = useFieldArray({
    control: questionGroupForm.control,
    name: "matching_options",
  });

  const watchedQuestionType = questionGroupForm.watch("question_type");

  useEffect(() => {
    setSelectedQuestionType(watchedQuestionType || "multiple_choice");
  }, [watchedQuestionType]);

  // Image handling
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image file is too large. Maximum size is 5MB.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid image format. Please use JPG, PNG, or WebP.");
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    toast.success("Image selected successfully!");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    questionGroupForm.setValue("image_url", undefined);
  };

  // Matching options management
  const addMatchingOption = () => {
    const newOption: IMatchingOption = {
      option_text: "",
      ordering: matchingFields.length + 1,
    };
    appendMatching(newOption);
  };

  const removeMatchingOption = (index: number) => {
    if (matchingFields.length <= 1) {
      toast.error("At least one matching option is required");
      return;
    }
    removeMatching(index);
    
    // Reorder remaining options
    const updatedOptions = matchingFields
      .filter((_, i) => i !== index)
      .map((option, i) => ({
        ...option,
        ordering: i + 1,
      }));
    
    questionGroupForm.setValue("matching_options", updatedOptions);
  };

  // Initialize matching options when question type changes to matching
  useEffect(() => {
    if (selectedQuestionType === "matching" && matchingFields.length === 0) {
      // Add default matching options
      const defaultOptions = [
        { option_text: "", ordering: 1 },
        { option_text: "", ordering: 2 },
      ];
      defaultOptions.forEach(option => appendMatching(option));
    }
  }, [selectedQuestionType, matchingFields.length, appendMatching]);

  const onSubmit = async (data: any) => {
    try {
      console.log("Form data:", data);
      // Here you would call your API
      toast.success(`Question group ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Navigate back to questions list
      router.push(`${ROUTES.ADMIN_MOCK_TESTS}/${mockTestId}/exercises/${exerciseId}/questions`);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} question group`);
    }
  };

  // Render question type specific form fields
  const renderQuestionTypeFields = () => {
    switch (selectedQuestionType) {
      case "fill_blank":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Fill in the Blanks Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Instructions for Fill in the Blanks:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Students will see text with blank spaces to fill in</li>
                  <li>• Use underscores (__) or brackets [blank] to mark blank spaces</li>
                  <li>• Specify the number of correct answers expected</li>
                  <li>• Provide clear instructions about what to fill in</li>
                </ul>
              </div>
              
              <TextField
                control={questionGroupForm.control}
                name="group_instructions"
                label="Instructions"
                placeholder="Complete the sentences by filling in the blanks with the correct words..."
                required
              />
            </CardContent>
          </Card>
        );

      case "true_false":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>True/False Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Instructions for True/False:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Students will mark each statement as True or False</li>
                  <li>• Statements should be clear and unambiguous</li>
                  <li>• Each statement has only one correct answer</li>
                  <li>• Specify the total number of statements</li>
                </ul>
              </div>
              
              <TextField
                control={questionGroupForm.control}
                name="group_instructions"
                label="Instructions"
                placeholder="Read each statement carefully and mark it as True or False..."
                required
              />
            </CardContent>
          </Card>
        );

      case "multiple_choice":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Circle className="h-5 w-5 text-purple-600" />
                <span>Multiple Choice Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Instructions for Multiple Choice:</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Students choose from multiple options (A, B, C, D, etc.)</li>
                  <li>• Each question has one correct answer</li>
                  <li>• Provide clear and distinct options</li>
                  <li>• Questions should be unambiguous</li>
                </ul>
              </div>
              
              <TextField
                control={questionGroupForm.control}
                name="group_instructions"
                label="Instructions"
                placeholder="Choose the best answer for each question..."
                required
              />
            </CardContent>
          </Card>
        );

      case "matching":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link2 className="h-5 w-5 text-orange-600" />
                <span>Matching Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-2">Instructions for Matching:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Students match items from one list to another</li>
                  <li>• Provide a list of options to match against</li>
                  <li>• Each item should have a clear match</li>
                  <li>• Options can be used once or multiple times</li>
                </ul>
              </div>
              
              <TextField
                control={questionGroupForm.control}
                name="group_instructions"
                label="Instructions"
                placeholder="Match each item in the left column with the correct option from the right column..."
                required
              />

              {/* Matching Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <List className="h-5 w-5 text-orange-600" />
                    <span>Matching Options</span>
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMatchingOption}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Option</span>
                  </Button>
                </div>

                {matchingFields.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <List className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No matching options yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Add options that students can choose from when matching
                    </p>
                    <Button
                      type="button"
                      onClick={addMatchingOption}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Option
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchingFields.map((field, index) => (
                      <div key={field.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <TextField
                            control={questionGroupForm.control}
                            name={`matching_options.${index}.option_text`}
                            label=""
                            placeholder={`Matching option ${index + 1}...`}
                            required
                          />
                        </div>

                        {matchingFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMatchingOption(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <strong>Tip:</strong> These options will be available for students to choose from when matching. 
                  Make sure each option is clear and distinct.
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <Heading title={title} description={description} />
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{isPreviewMode ? "Edit Mode" : "Preview"}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <span>Back</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPreviewMode ? (
          // Preview Mode
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{questionGroupForm.watch("group_title") || "Untitled Question Group"}</span>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {QUESTION_TYPE_OPTIONS.find(opt => opt.value === selectedQuestionType)?.label}
                    </div>
                    <span className="text-sm text-gray-500">
                      Questions: {questionGroupForm.watch("question_range")}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Question group image"
                        className="max-w-md mx-auto rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="prose prose-gray max-w-none">
                    <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {questionGroupForm.watch("group_instructions") || "No instructions provided."}
                    </p>
                  </div>

                  {questionGroupForm.watch("passage_reference") && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Passage Reference:</h4>
                      <p className="text-gray-700">
                        {questionGroupForm.watch("passage_reference")}
                      </p>
                    </div>
                  )}

                  {selectedQuestionType === "matching" && matchingFields.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-3">Matching Options:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {matchingFields.map((field, index) => (
                          <div key={field.id} className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-700">
                              {questionGroupForm.watch(`matching_options.${index}.option_text`) || `Option ${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                    <span>Correct Answers: {questionGroupForm.watch("correct_answer_count")}</span>
                    <span>Order: {questionGroupForm.watch("ordering")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Edit Mode
          <Form {...questionGroupForm}>
            <form onSubmit={questionGroupForm.handleSubmit(onSubmit)} className="space-y-8">
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
                        control={questionGroupForm.control}
                        name="group_title"
                        label="Group Title"
                        placeholder="Enter question group title..."
                        required
                      />

                      <SelectField
                        control={questionGroupForm.control}
                        name="question_type"
                        label="Question Type"
                        placeholder="Select question type"
                        options={QUESTION_TYPE_OPTIONS.map(opt => ({
                          label: opt.label,
                          value: opt.value,
                        }))}
                      />

                      {/* Question Type Description */}
                      {selectedQuestionType && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            {QUESTION_TYPE_OPTIONS.find(opt => opt.value === selectedQuestionType)?.icon}
                            <h4 className="font-medium text-blue-900">
                              {QUESTION_TYPE_OPTIONS.find(opt => opt.value === selectedQuestionType)?.label}
                            </h4>
                          </div>
                          <p className="text-sm text-blue-700">
                            {QUESTION_TYPE_OPTIONS.find(opt => opt.value === selectedQuestionType)?.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextField
                          control={questionGroupForm.control}
                          name="question_range"
                          label="Question Range"
                          placeholder="e.g., 1-5, 6-10"
                          required
                        />

                        <TextField
                          control={questionGroupForm.control}
                          name="correct_answer_count"
                          label="Correct Answer Count"
                          type="number"
                          placeholder="1"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextField
                          control={questionGroupForm.control}
                          name="ordering"
                          label="Order"
                          type="number"
                          placeholder="1"
                          required
                        />

                        <TextField
                          control={questionGroupForm.control}
                          name="passage_reference"
                          label="Passage Reference"
                          placeholder="e.g., Paragraph A, Lines 1-5"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Question Type Specific Fields */}
                  {renderQuestionTypeFields()}

                  {/* Image Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ImageIcon className="h-5 w-5 text-green-600" />
                        <span>Supporting Image (Optional)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-w-sm rounded-lg border shadow-sm"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={removeImage}
                              className="absolute top-2 right-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-gray-600">
                            {imageFile && `File: ${imageFile.name} (${(imageFile.size / 1024).toFixed(1)} KB)`}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <p className="text-lg font-medium text-gray-900">Upload Image</p>
                              <p className="text-gray-500">PNG, JPG, WebP up to 5MB</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="mt-4 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Hash className="h-5 w-5 text-purple-600" />
                        <span>Quick Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">
                          {QUESTION_TYPE_OPTIONS.find(opt => opt.value === selectedQuestionType)?.label || "Not selected"}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Question Range:</span>
                        <span className="font-medium">
                          {questionGroupForm.watch("question_range") || "Not set"}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Correct Answers:</span>
                        <span className="font-medium">
                          {questionGroupForm.watch("correct_answer_count") || 0}
                        </span>
                      </div>

                      {selectedQuestionType === "matching" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Matching Options:</span>
                          <span className="font-medium">
                            {matchingFields.length}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Order:</span>
                        <span className="font-medium">
                          {questionGroupForm.watch("ordering") || 1}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validation Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Validation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          {questionGroupForm.watch("group_title") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Group title</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {questionGroupForm.watch("question_type") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Question type</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {questionGroupForm.watch("group_instructions") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Instructions</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {questionGroupForm.watch("question_range") ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>Question range</span>
                        </div>

                        {selectedQuestionType === "matching" && (
                          <div className="flex items-center space-x-2">
                            {matchingFields.length >= 2 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>Matching options (2+ required)</span>
                          </div>
                        )}
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
                        >
                          <Save className="h-4 w-4" />
                          <span>
                            {isEditing ? "Update Question Group" : "Create Question Group"}
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
        )}
      </div>
    </div>
  );
};

export default QuestionGroupForm;