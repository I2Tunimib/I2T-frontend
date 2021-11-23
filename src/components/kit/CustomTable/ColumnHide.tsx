import { Checkbox, FormControlLabel, Stack } from '@mui/material';
import {
  FC, forwardRef,
  useEffect, useRef
} from 'react';

const ColumnHide: FC<any> = ({ indeterminate: { indeterminate, ...rest }, allColumns }) => {
  const defaultRef = useRef(null);
  // const resolvedRef = ref || defaultRef;

  // useEffect(() => {
  //   resolvedRef.current.indeterminate = indeterminate;
  // }, [resolvedRef, indeterminate]);
  return (
    <Stack direction="row" flexWrap="wrap">
      <FormControlLabel
        label="All"
        control={(
          <Checkbox
            indeterminate={Boolean(indeterminate)}
            {...rest} />
        )}
      />
      {allColumns.map((column: any) => (
        <FormControlLabel
          key={column.id}
          label={column.Header}
          control={(
            <Checkbox {...column.getToggleHiddenProps()} />
          )}
        />
      ))}
    </Stack>
  );
};

export default ColumnHide;
