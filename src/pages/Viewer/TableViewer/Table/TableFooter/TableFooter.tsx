import { Typography } from '@material-ui/core';
import Paginator, { PaginatorProps } from './Paginator';
import styles from './TableFooter.module.scss';

interface TableFooterProps {
  /**
   * Rows of the table.
   */
  rows: any[];
  paginatorProps: PaginatorProps;
}

/**
 * Table footer element.
 */
const TableFooter = ({
  rows,
  paginatorProps
}: TableFooterProps) => (
  <div className={styles.TableFooter}>
    <Typography color="textSecondary" variant="body2">
      {`Total rows: ${rows.length}`}
    </Typography>
    <Paginator {...paginatorProps} />
  </div>
);

export default TableFooter;
