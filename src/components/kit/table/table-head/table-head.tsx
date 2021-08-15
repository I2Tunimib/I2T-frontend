import styles from './table-head.module.scss';

/**
 * Table head element
 */
const TableHead = ({ children }: any) => (
  <thead className={styles['table-head']}>
    {children}
  </thead>
);

export default TableHead;
