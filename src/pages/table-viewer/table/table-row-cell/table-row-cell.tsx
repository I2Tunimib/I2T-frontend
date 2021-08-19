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
  selectedMetadatasCells,
  value,
  handleCellRightClick,
  handleRowCellClick
}: ITableRowCellProps) => {
  const getBadgeStatus = (match: boolean) => {
    const idMetadata = selectedMetadatasCells[value.id];
    if (idMetadata) {
      return 'Success';
    }
    return value.metadata.match ? 'Success' : 'Warn';
  };

  return (
    <td
      onContextMenu={(e) => handleCellRightClick(e, 'cell', value.id)}
      className={clsx(
        styles.TableRowCell,
        {
          [styles.SelectedColumn]: selectedColumnsIds.includes(columnId)
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
                [styles.Selected]: selectedCell === value.id
              }
            )}
            onClick={() => handleRowCellClick(value.id)}
          />
        )}
    </td>
  );
};

export default TableRowCell;
