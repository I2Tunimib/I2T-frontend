import { Button } from '@mui/material';
import { FC, ReactElement, useContext } from 'react';
import ExpandableListItem from '../ExpandableListItem';
import styles from './ExpandableListHeader.module.scss';

interface ExpandableListHeaderProps {
  /**
   * Direct children of header are ExpandableListItem
   */
  children: ReactElement<typeof ExpandableListItem>[] | ReactElement<typeof ExpandableListItem>;
}

const ExpandableListHeader: FC<ExpandableListHeaderProps> = ({
  children
}) => {
  return (
    <>
      <div className={styles.HeaderContainer}>
        {children}
      </div>
    </>
  );
};

export default ExpandableListHeader;
