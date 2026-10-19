import clsx from 'clsx';
import styles from './TableRoot.module.scss';

/**
 * Table root element.
 */
const TableRoot = ({ children, className, style }: any) => (
  <table className={clsx(styles.TableRoot, className)} style={style}>
    {children}
  </table>
);

export default TableRoot;
