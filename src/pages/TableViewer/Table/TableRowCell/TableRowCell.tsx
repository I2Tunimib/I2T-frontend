/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/control-has-associated-label */
import StatusBadge from '@components/core/StatusBadge';
import clsx from 'clsx';
import styles from './TableRowCell.module.scss';

interface ITableRowCellProps extends Record<string, any> { }

/**
 * Table row cell
 */
const TableRowCell = ({
  children,
  column: { id: columnId },
  row: { id: rowId },
  selected,
  matching,
  selectedColumnsIds,
  selectedMetadatasCells,
  value,
  handleCellRightClick,
  handleSelectedCellChange
}: ITableRowCellProps) => {
  const getBadgeStatus = (match: boolean) => {
    if (matching) {
      return 'Success';
    }
    return match ? 'Success' : 'Warn';
  };

  return (
    <td
      onContextMenu={(e) => handleCellRightClick(e, 'cell', `${value.rowId}$${columnId}`)}
      className={clsx(
        styles.TableRowCell,
        {
          [styles.SelectedColumn]: false
        }
      )}
    >
      {columnId === 'index' ? children : (
        <>
          {value.metadata.length > 0
            && (
              <StatusBadge
                className={styles.Badge}
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
              styles.SelectableOverlay,
              {
                [styles.Selected]: selected
              }
            )}
            onClick={(event) => handleSelectedCellChange(event, `${value.rowId}$${columnId}`)}
          />
        )}
    </td>
  );
};

export default TableRowCell;
