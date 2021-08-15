import { Button } from '@components/core';
import { FormControl, MenuItem, Select } from '@material-ui/core';
import { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './select-table.module.scss';

interface ISelectTableProps {
  value: string;
  options: string[] | undefined;
  onChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

const SelectTable = ({ value, options, onChange }: ISelectTableProps) => (
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
    <Button to={`table/${value}`} className={styles['upload-button']}>
      Upload
    </Button>
  </>
);

export default SelectTable;
