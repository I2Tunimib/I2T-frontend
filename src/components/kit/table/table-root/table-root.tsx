import styles from './table-root.module.scss';

/**
 * Table root element
 */
const TableRoot = ({ children }: any) => (
  <table className={styles.root}>
    {children}
  </table>
);

export default TableRoot;
