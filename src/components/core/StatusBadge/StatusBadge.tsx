import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import styles from './StatusBadge.module.scss';

interface StatusBadgeProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Color of the badge
   */
  status: 'Error' | 'Warn' | 'Success';
}

/**
 * Badge which signals status between 'error' | 'warn' | 'success'
 */
const StatusBadge: FC<StatusBadgeProps> = ({ status, className }) => (
  <div className={clsx(
    className,
    styles.Container,
    [styles[status]]
  )}
  />
);

export default StatusBadge;
