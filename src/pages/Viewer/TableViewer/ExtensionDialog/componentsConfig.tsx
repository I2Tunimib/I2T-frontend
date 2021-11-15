import { Extender, ExtenderFormInputParams } from '@store/slices/config/interfaces/config';
import CheckboxGroup from './FormComponents/CheckboxGroup';
import InputText from './FormComponents/InputText';
import { Select, SelectColumns } from './FormComponents/Select';

/**
 * Map of available form components
 */
export const FORM_COMPONENTS = {
  text: InputText,
  select: Select,
  selectColumns: SelectColumns,
  checkbox: CheckboxGroup
};

/**
 * Map of errors, can be extended
 */
export const errors = {
  required: {
    value: true,
    message: 'This field is required'
  }
};

/**
 * Function which provides initial value to each form component
 */
export const getDefaultValues = (extender: Extender) => {
  const { formParams } = extender;
  return formParams.reduce((acc, {
    id, defaultValue,
    options, inputType
  }) => {
    if (inputType === 'text') {
      acc[id] = defaultValue || '';
    } else if (inputType === 'select') {
      if (options) {
        acc[id] = defaultValue || options[0].value;
      }
    } else if (inputType === 'checkbox') {
      acc[id] = defaultValue || [];
    } else if (inputType === 'selectColumns') {
      acc[id] = defaultValue || '';
    }
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Add to input probs, rules props (e.g: required)
 */
export const prepareFormInput = (inputProps: Omit<ExtenderFormInputParams, 'id' | 'inputType'>) => {
  const { rules: inputRules } = inputProps;
  const rules = inputRules.reduce((acc, key) => {
    if (key in errors) {
      acc[key] = errors[key as keyof typeof errors];
    }
    return acc;
  }, {} as Record<string, any>);
  return {
    ...inputProps,
    rules
  };
};
