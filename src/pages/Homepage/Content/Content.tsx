import { Button, IconButton, Typography } from '@material-ui/core';
import { FC, useEffect, useState } from 'react';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { getTables } from '@store/slices/tables/tables.thunk';
import { selectTables } from '@store/slices/tables/tables.selectors';
import TimeAgo from 'react-timeago';
import { orderTables, updateUI } from '@store/slices/tables/tables.slice';
import { DroppableArea } from '@components/kit';
import { Link, useParams } from 'react-router-dom';
import { FileRead } from '@components/kit/DroppableArea';
import { updateCurrentTable } from '@store/slices/table/table.slice';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import UploadDialog from '../UploadDialog';
import styles from './Content.module.scss';

interface Contentprops { }

const PERMITTED_FILE_EXTENSIONS = ['csv', 'json'];

interface OrderState {
  order: 'asc' | 'desc',
  property: 'name' | 'lastModifiedDate'
}

interface UploadedFileState {
  file: File;
  fileName: string;
  fileExtension: string;
  content: string;
}

const Content: FC<Contentprops> = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | undefined>(undefined);
  const [currentOrder, setCurrentOrder] = useState<OrderState | undefined>(undefined);
  const { tables: tablesType } = useParams<{ tables: string }>();
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

  const processFile = (result: FileRead) => {
    if (result) {
      const splittedName = result.file.name.split('.');
      const { fileName, fileExtension } = splittedName.reduce((acc, split, index) => ({
        fileName: index !== splittedName.length - 1 ? acc.fileName + split : acc.fileName,
        fileExtension: index === splittedName.length - 1 ? split : ''
      }), { fileName: '', fileExtension: '' });

      setUploadedFile({
        file: result.file,
        fileName,
        fileExtension,
        content: result.content
      });
      return;
    }
    setUploadedFile(undefined);
  };

  const handleOnDrop = (result: FileRead) => {
    processFile(result);
    dispatch(updateUI({
      uploadDialogOpen: true
    }));
  };

  const setCurrentTable = (table: TableInstance) => {
    dispatch(updateCurrentTable(table));
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
      <UploadDialog file={uploadedFile} />
    </>
  );
};

export default Content;
