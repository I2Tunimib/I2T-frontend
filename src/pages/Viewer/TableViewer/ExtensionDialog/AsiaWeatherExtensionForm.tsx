import styled from '@emotion/styled';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

const OPTIONS = [
  {
    label: 'First-order administrative division (Regions or States)',
    value: 'parentADM1'
  },
  {
    label: 'Second-order administrative division (Provinces)',
    value: 'parentADM2'
  },
  {
    label: 'Third-order administrative division (Communes)',
    value: 'parentADM3'
  },
  {
    label: 'Fourth-order administrative division',
    value: 'parentADM4'
  }
];

const FormContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  '& > :first-child': {
    marginBottom: '10px'
  }
});

const CheckboxItem = (props: any) => (
  <Controller
    {...props}
    render={({ field }) => {
      return (
        <FormControlLabel
          control={(
            <Checkbox
              {...field}
              value={props.value}
              checked={field.value === props.value}
              onChange={(event) => {
                field.onChange(event.target.checked ? props.value : undefined);
              }}
            />
          )}
          label={props.label}
        />
      );
    }}
  />
);

type AsiaGeoExtensionFormProps = {
  onChange: (status: any) => void;
  // onConfirm: () => void;
}

const AsiaWeatherExtensionForm: FC<AsiaGeoExtensionFormProps> = ({
  onChange
}) => {
  const { control } = useForm<{ items: string[] }>({
    defaultValues: {
      items: []
    }
  });
  // const watchAllFields = watch();
  const watchAllFields = useWatch({ control });

  useEffect(() => {
    // if (watchAllFields && watchAllFields.items) {
    //   const selectedItems = watchAllFields.items.filter((item) => item) as string[];
    //   onChange({
    //     data: selectedItems,
    //     valid: selectedItems.length > 0
    //   });
    // }
  }, [watchAllFields]);

  return (
    <FormContainer>
      <Typography>
        Select a column with values: dates
      </Typography>
      {OPTIONS.map((option, index) => (
        <CheckboxItem key={option.value} control={control} name={`items[${index}]`} value={option.value} label={option.label} />
      ))}
    </FormContainer>
  );
};

export default AsiaWeatherExtensionForm;
