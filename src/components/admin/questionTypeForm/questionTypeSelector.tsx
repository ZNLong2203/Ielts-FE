import React from "react";
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form";
import { QuestionGroupFormData } from "@/validation/questionGroup";
import FillBlankSettings from "./fillBlank"
import TrueFalseSettings from "./trueFalse";
import MultipleChoiceSettings from "./multipleChoice";
import MatchingSettings from "./matching";

interface QuestionTypeSelectorProps {
  selectedQuestionType: string;
  control: Control<QuestionGroupFormData>;
  matchingFields: FieldArrayWithId<QuestionGroupFormData, "matching_options", "id">[];
  addMatchingOption: UseFieldArrayAppend<QuestionGroupFormData, "matching_options">;
  removeMatchingOption: UseFieldArrayRemove;
}

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  selectedQuestionType,
  control,
  matchingFields,
  addMatchingOption,
  removeMatchingOption,
}) => {
  switch (selectedQuestionType) {
    case "fill_blank":
      return <FillBlankSettings control={control} />;
    
    case "true_false":
      return <TrueFalseSettings control={control} />;
    
    case "multiple_choice":
      return <MultipleChoiceSettings control={control} />;
    
    case "matching":
      return (
        <MatchingSettings
          control={control}
          matchingFields={matchingFields}
          addMatchingOption={addMatchingOption}
          removeMatchingOption={removeMatchingOption}
        />
      );
    
    default:
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Please select a question type to configure settings.</p>
        </div>
      );
  }
};

export default QuestionTypeSelector;