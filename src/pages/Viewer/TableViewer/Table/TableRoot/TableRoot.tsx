import clsx from 'clsx';
import styles from './TableRoot.module.scss';

/**
 * Table root element.
 */
const TableRoot = ({ children, className }: any) => (
  <table className={clsx(styles.TableRoot, className)}>
    {children}
  </table>
);

export default TableRoot;
