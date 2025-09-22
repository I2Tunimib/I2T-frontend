import { Link } from '@mui/material';
import { FC } from 'react';
import { CellContext } from '@tanstack/react-table';

interface TableCellProps {
  value: {
    label: string;
    isLink?: boolean;
    link?: string;
  }
}

const TableCell: FC<CellContext<any, TableCellProps>> = ({
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
