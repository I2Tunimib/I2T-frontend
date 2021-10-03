import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import styles from './Tag.module.scss';

interface TagProps extends HTMLAttributes<HTMLDivElement> {
  status: 'done' | 'doing' | 'todo',
  size?: 'small' | 'medium'
}

const Tag: FC<TagProps> = ({
  status,
  size = 'small',
  children
}) => {
  return (
    <div className={clsx(
      styles.Container,
      {
        [styles.Medium]: size === 'medium',
        [styles.Done]: status === 'done',
        [styles.Doing]: status === 'doing',
        [styles.Todo]: status === 'todo'
      }
    )}>
      <div className={styles.Circle} />
      <span>{children}</span>
    </div>
  );
};

export default Tag;
