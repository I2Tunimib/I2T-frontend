import { useParams } from 'react-router-dom';
import { useMemo, useCallback, useEffect } from 'react';
import { Table } from '@components/kit';
import {
  selectSelectedCell,
  selectSelectedColumnsIds,
  selectTableData,
  setData,
  updateSelectedCell,
  updateSelectedColumns
} from '@store/table/table.slice';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { useFetch } from '@hooks/fetch';
import { ITableDataResponse, tableDataEndpoint } from '@services/api/endpoints/table';
import Toolbar from '../toolbar/toolbar';
import styles from './table-viewer.module.scss';

const TableViewer = () => {
  const dispatch = useAppDispatch();
  // get table name from query params
  const { name } = useParams<{ name: string }>();
  // get table and store in slice
  useFetch<ITableDataResponse>(
    tableDataEndpoint('tables', name),
    { dispatchFn: setData }
  );

  const { columns, data } = useAppSelector(selectTableData);
  const selectedCell = useAppSelector(selectSelectedCell);
  const selectedColumnsIds = useAppSelector(selectSelectedColumnsIds);

  const handleRowCellClick = (cellId: string) => {
    // set selected cell
    dispatch(updateSelectedCell(cellId));
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
      <div className={styles['table-container']}>
        <Table
          data={dataTable}
          columns={columnsTable}
          getHeaderProps={({ selected, id, reconciliator }) => ({
            selected,
            id,
            reconciliator,
            handleSelectChange
          })}
          getCellProps={({ column, row, value }: any) => ({
            column,
            row,
            value,
            selectedCell,
            selectedColumnsIds,
            handleRowCellClick
          })}
          updateTableData={updateTableData}
        />
      </div>
    </>
    // <div>{isLoading ? 'LOADING' : data}</div>
  );
};

export default TableViewer;
