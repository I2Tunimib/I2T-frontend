import { Button, IconButton, Typography } from '@material-ui/core';
import { FC, useEffect, useState } from 'react';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { getTables } from '@store/slices/tables/tables.thunk';
import { selectIsUploadDialogOpen, selectTables } from '@store/slices/tables/tables.selectors';
import TimeAgo from 'react-timeago';
import { orderTables, updateUI } from '@store/slices/tables/tables.slice';
import { DroppableArea } from '@components/kit';
import { Link, useParams } from 'react-router-dom';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { loadUpTable } from '@store/slices/table/table.thunk';
import { TableType } from '@store/slices/table/interfaces/table';
import UploadDialog from '../UploadDialog';
import styles from './Content.module.scss';

interface Contentprops {
  onFileChange: (files: File[]) => void;
}

const PERMITTED_FILE_EXTENSIONS = ['csv', 'json'];

interface OrderState {
  order: 'asc' | 'desc',
  property: 'name' | 'lastModifiedDate'
}

const Content: FC<Contentprops> = ({
  onFileChange
}) => {
  const [currentOrder, setCurrentOrder] = useState<OrderState | undefined>(undefined);
  const { tables: tablesType } = useParams<{ tables: TableType }>();
  const dispatch = useAppDispatch();
  const tables = useAppSelector(selectTables);

  useEffect(() => {
    dispatch(getTables(tablesType));
  }, [tablesType]);

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

  const setCurrentTable = (table: TableInstance) => {
    const { name, type, ...meta } = table;
    dispatch(loadUpTable({
      table: {
        name: table.name,
        type: table.type,
        meta
      }
    }));
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
                to={
                  table.type === 'raw'
                    ? `/table/${table.name}?draft=true`
                    : `/table/${table.name}`
                }
                onClick={() => setCurrentTable(table)}
                className={styles.TableListItem}
                key={table.name}
              >
                <Typography component="div" variant="body1">
                  {table.name}
                </Typography>
                <Typography component="div" variant="body2" color="textSecondary">
                  <TimeAgo title="" date={table.lastModifiedDate} />
                </Typography>
                <IconButton className={styles.IconButton} size="small">
                  <MoreVertRoundedIcon />
                </IconButton>
              </Link>
            ))}
          </div>
        </DroppableArea>
      </div>
    </>
  );
};

export default Content;
