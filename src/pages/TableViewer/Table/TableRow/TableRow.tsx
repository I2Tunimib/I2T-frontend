import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './TableRow.module.scss';

interface TableRowProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Table row element.
 */
const TableRow: FC<TableRowProps> = ({
  className,
  children
}) => (
  <tr className={clsx(styles.TableRow, className)}>
    {children}
  </tr>
);

export default TableRow;
