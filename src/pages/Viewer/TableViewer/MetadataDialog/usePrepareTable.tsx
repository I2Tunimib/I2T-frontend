import { useAppSelector } from '@hooks/store';
import { Reconciliator } from '@store/slices/config/interfaces/config';
import { Cell, Context } from '@store/slices/table/interfaces/table';
import { useEffect, useMemo, useState } from 'react';
import { Column } from 'react-table';

export type State<T = {}> = {
  columns: Column<Record<string, unknown>>[];
  data: T[]
}

// export type DataSelectorReturn = {
//   columnContext: Record<string, Context>;
//   cell: Cell;
//   service: Reconciliator;
// }

// export type DataSelector = (state: any) => DataSelectorReturn | undefined;

export type UsePrepareTableProps<T, Y> = {
  selector: (state: any) => Y;
  makeData: (state: Y) => State<T>;
}

const defaultTableState = {
  columns: [],
  data: []
};

function usePrepareTable<T extends {} = any, Y = {}>(
  { selector, makeData }: UsePrepareTableProps<T, Y>
) {
  const [tableState, setTableState] = useState<State<T>>(defaultTableState);
  const data = useAppSelector(selector);

  useEffect(() => {
    if (data) {
      setTableState(makeData(data));
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
