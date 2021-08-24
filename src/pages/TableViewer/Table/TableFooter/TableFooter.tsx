import styles from './TableFooter.module.scss';

interface TableFooterProps {
  /**
   * Rows of the table.
   */
  rows: any[];
}

/**
 * Table footer element.
 */
const TableFooter = ({ rows }: TableFooterProps) => (
  <div className={styles.TableFooter}>
    {`${rows.length} rows`}
  </div>
);

export default TableFooter;
