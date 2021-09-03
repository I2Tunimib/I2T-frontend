import { Button } from '@components/core';
import { FormControl, MenuItem, Select } from '@material-ui/core';
import { ChangeEvent, FC } from 'react';
import styles from './SelectTable.module.scss';

interface SelectTableProps {
  value: string;
  options: string[] | undefined;
  onChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

const SelectTable: FC<SelectTableProps> = ({ value, options, onChange }) => (
  <>
    <FormControl className="field">
      <Select
        value={value}
        onChange={(e) => onChange(e)}
        variant="outlined"
      >
        {options && options.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>
    <Button to={`table/${value}`} className={styles.UploadButton}>
      Upload
    </Button>
  </>
);

export default SelectTable;
