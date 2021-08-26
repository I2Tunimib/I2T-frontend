import { FC } from 'react';
import styles from './ToolbarAction.module.scss';

interface ToolbarActionsProps { }

const ToolbarActions: FC<ToolbarActionsProps> = ({ children }) => {
  return (
    <div className={styles.Container}>
      {children}
    </div>
  );
};

export default ToolbarActions;
