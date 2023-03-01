import { ControllerRenderProps, FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Base type of form component. New components should extend this type
 */
// export type BaseFormControlProps = UseFormReturn<Record<string, any>> & {
//   description: string;
//   infoText?: string;
// };

export type BaseFormControlProps = ControllerRenderProps<FieldValues, string> & {
  id: string;
}

export type Option = {
  id: string;
  value: string;
  label: string;
}
