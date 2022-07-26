import { Button, Stack } from '@mui/material';
import { Extender, Reconciliator } from '@store/slices/config/interfaces/config';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { useAppDispatch } from '@hooks/store';
import { updateUI } from '@store/slices/table/table.slice';
import { FORM_COMPONENTS, getDefaultValues, getRules, prepareFormInput } from './componentsConfig';

export type DynamicFormProps = {
  loading: boolean | undefined;
  service: Extender | Reconciliator;
  onSubmit: (formState: Record<string, any>) => void;
}

const DynamicForm: FC<DynamicFormProps> = ({
  loading,
  service,
  onSubmit: onSubmitCallback
}) => {
  const dispatch = useAppDispatch();

  const {
    control, handleSubmit,
    reset, setValue,
    formState
  } = useForm({
    defaultValues: getDefaultValues(service)
  });

  useEffect(() => {
    // rest form to selected extender values
    reset(getDefaultValues(service));
  }, [service]);

  const { formParams } = service;

  const onSubmit = (formValue: any) => {
    onSubmitCallback(formValue);
  };

  return (
    <Stack component="form" gap="20px" onSubmit={handleSubmit(onSubmit)}>
      {formParams && formParams.map(({
        id, inputType, ...inputProps
      }) => {
        const FormComponent = FORM_COMPONENTS[inputType];
        return (
          <Controller
            key={id}
            defaultValue=""
            rules={getRules(inputProps.rules)}
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
        <Button onClick={() => dispatch(updateUI({ openExtensionDialog: false }))}>Cancel</Button>
        <LoadingButton type="submit" loading={loading}>Confirm</LoadingButton>
      </Stack>
    </Stack>
  );
};

export default DynamicForm;
