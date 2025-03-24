import {
  Extender,
  FormInputParams,
} from "@store/slices/config/interfaces/config";
import CheckboxGroup from "./formComponents/CheckboxGroup";
import InputText from "./formComponents/InputText";
import { Select, SelectColumns } from "./formComponents/Select";
import TextArea from "./formComponents/TextArea";
import { MultipleColumnSelect } from "./formComponents/MultipleColumnSelect";

/**
 * Map of available form components
 */
export const FORM_COMPONENTS = {
  text: InputText,
  select: Select,
  selectColumns: SelectColumns,
  multipleColumnSelect: MultipleColumnSelect,
  checkbox: CheckboxGroup,
  textArea: TextArea,
};

/**
 * Map of errors, can be extended
 */
const ruleObjects = {
  required: {
    value: true,
    message: "This field is required",
  },
};

export const getRules = (rules: string[]) => {
  if (!rules) {
    return {};
  }
  return rules.reduce((acc, rule) => {
    const ruleObj = ruleObjects[rule as keyof typeof ruleObjects];
    if (ruleObj) {
      acc[rule] = ruleObj;
    }
    return acc;
  }, {} as any);
};

/**
 * Function which provides initial value to each form component
 */
export const getDefaultValues = (extender: Extender) => {
  const { formParams } = extender;
  if (!formParams) {
    return undefined;
  }
  return formParams.reduce((acc, { id, defaultValue, options, inputType }) => {
    if (inputType === "text" || inputType === "textArea") {
      acc[id] = defaultValue || "";
    } else if (inputType === "select") {
      if (options) {
        acc[id] = defaultValue || "";
      }
    } else if (inputType === "checkbox") {
      acc[id] = defaultValue || [];
    } else if (inputType === "selectColumns") {
      acc[id] = defaultValue || ""; //TODO: cange back to ""
    } else if (inputType === "multipleColumnSelect") {
      acc[id] = defaultValue || [];
    }
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Add to input probs, rules props (e.g: required)
 */
export const prepareFormInput = (
  inputProps: Omit<FormInputParams, "id" | "inputType">
) => {
  const { rules: inputRules } = inputProps;
  const rules = getRules(inputRules);
  return {
    ...inputProps,
    rules,
  };
};
