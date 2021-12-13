import { Tag, Battery } from '@components/core';
import { Tooltip, Stack } from '@mui/material';
import { ReactNode } from 'react';
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
