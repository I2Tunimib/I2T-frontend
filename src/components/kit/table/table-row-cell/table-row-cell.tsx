/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/control-has-associated-label */
import StatusBadge from '@components/core/status-badge/status-badge';
import clsx from 'clsx';
import styles from './table-row-cell.module.scss';

interface ITableRowCellProps extends Record<string, any> { }

/**
 * Table row cell
 */
const TableRowCell = ({
  children,
  column: { selected, id: columnId },
  row: { id: rowId },
  selectedColumnsIds,
  selectedCell,
  value,
  handleRowCellClick
}: ITableRowCellProps) => {
  const getBadgeStatus = (match: boolean) => (match ? 'success' : 'warn');

  return (
    <td
      className={clsx(
        styles['row-cell'],
        {
          [styles['selected-column']]: selectedColumnsIds.includes(columnId)
        }
      )}
    >
      {columnId === 'index' ? children : (
        <>
          {value.metadata.length > 0
            && (
              <StatusBadge
                className={styles.badge}
                status={getBadgeStatus(value.metadata.match)}
              />
            )
          }
          {value.label}
        </>
      )}
      {columnId !== 'index'
        && (
          <div
            className={clsx(
              styles['selectable-overlay'],
              {
                [styles.selected]: selectedCell === value.id
              }
            )}
            onClick={() => handleRowCellClick(value.id)}
          />
        )}
    </td>
  );
};

export default TableRowCell;
