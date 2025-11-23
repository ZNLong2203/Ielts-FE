import React from "react";
import { Control } from "react-hook-form";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextField from "@/components/form/text-field";
import { QuestionGroupFormData } from "@/validation/questionGroup";
interface FillBlankSettingsProps {
  control: Control<QuestionGroupFormData>;
}

const FillBlankSettings: React.FC<FillBlankSettingsProps> = ({ control }) => {
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
          <h4 className="font-medium text-blue-900 mb-2">
            Instructions for Fill in the Blanks:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Students will see text with blank spaces to fill in</li>
            <li>
              • Use underscores (__) or brackets [blank] to mark blank
              spaces
            </li>
            <li>• Specify the number of correct answers expected</li>
            <li>• Provide clear instructions about what to fill in</li>
          </ul>
        </div>

        <TextField
          control={control}
          name="group_instruction"
          label="Instructions"
          placeholder="Complete the sentences by filling in the blanks with the correct words..."
          required
        />

      </CardContent>
    </Card>
  );
};

export default FillBlankSettings;