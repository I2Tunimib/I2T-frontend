import { Checkbox, FormControlLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Stack } from '@mui/material';
import { ChangeEvent, FC, MouseEvent, useEffect, useState, ReactNode } from 'react';

export type CheckboxGroupProps = {
  items: CheckboxItem[];
  onChange?: (checkedItems: string[]) => void;
}

export type CheckboxItem = {
  label: string | ReactNode;
  value: string;
  checked: boolean;
}

const CheckboxGroup: FC<CheckboxGroupProps> = ({
  items,
  onChange
}) => {
  const [state, setState] = useState<CheckboxItem[]>(items);
  const [indeterminate, setIndeterminate] = useState<
    { indeterminate: boolean, checked: boolean }
  >({ indeterminate: false, checked: false });

  useEffect(() => {
    if (state.every((checkboxItem) => checkboxItem.checked)) {
      setIndeterminate({ indeterminate: false, checked: true });
    } else if (state.some((checkboxItem) => checkboxItem.checked)) {
      setIndeterminate({ indeterminate: true, checked: true });
    } else {
      setIndeterminate({ indeterminate: false, checked: false });
    }
    if (onChange) {
      onChange(state.reduce((acc, checkboxItem) => {
        if (checkboxItem.checked) {
          acc.push(checkboxItem.value);
        }
        return acc;
      }, [] as string[]));
    }
  }, [state]);

  const handleIndeterminateChange = () => {
    if (indeterminate.indeterminate) {
      setState((old) => old.map((checkboxItem) => ({ ...checkboxItem, checked: true })));
    } else if (indeterminate.checked) {
      setState((old) => old.map((checkboxItem) => ({ ...checkboxItem, checked: false })));
    } else {
      setState((old) => old.map((checkboxItem) => ({ ...checkboxItem, checked: true })));
    }
  };

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
    <List disablePadding>
      <ListItem
        disablePadding>
        <ListItemButton
          sx={{
            paddingLeft: '0px'
          }}
          role={undefined}
          onClick={handleIndeterminateChange}>
          <ListItemIcon
            sx={{
              minWidth: '0px'
            }}>
            <Checkbox
              {...indeterminate}
            />
          </ListItemIcon>
          <ListItemText primary="All" />
        </ListItemButton>
      </ListItem>
      {state.map((checkboxItem, index) => {
        return (
          <ListItem
            key={`${checkboxItem.value}-${index}`}
            disablePadding>
            <ListItemButton
              sx={{
                paddingLeft: '0px'
              }}
              role={undefined}
              onClick={() => handleChange(checkboxItem.value)}>
              <ListItemIcon
                sx={{
                  minWidth: '0px'
                }}>
                <Checkbox
                  checked={checkboxItem.checked}
                />
              </ListItemIcon>
              <ListItemText primary={checkboxItem.label} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default CheckboxGroup;
