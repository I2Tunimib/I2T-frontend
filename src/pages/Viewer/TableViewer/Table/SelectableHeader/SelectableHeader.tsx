import { Checkbox } from '@material-ui/core';
import { ID } from '@store/interfaces/store';
import { FC, forwardRef } from 'react';
import styles from './SelectableHeader.module.scss';

interface SelectableHeaderProps {
  selected: boolean;
  handleSelectedColumnChange: (id: ID) => void;
}

// eslint-disable-next-line no-undef
const SelectableHeader: FC<any> = forwardRef<HTMLTableHeaderCellElement>(({
  index,
  subColumnId,
  selected,
  handleSelectedColumnChange
}: any, ref) => {
  return (
    <th ref={ref} className={styles.Container}>
      {index !== 0 && (
        <Checkbox
          size="small"
          checked={selected}
          onChange={() => handleSelectedColumnChange(subColumnId)}
          inputProps={{ 'aria-label': 'primary checkbox' }}
        />
      )}
    </th>
  );
});

export default SelectableHeader;
