import { Collapse } from '@mui/material';
import { FC, ReactElement, useContext } from 'react';
import ExpandableListContext from '../ExpandableList/ExpandableListContext';
import ExpandableListItem from '../ExpandableListItem';
import styles from './ExpandableListBody.module.scss';

interface ExpandableListBodyProps {
  /**
   * Direct children of body are ExpandableListItem
   */
  children: ReactElement<typeof ExpandableListItem>[] | ReactElement<typeof ExpandableListItem>;
}

const ExpandableListBody: FC<ExpandableListBodyProps> = ({
  children
}) => {
  const { expanded } = useContext(ExpandableListContext);

  return (
    <Collapse timeout={0} unmountOnExit in={expanded}>
      <div className={styles.Container}>
        {children}
      </div>
    </Collapse>
  );
};

export default ExpandableListBody;
