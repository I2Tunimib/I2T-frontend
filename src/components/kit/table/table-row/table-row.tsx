import styles from './table-row.module.scss';

/**
 * Table row element
 */
const TableRow = ({ children }: any) => (
  <tr className={styles['table-row']}>
    {children}
  </tr>
);

export default TableRow;
