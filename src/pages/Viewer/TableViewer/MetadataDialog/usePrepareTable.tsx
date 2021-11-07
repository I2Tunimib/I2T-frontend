import { useAppSelector } from '@hooks/store';
import { useEffect, useMemo, useState } from 'react';
import { Column } from 'react-table';

export type State<T = {}> = {
  columns: Column<Record<string, unknown>>[];
  data: T[]
}

export type DataSelector<T> = (state: any) => State<T>

export type UsePrepareTableProps<T> = {
  selector: DataSelector<T>;
  makeData?: (state: State<T>) => State<T>;
}

const defaultTableState = {
  columns: [],
  data: []
};

function usePrepareTable<T extends {} = {}>({ selector, makeData }: UsePrepareTableProps<T>) {
  const [tableState, setTableState] = useState<State<T>>(defaultTableState);
  const data = useAppSelector(selector);

  useEffect(() => {
    if (data) {
      if (makeData) {
        setTableState(makeData(data));
      } else {
        setTableState(data);
      }
    }
  }, [data]);

  const columnsTable = useMemo(() => tableState.columns, [tableState.columns]);
  const dataTable = useMemo(() => tableState.data, [tableState.data]);

  return {
    state: tableState,
    setState: setTableState,
    memoizedState: {
      columns: columnsTable,
      data: dataTable
    }
  };
}

export default usePrepareTable;
