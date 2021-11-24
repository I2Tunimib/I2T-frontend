import {
  Checkbox, FormControlLabel,
  Stack, Typography
} from '@mui/material';
import {
  FC, useRef
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
        label={<Typography fontSize="14px">All</Typography>}
        control={(
          <Checkbox
            indeterminate={Boolean(indeterminate)}
            {...rest} />
        )}
      />
      {allColumns.map((column: any) => (
        <FormControlLabel
          key={column.id}
          label={<Typography fontSize="14px">{column.Header}</Typography>}
          control={(
            <Checkbox {...column.getToggleHiddenProps()} />
          )}
        />
      ))}
    </Stack>
  );
};

export default ColumnHide;
