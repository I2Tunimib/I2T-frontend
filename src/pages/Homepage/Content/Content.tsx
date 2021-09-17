import {
  Button, IconButton,
  Menu, MenuItem,
  Typography
} from '@material-ui/core';
import {
  FC, useEffect,
  useState, MouseEvent, useCallback
} from 'react';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  copyTable, getTable,
  getTables, removeTable
} from '@store/slices/tables/tables.thunk';
import { selectTables } from '@store/slices/tables/tables.selectors';
import TimeAgo from 'react-timeago';
import { orderTables, updateUI } from '@store/slices/tables/tables.slice';
import { DroppableArea } from '@components/kit';
import { Link, useParams } from 'react-router-dom';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { TableType } from '@store/slices/table/interfaces/table';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import GetAppRoundedIcon from '@material-ui/icons/GetAppRounded';
import MenuBase from '@components/core/MenuBase';
import { ConfirmationDialog, MenuItemIconLabel } from '@components/core';
import MenuList from '@material-ui/core/MenuList';
import { ActionButton } from '@components/core/ConfirmationDialog';
import fileDownload from 'js-file-download';
import styles from './Content.module.scss';

interface Contentprops {
  onFileChange: (files: File[]) => void;
}

const PERMITTED_FILE_EXTENSIONS = ['csv', 'json'];

interface OrderState {
  order: 'asc' | 'desc',
  property: 'name' | 'lastModifiedDate'
}
interface MenuState {
  anchorEl: any | null;
  table: TableInstance | null;
}
const initialMenuState = { anchorEl: null, table: null };

interface ConfirmationDialogState {
  open: boolean;
  content: string;
  actions: ActionButton[];
  title?: string;
}

const initialConfirmationDialogState = {
  open: false,
  content: '',
  actions: []
};

