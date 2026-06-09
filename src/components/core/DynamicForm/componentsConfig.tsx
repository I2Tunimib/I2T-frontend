import {
  Extender,
  FormInputParams,
} from "@store/slices/config/interfaces/config";
import CheckboxGroup from "./formComponents/CheckboxGroup";
import RadioGroupComponent from "./formComponents/RadioGroupComponent";
import InputText from "./formComponents/InputText";
import { Select, SelectColumnAll, SelectColumns, SelectPrefix } from "./formComponents/Select";
import TextArea from "./formComponents/TextArea";
import { MultipleColumnSelect } from "./formComponents/MultipleColumnSelect";

/**
 * Check if a field should be visible based on its dependencies
 *
 * Supports:
 * - Simple condition: { field: "type", value: "option1" }
 * - OR condition: { field: "type", value: ["option1", "option2"] }
 * - NOT condition: { field: "type", value: "option1", not: true }
 * - AND condition: { and: [{ field: "a", value: "1" }, { field: "b", value: "2" }] }
 * - OR condition: { or: [{ field: "a", value: "1" }, { field: "b", value: "2" }] }
 */
export const shouldShowField = (
  param: FormInputParams,
  watchValues: Record<string, any>,
): boolean => {
  if (!param.dependsOn) {
    return true;
  }

  const dep = param.dependsOn as any;

  // Handle AND logic: all conditions must be true
  if (dep.and && Array.isArray(dep.and)) {
    return dep.and.every((condition: any) =>
      evaluateCondition(condition, watchValues),
    );
  }

  // Handle OR logic: at least one condition must be true
  if (dep.or && Array.isArray(dep.or)) {
    return dep.or.some((condition: any) =>
      evaluateCondition(condition, watchValues),
    );
  }

  // Handle simple condition
  return evaluateCondition(dep, watchValues);
};

/**
 * Evaluate a single condition
 */
const evaluateCondition = (
  condition: any,
  watchValues: Record<string, any>,
): boolean => {
  const { field, value, not } = condition;
  const currentValue = watchValues[field];

  let matches = false;

  // Handle array of values (OR condition within single field)
  if (Array.isArray(value)) {
    matches = value.includes(currentValue);
  } else {
    // Handle single value
    matches = currentValue === value;
  }

  // Apply NOT logic if specified
  return not ? !matches : matches;
};

/**
 * Map of available form components
 */
export const FORM_COMPONENTS = {
  text: InputText,
  select: Select,
  selectColumnAll: SelectColumnAll,
  selectColumns: SelectColumns,
  selectPrefix: SelectPrefix,
  multipleColumnSelect: MultipleColumnSelect,
  checkbox: CheckboxGroup,
  textArea: TextArea,
  radio: RadioGroupComponent,
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
  return formParams.reduce(
    (acc, { id, defaultValue, options, inputType }) => {
      if (inputType === "text" || inputType === "textArea") {
        acc[id] = defaultValue || "";
      } else if (inputType === "select") {
        if (options) {
          acc[id] = defaultValue || "";
        }
      } else if (inputType === "checkbox") {
        acc[id] = defaultValue || [];
      } else if (inputType === "radio") {
        acc[id] = defaultValue || "";
      } else if (inputType === "selectColumnAll") {
        acc[id] = defaultValue || "";
      } else if (inputType === "selectColumns") {
        acc[id] = defaultValue || ""; //TODO: cange back to ""
      } else if (inputType === "multipleColumnSelect") {
        acc[id] = defaultValue || [];
      } else if (inputType === "selectPrefix") {
        acc[id] = defaultValue || "";
      }
      return acc;
    },
    {} as Record<string, any>,
  );
};

/**
 * Add to input probs, rules props (e.g: required)
 */
export const prepareFormInput = (
  inputProps: Omit<FormInputParams, "id" | "inputType">,
) => {
  const { rules: inputRules } = inputProps;
  const rules = getRules(inputRules);
  return {
    ...inputProps,
    rules,
  };
};
