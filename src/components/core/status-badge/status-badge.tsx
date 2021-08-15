import clsx from 'clsx';
import styles from './status-badge.module.scss';

interface IStatusBadgeProps {
  status: 'error' | 'warn' | 'success';
  className?: string;
}

/**
 * Signal status between 'error' | 'warn' | 'success'
 */
const StatusBadge = ({ status, className }: IStatusBadgeProps) => (
  <div className={clsx(
    className,
    styles.container,
    [styles[status]]
  )}
  />
);

export default StatusBadge;