const Content: FC<Contentprops> = ({
  onFileChange
}) => {
  const [currentOrder, setCurrentOrder] = useState<OrderState | undefined>(undefined);
  const [menuState, setMenuState] = useState<MenuState>(initialMenuState);
  const [
    confirmationDialogState,
    setConfirmationDialogState
  ] = useState<ConfirmationDialogState>(initialConfirmationDialogState);
  const { tables: tablesType } = useParams<{ tables: 'raw' | 'annotated' }>();
  const dispatch = useAppDispatch();
  const tables = useAppSelector(selectTables);

  useEffect(() => {
    dispatch(updateUI({ selectedSource: tablesType }));
    dispatch(getTables(tablesType));
  }, [tablesType]);

  useEffect(() => {
    console.log(tables);
  }, [tables]);

  useEffect(() => {
    if (currentOrder) {
      dispatch(orderTables(currentOrder));
    }
  }, [currentOrder]);

  const handleOrder = (property: 'name' | 'lastModifiedDate') => {
    if (!currentOrder) {
      setCurrentOrder({ order: 'asc', property });
    } else if (currentOrder && currentOrder.property !== property) {
      setCurrentOrder({ order: 'asc', property });
    } else if (currentOrder.order === 'asc') {
      setCurrentOrder({ order: 'desc', property });
    } else {
      setCurrentOrder({ order: 'asc', property });
    }
  };

  const handleOnDrop = (files: File[]) => {
    onFileChange(files);
  };

  const handleClose = () => {
    setMenuState(initialMenuState);
  };

  const handleTableMore = (event: MouseEvent<HTMLButtonElement>, table: TableInstance) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuState({
      anchorEl: event.currentTarget,
      table
    });
  };

  const generateGetBoundingClientRect = useCallback((x: number, y: number) => {
    return () => ({
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x
    });
  }, []);

  const handleContextMenu = (event: MouseEvent<HTMLAnchorElement>, table: TableInstance) => {
    event.stopPropagation();
    event.preventDefault();
    const { clientX, clientY } = event;
    const virtualElement = {
      clientWidth: clientX,
      clientHeight: clientY,
      getBoundingClientRect: generateGetBoundingClientRect(clientX, clientY)
    };
    setMenuState({
      anchorEl: virtualElement,
      table
    });
  };

  const onCopyTable = () => {
    if (menuState.table) {
      dispatch(copyTable(menuState.table.name));
    }
    setMenuState(initialMenuState);
  };

  const handleCloseConfirmationDialog = () => {
    setConfirmationDialogState((state) => ({ ...state, open: false }));
  };
  const handleRemoveTable = () => {
    if (menuState.table) {
      dispatch(removeTable(menuState.table.id));
    }
    handleCloseConfirmationDialog();
  };

  const onRemoveTable = () => {
    if (menuState.table) {
      setConfirmationDialogState({
        open: true,
        title: 'Delete this table?',
        content: `By confirming you are going to delete permanently '${menuState.table.name}'.`,
        actions: [
          { label: 'Cancel', callback: handleCloseConfirmationDialog },
          { label: 'Confirm', callback: handleRemoveTable, buttonProps: { color: 'secondary' } }
        ]
      });
    }
    setMenuState(initialMenuState);
  };

  const onDownloadTable = () => {
    if (menuState.table) {
      dispatch(getTable(menuState.table.name))
        .unwrap()
        .then((data) => {
          const fileName = `${menuState.table?.name}.${menuState.table?.format}`;
          fileDownload(((data as unknown) as string), fileName);
        });
    }
    setMenuState(initialMenuState);
  };

  return (
    <>
      <div className={styles.Container}>
        <div className={styles.ListHeader}>
          <div className={styles.ItemContainer}>
            <Button
              className={styles.FilterButton}
              onClick={() => handleOrder('name')}
              endIcon={currentOrder ? [
                currentOrder.property === 'name'
                  ? [
                    currentOrder.order === 'asc'
                      ? <ArrowDownwardRoundedIcon />
                      : <ArrowUpwardRoundedIcon />
                  ]
                  : null
              ] : null}
              size="medium">
              Table name
            </Button>
          </div>

          <Button
            className={styles.FilterButton}
            onClick={() => handleOrder('lastModifiedDate')}
            endIcon={currentOrder ? [
              currentOrder.property === 'lastModifiedDate'
                ? [
                  currentOrder.order === 'asc'
                    ? <ArrowDownwardRoundedIcon />
                    : <ArrowUpwardRoundedIcon />
                ]
                : null
            ] : null}
            size="medium">
            Last modified
          </Button>
        </div>
        <DroppableArea
          uploadText="Drag a table to upload it on the server or view it immediatly."
          permittedFileExtensions={PERMITTED_FILE_EXTENSIONS}
          onDrop={handleOnDrop}
        >
          <div className={styles.List}>
            {tables.map((table) => (
              <Link
                to={`/table/${table.id}`}
                onContextMenu={(e) => handleContextMenu(e, table)}
                className={styles.TableListItem}
                key={table.id}>
                <Typography component="div" variant="body1">
                  {table.name}
                </Typography>
                <Typography component="div" variant="body2" color="textSecondary">
                  <TimeAgo title="" date={table.lastModifiedDate} />
                </Typography>
                <IconButton
                  onClick={(e) => handleTableMore(e, table)}
                  className={styles.IconButton}
                  size="small">
                  <MoreVertRoundedIcon />
                </IconButton>
              </Link>
            ))}
          </div>
        </DroppableArea>
      </div>
      <MenuBase
        anchorElement={menuState.anchorEl}
        open={!!menuState.anchorEl}
        handleClose={handleClose}>
        <MenuList>
          <MenuItemIconLabel
            onClick={onCopyTable}
            Icon={FileCopyOutlinedIcon}>
            Make a copy
          </MenuItemIconLabel>
          <MenuItemIconLabel
            onClick={onRemoveTable}
            Icon={DeleteOutlineRoundedIcon}>
            Delete table
          </MenuItemIconLabel>
          <MenuItemIconLabel
            onClick={onDownloadTable}
            Icon={GetAppRoundedIcon}>
            Download table
          </MenuItemIconLabel>
        </MenuList>
      </MenuBase>
      <ConfirmationDialog onClose={handleCloseConfirmationDialog} {...confirmationDialogState} />
    </>
  );
};

export default Content;
