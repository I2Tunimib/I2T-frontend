import { Tag } from '@components/core';
import {
  Button, Chip,
  Link, Stack, Typography
} from '@mui/material';
import { MetaToViewItem } from '@store/slices/config/interfaces/config';
import { Cell } from 'react-table';

export const ResourceLink = ({ value: cellValue }: Cell<{}>) => {
  const { value, uri } = cellValue;
  return (
    <Link onClick={(event) => event.stopPropagation()} title={value} href={uri} target="_blank">{value}</Link>
  );
};

export const MatchCell = ({ value: inputValue }: Cell<{}>) => {
  const value = inputValue == null ? false : inputValue;

  return (
    <Tag size="medium" status={value ? 'done' : 'doing'}>
      {`${value}`}
    </Tag>
  );
};

export const SubList = (value: any[] = []) => {
  return (
    <Stack direction="row" gap="10px">
      {value.length > 0 ? value.map((item) => (
        <Chip key={item.id} size="small" label={item.name} />
      )) : <Typography variant="caption">This entity has no types</Typography>}
    </Stack>
  );
};

export const Expander = ({ row, setSubRows, value: inputValue }: any) => {
  const { onClick, ...rest } = row.getToggleRowExpandedProps() as any;

  const value = inputValue || [];

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    setSubRows((old: any) => {
      if (old[row.id]) {
        const { [row.id]: discard, ...newState } = old;
        return newState;
      }

      return {
        ...old,
        [row.id]: SubList(value)
      };
    });
    onClick();
  };

  return (
    <Button onClick={handleClick} {...rest}>
      {row.isExpanded ? `(${value.length}) 👇` : `(${value.length}) 👉`}
    </Button>
  );
};

export const CELL_COMPONENTS_TYPES = {
  tag: MatchCell,
  link: ResourceLink,
  subList: Expander
};

export const getCellComponent = (cell: Cell<{}>, type: MetaToViewItem['type']) => {
  const { value } = cell;
  if (value == null) {
    return <Typography color="textSecondary">null</Typography>;
  }
  if (!type) {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  }
  return CELL_COMPONENTS_TYPES[type](cell);
};
