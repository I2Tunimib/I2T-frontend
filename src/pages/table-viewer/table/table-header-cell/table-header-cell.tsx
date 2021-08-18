/* eslint-disable react/destructuring-assignment */
import { Checkbox, Chip } from '@material-ui/core';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import clsx from 'clsx';
import styles from './table-header-cell.module.scss';

/**
 * Table head cell
 */
const TableHeaderCell = ({
  id,
  index,
  selected,
  reconciliator,
  children,
  handleCellRightClick,
  handleSelectChange
}: any) => (
  <th
    onContextMenu={(e) => handleCellRightClick(e, 'column', id)}
    className={clsx([
      styles.TableHeaderCell,
      {
        [styles.TableHeaderIndex]: index === 0
      }
    ])}
  >
    <div className={styles.TableHeaderContent}>
      {index !== 0
        && (
          <Checkbox
            checked={selected}
            onChange={() => handleSelectChange(id)}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        )}

      {children}
      {index !== 0 && reconciliator
        && (
          <Chip
            icon={<LinkRoundedIcon />}
            label={reconciliator}
            variant="outlined"
            size="small"
            color="primary"
          />
        )}
    </div>
  </th>
);

export default TableHeaderCell;
