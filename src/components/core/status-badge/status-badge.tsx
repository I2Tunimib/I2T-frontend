import clsx from 'clsx';
import styles from './status-badge.module.scss';

interface IStatusBadgeProps {
  status: 'Error' | 'Warn' | 'Success';
  className?: string;
}

/**
 * Signal status between 'error' | 'warn' | 'success'
 */
const StatusBadge = ({ status, className }: IStatusBadgeProps) => (
  <div className={clsx(
    className,
    styles.Container,
    [styles[status]]
  )}
  />
);

export default StatusBadge;
