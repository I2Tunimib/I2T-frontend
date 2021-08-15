/* eslint-disable react/destructuring-assignment */
import { Checkbox, Chip } from '@material-ui/core';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import styles from './table-header-cell.module.scss';

/**
 * Table head cell
 */
const TableHeaderCell = (props: any) => (
  <th className={styles['header-cell']}>
    <div className={styles['header-content']}>
      {props.index !== 0
        && (
          <Checkbox
            checked={props.selected}
            onChange={() => props.handleSelectChange(props.id)}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        )}

      {props.children}
      {props.index !== 0 && props.reconciliator
        && (
          <Chip
            icon={<LinkRoundedIcon />}
            label={props.reconciliator}
            variant="outlined"
            size="small"
            color="primary"
          />
        )}
    </div>
  </th>
);

export default TableHeaderCell;
