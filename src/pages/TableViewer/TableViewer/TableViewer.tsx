import { useParams } from 'react-router-dom';
import {
  useMemo, useCallback,
  MouseEvent, useEffect,
  useState
} from 'react';
import {
  selectCellMetadata,
  selectDataTableFormat, selectGetTableRequestStatus, selectSelectedCells,
  selectSelectedColumns, updateCellEditable, updateCellLabel, updateCellSelection,
  updateColumnSelection
} from '@store/slices/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { LinearProgress } from '@material-ui/core';
import { getTable } from '@store/slices/table/table.thunk';
import { ID } from '@store/slices/table/interfaces/table';
import { MenuActions } from '@components/core';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import SettingsEthernetRoundedIcon from '@material-ui/icons/SettingsEthernetRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import LibraryAddCheckRoundedIcon from '@material-ui/icons/LibraryAddCheckRounded';
import { Table } from '../Table';
import Toolbar from '../Toolbar';
import styles from './TableViewer.module.scss';
import { TableCell, TableColumn } from '../Table/interfaces/table';

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

const contextMenuActions = {
  cell: [
    [
      {
        id: 'context-edit',
        label: 'Edit cell',
        Icon: <EditRoundedIcon className={styles.ContextMenuIcon} />
      },
      {
        id: 'context-reconciliate',
        label: 'Reconciliate cell',
        Icon: <LinkRoundedIcon className={styles.ContextMenuIcon} />
      },
      {
        id: 'context-manage-metadata',
        label: 'Manage metadata',
        Icon: <SettingsEthernetRoundedIcon className={styles.ContextMenuIcon} />
      }
    ], [
      {
        id: 'context-delete-column',
        label: 'Delete column',
        Icon: <DeleteOutlineRoundedIcon className={styles.ContextMenuIcon} />
      },
      {
        id: 'context-delete-row',
        label: 'Delete row',
        Icon: <DeleteOutlineRoundedIcon className={styles.ContextMenuIcon} />
      }
    ]
  ],
  column: [
    [
      {
        id: 'context-select-column',
        label: 'Select column',
        Icon: <LibraryAddCheckRoundedIcon className={styles.ContextMenuIcon} />
      }
    ],
    [
      {
        id: 'context-delete-column',
        label: 'Delete column',
        Icon: <DeleteOutlineRoundedIcon className={styles.ContextMenuIcon} />
      }
    ]
  ]
};

const TableViewer = () => {
  const dispatch = useAppDispatch();
  const [menuState, setMenuState] = useState(contextualMenuCloseState);
  const [anchorEl, setAnchorEl] = useState<null | any>(null);
  const { name } = useParams<{ name: string }>();
  const { columns, rows } = useAppSelector(selectDataTableFormat);
  const { loading } = useAppSelector(selectGetTableRequestStatus);
  const selectedColumns = useAppSelector(selectSelectedColumns);
  const selectedCells = useAppSelector(selectSelectedCells);
  const selectedCellMetadata = useAppSelector(selectCellMetadata);

  useEffect(() => {
    dispatch(getTable({ dataSource: 'tables', name }));
  }, [name]);

  const handleSelectedCellChange = (event: MouseEvent, id: ID) => {
    if (event.ctrlKey) {
      dispatch(updateCellSelection({ id, multi: true }));
    } else {
      dispatch(updateCellSelection({ id }));
    }
  };

  const handleSelectedColumnChange = useCallback((id: ID) => {
    dispatch(updateColumnSelection(id));
  }, []);

  const updateTableData = (cellId: ID, value: string) => {
    dispatch(updateCellLabel({ cellId, value }));
  };

  const editCell = () => {
    if (menuState.targetId) {
      dispatch(updateCellEditable({ cellId: menuState.targetId }));
    }
  };

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
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: clientY,
        right: clientX,
        bottom: clientY,
        left: clientX
      })
    };
    setAnchorEl(virtualElement);
  };

  const handleMenuClose = () => {
    setMenuState(contextualMenuCloseState);
  };

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
      selected = !!selectedColumns[column.id] || selectedCells[`${value.rowId}$${column.id}`];
      matching = !!selectedCellMetadata[`${value.rowId}$${column.id}`];
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

  const columnsTable = useMemo(() => columns, [columns]);
  const rowsTable = useMemo(() => rows, [rows]);

  return (
    <>
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
          actionGroups={menuState.targetType === 'cell' ? contextMenuActions.cell : contextMenuActions.column}
        />
      </div>
    </>
  );
};

export default TableViewer;
