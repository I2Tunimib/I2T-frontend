import { useParams } from 'react-router-dom';
import {
  useMemo, useCallback,
  MouseEvent, useEffect,
  useState
} from 'react';
import {
  redo,
  selectCellMetadata,
  selectDataTableFormat, selectGetTableRequestStatus, selectSelectedCellsIds,
  selectSelectedColumns, undo, updateCellEditable, updateCellLabel, updateCellSelection,
  updateColumnSelection
} from '@store/slices/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { LinearProgress } from '@material-ui/core';
import { getTable } from '@store/slices/table/table.thunk';
import { ID } from '@store/slices/table/interfaces/table';
import { MenuActions } from '@components/core';
import { HotKeys } from 'react-hotkeys';
import { Table } from '../Table';
import Toolbar from '../Toolbar';
import styles from './TableViewer.module.scss';
import { TableCell, TableColumn } from '../Table/interfaces/table';
import { CONTEXT_MENU_ACTIONS } from './contextual-menu-actions';

interface MenuState {
  open: boolean;
  targetId: string | null;
  targetType: 'cell' | 'column' | null;
}

// contextual close state
const contextualMenuCloseState: MenuState = {
  open: false,
  targetId: null,
  targetType: null
};

const keyMap = {
  SAVE: 'ctrl+s',
  UNDO: 'ctrl+z',
  REDO: 'ctrl+shift+z'
};

const TableViewer = () => {
  const dispatch = useAppDispatch();
  const [menuState, setMenuState] = useState(contextualMenuCloseState);
  const [anchorEl, setAnchorEl] = useState<null | any>(null);
  const { name } = useParams<{ name: string }>();
  const { columns, rows } = useAppSelector(selectDataTableFormat);
  const { loading } = useAppSelector(selectGetTableRequestStatus);
  const selectedColumns = useAppSelector(selectSelectedColumns);
  const selectedCells = useAppSelector(selectSelectedCellsIds);
  const selectedCellMetadata = useAppSelector(selectCellMetadata);

  useEffect(() => {
    dispatch(getTable({ dataSource: 'tables', name }));
  }, [name]);

  /**
   * Handle selection of a cell.
   */
  const handleSelectedCellChange = (event: MouseEvent, id: ID) => {
    if (event.ctrlKey) {
      dispatch(updateCellSelection({ id, multi: true }));
    } else {
      dispatch(updateCellSelection({ id }));
    }
  };

  /**
   * Handle selection of a column.
   */
  const handleSelectedColumnChange = useCallback((id: ID) => {
    dispatch(updateColumnSelection(id));
  }, []);

  /**
   * Handle update of cell values.
   */
  const updateTableData = (cellId: ID, value: string) => {
    dispatch(updateCellLabel({ cellId, value }));
  };

  /**
   * Handle edit cell action.
   */
  const editCell = () => {
    if (menuState.targetId) {
      dispatch(updateCellEditable({ cellId: menuState.targetId }));
    }
  };

  /**
   * Generate getBoundingClientRect function.
   */
  const generateGetBoundingClientRect = (x: number, y: number) => {
    return () => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x
    });
  };

  /**
   * Handle cell / column right click.
   */
  const handleCellRightClick = (e: MouseEvent<HTMLElement>, type: 'cell' | 'column' | null, id: string) => {
    e.preventDefault();
    if (type === 'cell') {
      handleSelectedCellChange(e, id);
    }
    setMenuState({
      open: true,
      targetId: id,
      targetType: type
    });
    // create a virtual anchor element for the menu
    const { clientX, clientY } = e;
    const virtualElement = {
      clientWidth: clientX,
      clientHeight: clientY,
      getBoundingClientRect: generateGetBoundingClientRect(clientX, clientY)
    };
    setAnchorEl(virtualElement);
  };

  /**
   * Close contextual menu.
   */
  const handleMenuClose = () => {
    setMenuState(contextualMenuCloseState);
  };

  /**
   * Handle action context menu.
   */
  const handleContextMenuItemClick = (id: string) => {
    if (id === 'context-edit') {
      editCell();
    }
    setMenuState(contextualMenuCloseState);
  };

  /**
   * Properties to pass to each header.
   */
  const getHeaderProps = ({ id, reconciliator, ...props }: TableColumn) => {
    return {
      id,
      reconciliator,
      selected: !!selectedColumns[id],
      handleCellRightClick,
      handleSelectedColumnChange
    };
  };

  /**
   * Properties to pass to each cell.
   */
  const getCellProps = ({
    column, row, value, ...props
  }: TableCell) => {
    let selected = false;
    let matching = false;
    if (column.id !== 'index') {
      selected = `${value.rowId}$${column.id}` in selectedCells;
      matching = `${value.rowId}$${column.id}` in selectedCellMetadata;
    }
    return {
      column,
      row,
      value,
      selected,
      matching,
      handleSelectedCellChange,
      handleCellRightClick,
      updateTableData
    };
  };

  /**
   * Keyboard shortcut handlers
   */
  const saveWork = useCallback((event: KeyboardEvent | undefined) => {
    if (event) {
      event.preventDefault();
    }
    // Saving
  }, []);
  const undoOperation = useCallback(() => {
    dispatch(undo());
  }, []);
  const redoOperation = useCallback(() => {
    dispatch(redo());
  }, []);

  const keyHandlers = {
    SAVE: saveWork,
    UNDO: undoOperation,
    REDO: redoOperation
  };

  const columnsTable = useMemo(() => columns, [columns]);
  const rowsTable = useMemo(() => rows, [rows]);

  return (
    <HotKeys className={styles.HotKeysContainer} keyMap={keyMap} handlers={keyHandlers}>
      <Toolbar />
      <div className={styles.TableContainer}>
        {!loading ? (
          <Table
            data={rowsTable}
            columns={columnsTable}
            getHeaderProps={getHeaderProps}
            getCellProps={getCellProps}
          />
        ) : <LinearProgress />
        }
        <MenuActions
          open={menuState.open}
          handleMenuItemClick={handleContextMenuItemClick}
          handleClose={handleMenuClose}
          anchorElement={anchorEl}
          actionGroups={menuState.targetType === 'cell' ? CONTEXT_MENU_ACTIONS.cell : CONTEXT_MENU_ACTIONS.column}
        />
      </div>
    </HotKeys>
  );
};

export default TableViewer;
