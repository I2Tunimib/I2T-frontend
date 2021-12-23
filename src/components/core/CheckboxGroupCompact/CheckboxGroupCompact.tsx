import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { FC, useEffect, useState, ReactNode } from 'react';

export type CheckboxGroupProps = {
  items: CheckboxItem[];
  onChange?: (checkedItems: string[]) => void;
}

export type CheckboxItem = {
  label: string | ReactNode;
  value: string;
  checked: boolean;
}

const CheckboxGroupCompact: FC<CheckboxGroupProps> = ({
  items,
  onChange
}) => {
  const [state, setState] = useState<CheckboxItem[]>(items);

  useEffect(() => {
    if (onChange) {
      onChange(state.reduce((acc, checkboxItem) => {
        if (checkboxItem.checked) {
          acc.push(checkboxItem.value);
        }
        return acc;
      }, [] as string[]));
    }
  }, [state]);

  const handleChange = (value: string) => {
    setState((old) => {
      return old.map((item) => {
        if (item.value === value) {
          return {
            ...item,
            checked: !item.checked
          };
        }
        return item;
      });
    });
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr'
    }}>
      {state.map((checkboxItem) => (
        <FormControlLabel
          key={checkboxItem.value}
          control={(
            <Checkbox
              onChange={() => handleChange(checkboxItem.value)}
              checked={checkboxItem.checked} />
          )}
          label={<Typography variant="body2">{checkboxItem.label}</Typography>} />
      ))}
    </Box>
  );
};

export default CheckboxGroupCompact;
