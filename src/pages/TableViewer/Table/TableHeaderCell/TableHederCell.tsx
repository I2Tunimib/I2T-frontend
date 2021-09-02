/* eslint-disable react/destructuring-assignment */
import { Checkbox, Chip } from '@material-ui/core';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import clsx from 'clsx';
import styles from './TableHeaderCell.module.scss';

/**
 * Table head cell.
 */
const TableHeaderCell = ({
  id,
  index,
  selected,
  status,
  reconciliators,
  children,
  handleCellRightClick,
  handleSelectedColumnChange
}: any) => {
  return (
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
              onChange={() => handleSelectedColumnChange(id)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          )}

        {children}
        {status
          && status === 'pending'
          ? (
            <Chip
              icon={<ErrorOutlineRoundedIcon />}
              label="Metadata are present"
              variant="outlined"
              size="small"
              color="primary"
            />
          )
          : [
            status === 'reconciliated'
              ? (
                index !== 0 && reconciliators.length > 0
                && (
                  reconciliators.length > 1
                    ? (
                      <Chip
                        icon={<LinkRoundedIcon />}
                        label="Mixed reconciliators"
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    )
                    : (
                      <Chip
                        icon={<LinkRoundedIcon />}
                        label={reconciliators[0]}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    )

                )
              )
              : null
          ]
        }
      </div>
    </th>
  );
};

export default TableHeaderCell;
