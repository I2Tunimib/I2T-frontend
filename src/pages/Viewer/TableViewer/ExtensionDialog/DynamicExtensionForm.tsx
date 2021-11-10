import { Button, Stack } from '@mui/material';
import { Extender, ExtenderFormInputParams } from '@store/slices/config/interfaces/config';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import CheckboxGroup from './FormComponents/CheckboxGroup';
import InputText from './FormComponents/InputText';
import { Select, SelectColumns } from './FormComponents/Select';

export type DynamicExtensionFormProps = {
  loading: boolean | undefined;
  extender: Extender;
  onSubmit: (formState: Record<string, any>) => void;
}
const FORM_COMPONENTS = {
  text: InputText,
  select: Select,
  selectColumns: SelectColumns,
  checkbox: CheckboxGroup
};

const errors = {
  required: {
    value: true,
    message: 'This field is required'
  }
};

const getDefaultValues = (extender: Extender) => {
  const { formParams } = extender;
  return formParams.reduce((acc, {
    id, defaultValue,
    options, inputType
  }) => {
    if (inputType === 'text') {
      acc[id] = defaultValue || '';
    }
    if (inputType === 'select') {
      if (options) {
        acc[id] = defaultValue || options[0].value;
      }
    }
    if (inputType === 'checkbox') {
      acc[id] = defaultValue || [];
    }
    if (inputType === 'selectColumns') {
      acc[id] = defaultValue || '';
    }
    return acc;
  }, {} as Record<string, any>);
};

const prepareFormInput = (inputProps: Omit<ExtenderFormInputParams, 'id' | 'inputType'>) => {
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

const DynamicExtensionForm: FC<DynamicExtensionFormProps> = ({
  loading,
  extender,
  onSubmit: onSubmitCallback
}) => {
  const {
    control, handleSubmit,
    reset, setValue,
    formState
  } = useForm({
    defaultValues: getDefaultValues(extender)
  });

  useEffect(() => {
    // rest form to selected extender values
    reset(getDefaultValues(extender));
  }, [extender]);

  const { formParams } = extender;

  const onSubmit = (formValue: any) => {
    onSubmitCallback(formValue);
  };

  return (
    <Stack component="form" gap="20px" onSubmit={handleSubmit(onSubmit)}>
      {formParams.map(({
        id, inputType, ...inputProps
      }) => {
        const FormComponent = FORM_COMPONENTS[inputType];
        return (
          <Controller
            key={id}
            defaultValue=""
            rules={{
              required: {
                value: true,
                message: 'This field is required'
              }
            }}
            render={({ field }) => (
              <FormComponent
                id={id}
                formState={formState}
                reset={reset}
                setValue={setValue}
                {...field}
                {...prepareFormInput(inputProps) as any} />
            )}
            name={id}
            control={control}
          />
        );
      })}
      <Stack direction="row" justifyContent="flex-end">
        <Button>Cancel</Button>
        <LoadingButton type="submit" loading={loading}>Confirm</LoadingButton>
      </Stack>
    </Stack>
  );
};

export default DynamicExtensionForm;
