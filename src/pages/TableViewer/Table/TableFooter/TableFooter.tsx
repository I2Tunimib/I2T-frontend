import styles from './TableFooter.module.scss';

interface ITableFooterProps {
  rows: any[];
}

/**
 * Table footer element
 */
const TableFooter = ({ rows }: ITableFooterProps) => (
  <div className={styles.TableFooter}>
    {`${rows.length} rows`}
  </div>
);

export default TableFooter;
