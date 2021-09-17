import { Link } from '@material-ui/core';
import { FC } from 'react';
import { Cell } from 'react-table';

interface TableCellProps {
  value: {
    label: string;
    isLink?: boolean;
    link?: string;
  }
}

const TableCell: FC<Cell<TableCellProps>> = ({
  value: {
    label,
    isLink,
    link
  }
}) => {
  return (
    <>
      {isLink ? (
        <Link
          onClick={(e) => e.stopPropagation()}
          href={link}
          target="_blank">
          {label}
        </Link>
      ) : label}
    </>
  );
};

export default TableCell;
