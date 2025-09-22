import { Tag, Battery } from '@components/core';
import { Tooltip, Stack, Link as MatLink } from '@mui/material';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
  component: (row: any, { value, props }: any) => ReactNode,
  sortFn?: (...props: any) => number;
}
export type CellComponent = 'date' | 'tag' | 'percentage' | 'link';

/**
 * Components types to display and corresponding sort function if present
 */
export const CELL_COMPONENTS_TYPES: Record<CellComponent, CellComponentProps> = {
  link: {
    component: (cell, { props }) => {
      const value = cell.getValue();
      const original = cell.row?.original;
      const { url: rawUrl, queryParams } = props;
      let url = rawUrl.split('/').map((split: string) => {
        if (split.startsWith(':')) {
          const [_, param] = split.split(':');
          if (original[param] != null) {
            return original[param];
          }
        }
        return split;
      }).join('/');
      url = queryParams ? `${url}${queryParams}` : url;
      return <MatLink sx={{ textDecoration: 'none' }} component={Link} to={url}>{value}</MatLink>;
    }
  },
  date: {
    component: (cell) => {
      const value = cell.getValue();
      return <TimeAgo title="" date={value} />;
    },
  },
  tag: {
    component: (cell, { status }) => {
      const value = cell.getValue();
      return <Tag status={status}>{value}</Tag>;
    },
  },
  percentage: {
    component: (cell) => {
      const { total, value } = cell.getValue() as PercentageComponentProps;
      return (
        <Tooltip
          arrow
          title={
            <Stack>
              <span>Total: {total}</span>
              <span>Value: {value}</span>
            </Stack>
          }
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
      const { totalA, valueA } = rowA.getValue(columnId);
      const { totalB, valueB } = rowB.getValue(columnId);
      return (valueA / totalA) < (totalB / valueB) ? -1 : 1;
    }
  }
};
