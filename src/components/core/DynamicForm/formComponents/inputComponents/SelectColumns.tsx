import { useAppSelector } from '@hooks/store';
import { selectColumnsAsSelectOptions } from '@store/slices/table/table.selectors';
import { forwardRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import Select, { SelectColumnProps } from './Select';

/**
 * Select component where the options are the columns of the table
 */
const SelectColumns = forwardRef<HTMLInputElement, SelectColumnProps>((props, ref) => {
  const { setValue } = useFormContext();
  const { id } = props;

  const options = useAppSelector(selectColumnsAsSelectOptions);

  useEffect(() => {
    if (options && options.length > 0) {
      setValue(id, options[0].value);
    }
  }, [setValue, options]);

  return <Select options={options} {...props} ref={ref} />;
});

export default SelectColumns;
