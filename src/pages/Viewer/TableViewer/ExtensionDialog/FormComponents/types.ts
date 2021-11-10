import { UseFormReturn } from 'react-hook-form';

export type BaseFormControlProps = UseFormReturn<Record<string, any>> & {
  description: string;
  infoText?: string;
};

export type Option = {
  id: string;
  value: string;
  label: string;
}
