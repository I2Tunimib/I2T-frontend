import { Stack } from '@mui/material';
import { FormInputSchema } from '@store/slices/config/interfaces/config';
import { Controller, useFormContext } from 'react-hook-form';
import { FORM_COMPONENTS, getRules } from '../componentsConfig';
import FieldError from './FieldError';
import FormFieldDescription from './FormFieldDescription';

type FormFieldProps = {
  name: string;
  schema: FormInputSchema
};

const FormField = ({
  name,
  schema
}: FormFieldProps) => {
  const { control } = useFormContext();
  const { component, rules = [], description, infoText } = schema;
  const FormComponent = FORM_COMPONENTS[component] as any;

  return (
    <Stack gap="10px">
      <FormFieldDescription description={description} infoText={infoText} />
      <Controller
        key={name}
        rules={getRules(rules)}
        render={({ field }) => (
          <FormComponent
            id={name}
            {...field}
            {...schema}
          />
        )}
        name={name}
        control={control}
      />
      <FieldError inputPath={name} />
    </Stack>
  );
};

export default FormField;
