import { FC, useCallback } from 'react';
import { Metadata } from '@store/slices/table/interfaces/table';
import clsx from 'clsx';
import StatusBadge from '@components/core/StatusBadge';
import ExpandableList from '@components/kit/ExpandableList/ExpandableList';
import ExpandableListHeader from '@components/kit/ExpandableListHeader';
import ExpandableListItem from '@components/kit/ExpandableListItem';
import ExpandableListBody from '@components/kit/ExpandableListBody';
import { Link } from '@material-ui/core';
import styles from './NormalCell.module.scss';

interface NormalCellProps {
  label: string;
  value: any;
  matching: boolean;
  dense: boolean;
}

const NormalCell: FC<NormalCellProps> = ({
  label,
  value,
  matching,
  dense
}) => {
  const getBadgeStatus = (metadata: Metadata) => {
    if (matching) {
      return 'Success';
    }
    if (metadata.reconciliator && metadata.values.length > 0) {
      return 'Warn';
    }
    return 'Error';
  };

  const getItems = useCallback((start: number, finish: number): any[] => {
    let end = finish;
    if (finish > value.metadata.values.length) {
      end = value.metadata.values.length;
    }
    return value.metadata.values.slice(start, end);
  }, [value.metadata]);

  return (
    <div className={styles.Container}
    >
      <div className={clsx(
        styles.CellLabel,
        {
          [styles.Dense]: dense
        }
      )}>
        {!!value.metadata.reconciliator && (
          <StatusBadge
            className={styles.Badge}
            status={getBadgeStatus(value.metadata)}
          />
        )}
        {label}
      </div>
      {value.expanded && (
        <ExpandableList
          listTitle={`Metadata - ${value.metadata.reconciliator} `}
          messageIfNoContent="Cell doesn't have any metadata"
          className={styles.ExpandableList}>
          <ExpandableListHeader>
            {getItems(0, 3).map((item, index) => (
              <ExpandableListItem key={`${item.name}-${index}`}>
                <Link
                  className={clsx(
                    {
                      [styles.LinkMatched]: item.match
                    }
                  )}
                  href={`${value.metadata.resourceUrl}/${item.id}`}
                  target="_blank">
                  {item.name}
                </Link>
              </ExpandableListItem>
            ))}
          </ExpandableListHeader>
          <ExpandableListBody>
            {getItems(3, value.metadata.values.length).map((item, index) => (
              <ExpandableListItem key={`${item.name}-${index}`}>
                <Link
                  className={clsx(
                    {
                      [styles.LinkMatched]: item.match
                    }
                  )}
                  href={`${value.metadata.resourceUrl}/${item.id}`}
                  target="_blank">
                  {item.name}
                </Link>
              </ExpandableListItem>
            ))}
          </ExpandableListBody>
        </ExpandableList>
      )}
    </div>
  );
};

export default NormalCell;
