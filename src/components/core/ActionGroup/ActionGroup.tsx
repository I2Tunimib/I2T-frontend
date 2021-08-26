import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import styles from './ActionGroup.module.scss';

interface ActionGroupProps extends HTMLAttributes<HTMLDivElement> { }

const ActionGroup: FC<ActionGroupProps> = ({
  children,
  className
}) => (
  <div className={clsx(
    styles.Container,
    className
  )}>
    {children}
  </div>
);

export default ActionGroup;
