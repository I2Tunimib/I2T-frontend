/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { ID } from '@store/interfaces/store';
import clsx from 'clsx';
import {
  ChangeEvent, FC, KeyboardEvent,
  useState, MouseEvent, useRef,
  FocusEvent, useEffect
} from 'react';
import EditableCell from '../EditableCell';
import { TableCell, TableColumn, TableRow } from '../interfaces/table';
import NormalCell from '../NormalCell';
import styles from './TableRowCell.module.scss';

interface TableRowCellProps extends TableCell {
  column: TableColumn;
  row: TableRow;
  selected: boolean;
  matching: boolean;
  dense: boolean;
  handleSelectedRowChange: (event: MouseEvent<any>, id: string) => void;
  handleSelectedCellChange: (event: MouseEvent<any>, id: string) => void;
  handleCellRightClick: (event: MouseEvent<any>, type: string, id: string) => void;
  updateTableData: (cellId: ID, value: string) => any;
}

/**
 * Table row cell.
 */
const TableRowCell: FC<TableRowCellProps> = ({
  children,
  column: { id: columnId },
  row: { id: rowId, ...restRow },
  selected,
  value,
  dense,
  handleSelectedRowChange,
  handleCellRightClick,
  handleSelectedCellChange,
  updateTableData
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cellValue, setCellValue] = useState<string>(columnId === 'index' ? '' : value.label);

  // If value is changed externally, sync it up with local state
  useEffect(() => {
    if (value) {
      if (value.label !== cellValue) {
        setCellValue(value.label);
      }
      if (value.editable) {
        inputRef?.current?.focus();
        inputRef?.current?.select();
      }
    }
  }, [value]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCellValue(event.target.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const cellId = `${value.rowId}$${columnId}`;
      updateTableData(cellId, (event.target as HTMLInputElement).value);
    }
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    const cellId = `${value.rowId}$${columnId}`;
    updateTableData(cellId, event.target.value);
  };

  const handleSelectCell = (event: MouseEvent<HTMLElement>) => {
    if (columnId === 'index') {
      handleSelectedRowChange(event, rowId);
    } else {
      handleSelectedCellChange(event, `${rowId}$${columnId}`);
    }
  };

  const handleOnContextMenu = (event: MouseEvent<HTMLElement>) => {
    if (columnId === 'index') {
      handleCellRightClick(event, 'row', rowId);
    } else {
      handleCellRightClick(event, 'cell', `${rowId}$${columnId}`);
    }
  };

  return (
    <td
      role="gridcell"
      onClick={(event) => handleSelectCell(event)}
      onContextMenu={(event) => handleOnContextMenu(event)}
      className={clsx(
        styles.TableRowCell,
        {
          [styles.Selected]: selected
        }
      )}
    >
      {columnId === 'index' ? children : (
        <>
          {value.editable ? (
            <EditableCell
              value={cellValue}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              ref={inputRef}
              dense={dense}
            />
          ) : (
            <NormalCell
              label={cellValue}
              value={value}
              dense={dense}
            />
          )}
        </>
      )}
    </td>
  );
};

export default TableRowCell;
