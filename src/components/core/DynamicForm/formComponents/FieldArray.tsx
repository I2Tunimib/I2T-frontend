import { Box, Button, Stack } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { ReactNode, Fragment } from 'react';
import { Controller, ControllerProps, useFieldArray, UseFieldArrayReturn, useFormContext } from 'react-hook-form';

type FieldArrayProps = {
  name: string;
  render: (fields: Record<'id', string>, index: number) => ReactNode;
  append: (append: UseFieldArrayReturn['append']) => void;
}

const FieldArray = ({ name, render, append: appendProp }: FieldArrayProps) => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    name,
    control
  });

  return (
    <>
      {fields.map((field, index) => (
        <Stack key={field.id} direction="column" borderRadius="6px" border="1px solid rgba(0, 0, 0, 0.12)" padding="10px" position="relative" gap="10px">
          {render(field, index)}
          {fields.length > 1 && (
            <Box position="absolute" top="-15px" right="-15px">
              <Button variant="contained" color="error" size="small" endIcon={<ClearIcon />} onClick={() => remove(index)}>
                Remove
              </Button>
            </Box>
          )}
        </Stack>
      ))}
      <Stack direction="row" alignItems="center" marginTop="10px">
        <Button size="small" variant="contained" onClick={() => appendProp(append)}>Add</Button>
      </Stack>
    </>
  );
};

export default FieldArray;
