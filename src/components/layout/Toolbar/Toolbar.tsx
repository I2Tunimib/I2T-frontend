import { FC, HTMLAttributes } from 'react';
import styles from './Toolbar.module.scss';

interface ToolbarProps extends HTMLAttributes<HTMLDivElement>{}

/**
 * A toolbar component.
 */
const Toolbar: FC<ToolbarProps> = ({
  children,
  ...props
}) => {
  return (
    <div className={styles.Container} {...props}>
      {children}
    </div>
  );
};

export default Toolbar;
