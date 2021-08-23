import styles from './TableRow.module.scss';

/**
 * Table row element
 */
const TableRow = ({ children }: any) => (
  <tr className={styles.TableRow}>
    {children}
  </tr>
);

export default TableRow;
