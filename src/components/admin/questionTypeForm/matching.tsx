import React from "react";
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { Link2, List, Plus, Trash2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TextField from "@/components/form/text-field";
import { QuestionGroupFormData } from "@/validation/questionGroup";
import { IMatchingOption } from "@/interface/questionGroup";
import toast from "react-hot-toast";

interface MatchingSettingsProps {
  control: Control<QuestionGroupFormData>;
  matchingFields: FieldArrayWithId<QuestionGroupFormData, "matching_options", "id">[];
  addMatchingOption: UseFieldArrayAppend<QuestionGroupFormData, "matching_options">;
  removeMatchingOption: UseFieldArrayRemove;
}

const MatchingSettings: React.FC<MatchingSettingsProps> = ({
  control,
  matchingFields,
  addMatchingOption,
  removeMatchingOption,
}) => {
  const handleAddOption = () => {
    const newOption: IMatchingOption = {
      option_text: "",
      ordering: matchingFields.length + 1,
    };
    addMatchingOption(newOption);
  };

  const handleRemoveOption = (index: number) => {
    if (matchingFields.length <= 1) {
      toast.error("At least one matching option is required");
      return;
    }
    removeMatchingOption(index);
  };

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
          <h4 className="font-medium text-orange-900 mb-2">
            Instructions for Matching:
          </h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Students match items from one list to another</li>
            <li>• Provide a list of options to match against</li>
            <li>• Each item should have a clear match</li>
            <li>• Options can be used once or multiple times</li>
          </ul>
        </div>

        <TextField
          control={control}
          name="group_instruction"
          label="Instructions"
          placeholder="Match each item in the left column with the correct option from the right column..."
          required
        />

        {/* Matching Options Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <List className="h-5 w-5 text-orange-600" />
              <span>Matching Options</span>
              <span className="text-sm font-normal text-gray-500">
                ({matchingFields.length} options)
              </span>
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Option</span>
            </Button>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              These options will be available for students to choose from when matching. 
              Students will match questions/items with these options.
            </AlertDescription>
          </Alert>

          {matchingFields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <List className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No matching options yet
              </h3>
              <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                Add options that students can choose from when matching items. 
                You need at least 2 options to create a matching question.
              </p>
              <Button
                type="button"
                onClick={handleAddOption}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Option
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {matchingFields.map((field, index) => (
                <div
                  key={field.id}
                  className="group relative"
                >
                  <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg bg-white hover:border-orange-300 transition-colors">
                    {/* Option Number */}
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + index)} {/* A, B, C, D... */}
                    </div>

                    {/* Text Field */}
                    <div className="flex-1">
                      <TextField
                        control={control}
                        name={`matching_options.${index}.option_text`}
                        label=""
                        placeholder={`Option ${String.fromCharCode(65 + index)} - Enter matching option...`}
                        required
                      />
                    </div>

                    {/* Remove Button */}
                    {matchingFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistics */}
          {matchingFields.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span>Total Options: {matchingFields.length}</span>
              <span>
                Status: {matchingFields.length >= 2 ? "✅ Ready" : "⚠️ Need more options"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingSettings;