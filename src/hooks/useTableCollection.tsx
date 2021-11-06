import { Tag, Battery } from '@components/core';
import { useAppSelector } from '@hooks/store';
import { Tooltip, Stack } from '@mui/material';
import { GetCollectionResult, MetaCollection } from '@services/api/datasets';
import { RootState } from '@store';
import {
  ReactNode, useEffect,
  useMemo, useState
} from 'react';
import { Cell, Column } from 'react-table';
import TimeAgo from 'react-timeago';

export type PercentageComponentProps = {
  total: number;
  value: number;
}

export type TagComponentProps = {
  value: string;
  status: 'done' | 'doing' | 'todo';
}

export type CellComponentProps = {
  component: (props: any) => ReactNode,
  sortFn?: (...props: any) => number;
}
export type CellComponent = 'date' | 'tag' | 'percentage';

/**
 * Components types to display and corresponding sort function if present
 */
export const CELL_COMPONENTS_TYPES: Record<CellComponent, CellComponentProps> = {
  date: {
    component: (value: number) => <TimeAgo title="" date={value} />
  },
  tag: {
    component: ({ status, value }: TagComponentProps) => <Tag status={status}>{value}</Tag>
  },
  percentage: {
    component: (props: PercentageComponentProps) => {
      const { total, value } = props;
      return (
        <Tooltip
          arrow
          title={(
            <Stack>
              {Object.keys(props).map((key, index) => (
                <span key={index}>
                  {`${key}: ${props[key as keyof typeof props]}`}
                </span>
              ))}
            </Stack>
          )}
          placement="left">
          <Stack direction="row" gap="18px">
            <Battery value={(value / total) * 100} />
          </Stack>
        </Tooltip>
      );
    },
    sortFn: (
      rowA: any, rowB: any,
      columnId: string,
      desc: boolean
    ) => {
      const { totalA, valueA } = rowA.values[columnId];
      const { totalB, valueB } = rowB.values[columnId];
      return (valueA / totalA) < (totalB / valueB) ? -1 : 1;
    }
  }
};

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
}: MakeDataProps<T>): { columns: Column[]; data: T[] } {
  const { sortFunctions } = options;

  const columns = collection.length ? Object.keys(collection[0]).reduce((acc, key) => {
    const metaItem = meta[key as keyof typeof collection[0]];

    if (key !== 'id') {
      return [
        ...acc, {
          Header: metaItem && metaItem.label,
          accessor: key,
          ...((sortFunctions && sortFunctions[key]) && { sortType: sortFunctions[key] }),
          ...(metaItem && metaItem.type && {
            ...(CELL_COMPONENTS_TYPES[metaItem.type].sortFn && {
              [key]: CELL_COMPONENTS_TYPES[metaItem.type].sortFn
            }),
            Cell: ({ row, value }: Cell<T>) => {
              if (metaItem.type) {
                return CELL_COMPONENTS_TYPES[metaItem.type].component(value);
              }
            }
          })
        }
      ];
    }
    return acc;
  }, [] as Column[]) : [];

  return {
    columns,
    data: collection
  };
}

export type CollectionSelector<T> = (state: any) => GetCollectionResult<T>

type TableState<T> = {
  columns: Column[];
  data: T[];
}

const defaultTableState = {
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
