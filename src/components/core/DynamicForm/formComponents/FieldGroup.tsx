/* eslint-disable react/no-danger */
import { Stack } from '@mui/material';
import { GroupFieldSchema, FormSchema } from '@store/slices/config/interfaces/config';
import { ReactNode } from 'react';

type FieldGroupProps = GroupFieldSchema & {
  children: (fields: FormSchema) => ReactNode;
};

const FieldGroup = ({ title, description, fields, children, ...props }: FieldGroupProps) => {
  return (
    <Stack direction="column" gap="10px" {...props}>
      {title && <div dangerouslySetInnerHTML={{ __html: title }} />}
      {description && <div dangerouslySetInnerHTML={{ __html: description }} />}
      <Stack direction="column" gap="10px">
        {children(fields)}
      </Stack>
    </Stack>
  );
};

export default FieldGroup;
