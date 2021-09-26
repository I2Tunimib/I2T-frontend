import { Checkbox } from '@material-ui/core';
import { ID } from '@store/interfaces/store';
import { FC } from 'react';
import styles from './SelectableHeader.module.scss';

interface SelectableHeaderProps {
  selected: boolean;
  handleSelectedColumnChange: (id: ID) => void;
}

const SelectableHeader: FC<any> = ({
  index,
  subColumnId,
  selected,
  handleSelectedColumnChange
}) => {
  return (
    <th className={styles.Container}>
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
};

export default SelectableHeader;
