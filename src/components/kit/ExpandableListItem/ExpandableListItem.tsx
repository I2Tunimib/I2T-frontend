import { ComponentType, FC, ReactNode } from 'react';
import styles from './ExpandableListItem.module.scss';

interface ExpandableListItemProps {
  /**
   * Component to render as item, it defaults to ListItem.
   */
  as?: ComponentType;
}

const ListItem: FC<any> = ({
  children
}) => {
  return (
    <div className={styles.Container}>
      {children}
    </div>
  );
};

const ExpandableListItem: FC<ExpandableListItemProps> = ({
  children,
  as: ComponentToRender = ListItem
}) => {
  return (
    <ComponentToRender>
      {children}
    </ComponentToRender>
  );
};

export default ExpandableListItem;
