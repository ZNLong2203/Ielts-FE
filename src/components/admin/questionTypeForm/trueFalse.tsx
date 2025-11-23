import React from "react";
import { Control } from "react-hook-form";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextField from "@/components/form/text-field";
import { QuestionGroupFormData } from "@/validation/questionGroup";

interface TrueFalseSettingsProps {
  control: Control<QuestionGroupFormData>;
}

const TrueFalseSettings: React.FC<TrueFalseSettingsProps> = ({ control }) => {
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
          <h4 className="font-medium text-green-900 mb-2">
            Instructions for True/False:
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Students will mark each statement as True or False</li>
            <li>• Statements should be clear and unambiguous</li>
            <li>• Each statement has only one correct answer</li>
            <li>• Specify the total number of statements</li>
          </ul>
        </div>

        <TextField
          control={control}
          name="group_instruction"
          label="Instructions"
          placeholder="Read each statement carefully and mark it as True or False..."
          required
        />
      </CardContent>
    </Card>
  );
};

export default TrueFalseSettings;