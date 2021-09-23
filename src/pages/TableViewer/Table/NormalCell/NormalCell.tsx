import { FC, useCallback } from 'react';
import { Metadata, MetadataInstance } from '@store/slices/table/interfaces/table';
import clsx from 'clsx';
import StatusBadge from '@components/core/StatusBadge';
import ExpandableList from '@components/kit/ExpandableList/ExpandableList';
import ExpandableListHeader from '@components/kit/ExpandableListHeader';
import ExpandableListItem from '@components/kit/ExpandableListItem';
import ExpandableListBody from '@components/kit/ExpandableListBody';
import { Link } from '@material-ui/core';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { selectReconciliatorCell } from '@store/slices/table/table.selectors';
import { RootState } from '@store';
import { connect } from 'react-redux';
import styles from './NormalCell.module.scss';

interface NormalCellProps {
  label: string;
  value: any;
  dense: boolean;
  reconciliator: string;
}

const NormalCell: FC<NormalCellProps> = ({
  label,
  value,
  reconciliator,
  dense
}) => {
  const getBadgeStatus = (metadata: Metadata) => {
    const matching = value.metadata.values.some((meta: MetadataInstance) => meta.match);
    if (matching) {
      return 'Success';
    }
    if (metadata.reconciliator.id && metadata.values.length > 0) {
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
        {value.metadata.reconciliator.id && (
          <StatusBadge
            className={styles.Badge}
            status={getBadgeStatus(value.metadata)}
          />
        )}
        {label}
      </div>
      {value.expanded && (
        <ExpandableList
          listTitle={`Metadata ${reconciliator ? `- ${reconciliator}` : ''} `}
          messageIfNoContent="Cell doesn't have any metadata"
          className={styles.ExpandableList}>
          <ExpandableListHeader>
            {getItems(0, 3).map((item, index) => (
              <ExpandableListItem key={`${item.name}-${index}`}>
                <div className={styles.Item}>
                  <Link
                    href={`${value.metadata.resourceUrl}/${item.id}`}
                    target="_blank">
                    {item.name}
                  </Link>
                  {item.match ? <CheckRoundedIcon className={styles.Icon} /> : null}
                </div>
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

const mapStateToProps = (state: RootState, props: any) => {
  return {
    reconciliator: selectReconciliatorCell(state, props)
  };
};

export default connect(mapStateToProps)(NormalCell);
