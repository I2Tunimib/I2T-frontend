import { Tag } from '@components/core';
import { TableListView } from '@components/kit';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { ID } from '@store/interfaces/store';
import { selectCurrentDatasetTables } from '@store/slices/datasets/datasets.selectors';
import { setCurrentDataset } from '@store/slices/datasets/datasets.slice';
import { getAllDatasetTables } from '@store/slices/datasets/datasets.thunk';
import { TableInstance } from '@store/slices/datasets/interfaces/datasets';
import {
  FC, useEffect,
  useMemo, useState
} from 'react';
import { useParams } from 'react-router-dom';
import { Cell, Row } from 'react-table';

interface TablesProps {
  onSelectionChange: (state: { kind: 'dataset' | 'table', rows: any[] } | null) => void;
}

interface TableState {
  columns: any[];
  data: any[];
}

const defaultTableState = {
  columns: [],
  data: []
};

const makeData = (tables: TableInstance[]) => {
  const data = tables.map((tableInstance) => {
    return {
      id: tableInstance.id,
      name: tableInstance.name,
      nCols: tableInstance.nCols,
      nRows: tableInstance.nRows,
      status: Math.random() < 0.5 ? tableInstance.status : 'DONE'
    };
  });

  const columns = Object.keys(data[0]).reduce((acc, key) => {
    if (key !== 'id') {
      return [
        ...acc, {
          Header: key,
          accessor: key,
          ...(key === 'status' && {
            Cell: ({ row, value }: Cell<any>) => (
              <>
                <div>
                  {value === 'TODO' ? (
                    <Tag status="todo">TODO</Tag>
                  ) : [
                    value === 'DOING' ? (
                      <Tag status="doing">DOING</Tag>
                    ) : (
                      <Tag status="done">DONE</Tag>
                    )
                  ]}
                </div>
              </>
            )
          })
        }
      ];
    }
    return acc;
  }, [] as any[]);

  return { columns, data };
};

const Tables: FC<TablesProps> = ({
  onSelectionChange
}) => {
  const [tableState, setTableState] = useState<TableState>(defaultTableState);
  const { datasetId } = useParams<{ datasetId: ID }>();
  const dispatch = useAppDispatch();
  const tables = useAppSelector(selectCurrentDatasetTables);

  useEffect(() => {
    if (tables.length > 0) {
      setTableState(makeData(tables));
    }
  }, [tables]);

  useEffect(() => {
    // dispatch(setCurrentDataset(datasetId));
    dispatch(getAllDatasetTables({ datasetId }));
  }, [datasetId]);

  const handleRowSelection = (rows: any[]) => {
    if (rows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: 'table', rows });
    }
  };

  const rowPropGetter = ({ original }: Row<any>) => ({
    onDoubleClick: () => {

    }
  });

  const tableColumns = useMemo(() => tableState.columns, [tableState.columns]);
  const tableRows = useMemo(() => tableState.data, [tableState.data]);

  return (
    <TableListView
      columns={tableColumns}
      data={tableRows}
      rowPropGetter={rowPropGetter}
      onChangeRowSelected={handleRowSelection}
    />
  );
};

export default Tables;
