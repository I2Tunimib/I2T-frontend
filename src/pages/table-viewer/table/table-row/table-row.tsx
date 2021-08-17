import styles from './table-row.module.scss';

/**
 * Table row element
 */
const TableRow = ({ children }: any) => (
  <tr className={styles.TableRow}>
    {children}
  </tr>
);

export default TableRow;
