import { FormInputSchema, FormSchema } from '@store/slices/config/interfaces/config';
import CheckboxGroup from './formComponents/inputComponents/CheckboxGroup';
import InputText from './formComponents/inputComponents/InputText';
import SelectColumns from './formComponents/inputComponents/SelectColumns';
import Select from './formComponents/inputComponents/Select';

/**
 * Map of available form components
 */
export const FORM_COMPONENTS = {
  text: InputText,
  select: Select,
  selectColumns: SelectColumns,
  checkbox: CheckboxGroup
} as const;

export type FormComponentKind = keyof typeof FORM_COMPONENTS;

/**
 * Map of errors, can be extended
 */
const ruleObjects = {
  required: {
    value: true,
    message: 'This field is required'
  }
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

export const parseFormField = (formFieldSchema: FormInputSchema) => {
  switch (formFieldSchema.component) {
    case 'text': {
      return formFieldSchema.defaultValue || '';
    }
    case 'select': {
      return formFieldSchema.defaultValue || formFieldSchema.options[0].value;
    }

    case 'selectColumns': {
      return formFieldSchema.defaultValue || '';
    }

    case 'checkbox': {
      return formFieldSchema.defaultValue || [];
    }

    default: {
      // eslint-disable-next-line no-console
      console.warn('unhendled form component');
      return undefined;
    }
  }
};

export const parseForm = (formSchema: FormSchema) => {
  return Object.keys(formSchema).reduce((acc, id) => {
    const formFieldSchema = formSchema[id];

    if (formFieldSchema.component === 'group') {
      acc[id] = formFieldSchema.dynamic
        ? [parseForm(formFieldSchema.fields)]
        : parseForm(formFieldSchema.fields);
      return acc;
    }

    acc[id] = parseFormField(formFieldSchema);
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Function which provides initial value to each form component
 */
export const getDefaultValues = (form: FormSchema) => {
  if (!form) {
    return undefined;
  }
  return parseForm(form);
};
