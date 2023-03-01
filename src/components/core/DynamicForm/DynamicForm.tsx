/* eslint-disable react/no-danger */
import { Button, Stack } from '@mui/material';
import { Extender, FormSchema, Reconciliator } from '@store/slices/config/interfaces/config';
import { FC, ReactNode, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import { useAppDispatch } from '@hooks/store';
import { updateUI } from '@store/slices/table/table.slice';
import { getDefaultValues, parseForm } from './componentsConfig';
import FieldArray from './formComponents/FieldArray';
import FieldGroup from './formComponents/FieldGroup';
import FormField from './formComponents/FormField';

export type DynamicFormProps = {
  loading: boolean | undefined;
  service: Extender | Reconciliator;
  onCancel: () => void;
  onSubmit: (formState: Record<string, any>) => void;
}

const DynamicForm: FC<DynamicFormProps> = ({
  loading,
  service,
  onCancel,
  onSubmit
}) => {
  const { formSchema } = service;
  const methods = useForm({
    defaultValues: getDefaultValues(formSchema)
  });
  const { handleSubmit, reset } = methods;

  useEffect(() => {
    // rest form to selected extender values
    reset(getDefaultValues(formSchema));
  }, [formSchema]);

  const renderForm = (formSchemaInp: FormSchema, fieldName: string = ''): ReactNode => {
    if (!formSchemaInp) {
      return null;
    }

    return Object.keys(formSchemaInp).map((id) => {
      const formFieldSchema = formSchemaInp[id];
      const name = fieldName ? `${fieldName}.${id}` : id;

      if (formFieldSchema.component === 'group') {
        return (
          <FieldGroup key={name} {...formFieldSchema}>
            {(fieldsGroupSchema) => (formFieldSchema.dynamic
              ? (
                <FieldArray
                  key={name}
                  name={name}
                  render={(item, index) => {
                    return renderForm(fieldsGroupSchema, `${name}.${index}`);
                  }}
                  append={(add) => add(parseForm(fieldsGroupSchema))}
                />
              ) : renderForm(fieldsGroupSchema, name))}
          </FieldGroup>
        );
      }
      return (
        <FormField
          key={name}
          name={name}
          schema={formFieldSchema}
        />
      );
    });
  };

  return (
    <FormProvider {...methods}>
      <Stack component="form" gap="20px" onSubmit={handleSubmit(onSubmit)}>
        {renderForm(formSchema)}
        <Stack direction="row" justifyContent="flex-end">
          <Button onClick={onCancel}>Cancel</Button>
          <LoadingButton type="submit" loading={!!loading}>Confirm</LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default DynamicForm;
