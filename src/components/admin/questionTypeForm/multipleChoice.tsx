import React from "react";
import { Control } from "react-hook-form";
import { Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextField from "@/components/form/text-field";
import { QuestionGroupFormData } from "@/validation/questionGroup";

interface MultipleChoiceSettingsProps {
  control: Control<QuestionGroupFormData>;
}

const MultipleChoiceSettings: React.FC<MultipleChoiceSettingsProps> = ({ control }) => {
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
          <h4 className="font-medium text-purple-900 mb-2">
            Instructions for Multiple Choice:
          </h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>
              • Students choose from multiple options (A, B, C, D, etc.)
            </li>
            <li>• Each question has one correct answer</li>
            <li>• Provide clear and distinct options</li>
            <li>• Questions should be unambiguous</li>
          </ul>
        </div>

        <TextField
          control={control}
          name="group_instruction"
          label="Instructions"
          placeholder="Choose the best answer for each question..."
          required
        />
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceSettings;