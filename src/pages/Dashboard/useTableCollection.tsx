import { useAppSelector } from '@hooks/store';
import { GetCollectionResult } from '@services/api/datasets';
import {
  useEffect,
  useMemo, useState
} from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import { CELL_COMPONENTS_TYPES } from './cellComponentsConfig';

export type MakeDataProps<T> = GetCollectionResult<T> & {
  options?: {
    sortFunctions: Record<string, any>
  }
};

/**
 * Transform data of a collection to table format choosing the right component to display
 */
export function makeData<T extends {}>({
  collection,
  meta,
  options = {
    sortFunctions: {}
  }
}: MakeDataProps<T>): { columns: ColumnDef<T>[]; data: T[] } {
  const { sortFunctions } = options;

  const columns: ColumnDef<T>[] = collection.length ? Object.keys(meta).reduce((acc, key) => {
    const metaItem = meta[key as keyof typeof meta];

    if (key !== 'id') {
      return [
        ...acc, {
          header: metaItem && metaItem.label,
          accessorKey: key,
          ...((sortFunctions && sortFunctions[key]) && { sortType: sortFunctions[key] }),
          ...(metaItem && metaItem.type && {
            ...(CELL_COMPONENTS_TYPES[metaItem.type].sortFn && {
              sortType: CELL_COMPONENTS_TYPES[metaItem.type].sortFn
            }),
            cell: (cell: CellContext<T, any>) => {
              const value = cell.getValue();
              return CELL_COMPONENTS_TYPES[metaItem.type].component(cell, {
                value,
                props: metaItem.props
              });
            }
          })
        }
      ];
    }
    return acc;
  }, [] as ColumnDef<T>[]) : [];

  return {
    columns,
    data: collection
  };
}

export type CollectionSelector<T> = (state: any) => GetCollectionResult<T>

type TableState<T> = {
  columns: ColumnDef<T>[];
  data: T[];
}

const defaultTableState: TableState<any> = {
  columns: [],
  data: []
};

/**
 * Returns table's column and rows given a selector which returns a collection.
 */
export function useTableCollection<T = {}>(selector: CollectionSelector<T>) {
  const [tableState, setTableState] = useState<TableState<T>>(defaultTableState);
  const data = useAppSelector(selector);

  useEffect(() => {
    if (data) {
      const { collection } = data;
      if (collection.length > 0) {
        setTableState(makeData({ ...data }));
      } else {
        setTableState(defaultTableState);
      }
    }
  }, [data]);

  const columns = useMemo(() => tableState.columns, [tableState.columns]);
  const rows = useMemo(() => tableState.data, [tableState.data]);

  return {
    columns,
    rows
  };
}
