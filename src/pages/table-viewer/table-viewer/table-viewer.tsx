import { useParams } from 'react-router-dom';
import {
  useMemo, useCallback,
  MouseEvent, useEffect
} from 'react';
import {
  selectAllCellsMetadata,
  selectContextualMenuState,
  selectSelectedCell,
  selectSelectedColumnsIds,
  selectTableData,
  updateSelectedCell,
  updateSelectedColumns,
  updateUI
} from '@store/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Menu, MenuItem } from '@material-ui/core';
import { getTable } from '@store/table/table.thunk';
import { Table } from '../table';
import Toolbar from '../toolbar/toolbar';
import styles from './table-viewer.module.scss';

// contextual close state
const contextualMenuCloseState = {
  mouseX: null,
  mouseY: null,
  target: null
};

const TableViewer = () => {
  const dispatch = useAppDispatch();
  // get table name from query params
  const { name } = useParams<{ name: string }>();

  const { columns, data } = useAppSelector(selectTableData);
  const selectedCell = useAppSelector(selectSelectedCell);
  const selectedColumnsIds = useAppSelector(selectSelectedColumnsIds);
  const contextualMenuState = useAppSelector(selectContextualMenuState);
  const selectedMetadatasCells = useAppSelector(selectAllCellsMetadata);

  useEffect(() => {
    dispatch(getTable({ dataSource: 'tables', name }));
  }, [name]);

  const handleRowCellClick = (cellId: string) => {
    dispatch(updateSelectedCell(cellId));
  };

  const handleCellRightClick = (
    event: MouseEvent<HTMLDivElement>,
    cellType: 'cell' | 'column', cellId: string
  ) => {
    event.preventDefault();
    dispatch(updateUI({
      contextualMenu: {
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        target: {
          id: cellId,
          type: cellType
        }
      }
    }));
  };

  const handleMenuClose = () => {
    dispatch(updateUI({
      contextualMenu: contextualMenuCloseState
    }));
  };

  const handleSelectChange = useCallback((id: string) => {
    dispatch(updateSelectedColumns(id));
  }, []);

  const updateTableData = (rowIndex: number, columnId: string, value: string) => {
    // dispatch(updateData({ rowIndex, columnId, value }));
  };

  const dataTable = useMemo(() => data, [data]);
  const columnsTable = useMemo(() => columns, [columns]);

  return (
    <>
      <Toolbar />
      <div className={styles.TableContainer}>
        <Table
          data={dataTable}
          columns={columnsTable}
          getHeaderProps={({ selected, id, reconciliator }) => ({
            selected,
            id,
            reconciliator,
            handleCellRightClick,
            handleSelectChange
          })}
          getCellProps={({ column, row, value }) => ({
            column,
            row,
            value,
            selectedCell,
            selectedColumnsIds,
            selectedMetadatasCells,
            handleRowCellClick,
            handleCellRightClick
          })}
          updateTableData={updateTableData}
        />
        <Menu
          open={contextualMenuState.mouseY !== null}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextualMenuState.mouseY !== null && contextualMenuState.mouseX !== null
              ? { top: contextualMenuState.mouseY, left: contextualMenuState.mouseX }
              : undefined
          }
        >
          <MenuItem>Copy</MenuItem>
          <MenuItem>Print</MenuItem>
          <MenuItem>Highlight</MenuItem>
          <MenuItem>Email</MenuItem>
        </Menu>
      </div>
    </>
  );
};

export default TableViewer;
