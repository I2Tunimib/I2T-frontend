import { FC, useCallback } from 'react';
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
import { BaseMetadata } from '@store/slices/table/interfaces/table';
import styles from './NormalCell.module.scss';

interface NormalCellProps {
  label: string;
  value: any;
  dense: boolean;
  expanded: boolean;
  reconciliator: string;
}

const NormalCell: FC<NormalCellProps> = ({
  label,
  value,
  reconciliator,
  dense,
  expanded
}) => {
  const getBadgeStatus = (metadata: BaseMetadata[]) => {
    const matching = value.metadata.some((meta: BaseMetadata) => meta.match);
    if (matching) {
      return 'Success';
    }
    if (metadata.length > 0) {
      return 'Warn';
    }
    return 'Error';
  };

  const getItems = useCallback((start: number, finish: number): any[] => {
    let end = finish;
    if (finish > value.metadata.length) {
      end = value.metadata.length;
    }
    return value.metadata.slice(start, end);
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
        {value.metadata.length > 0 && (
          <StatusBadge
            status={getBadgeStatus(value.metadata)}
          />
        )}
        <div className={styles.TextLabel}>{label}</div>
      </div>
      {expanded && (
        <ExpandableList
          listTitle={`Entity ${reconciliator ? `- ${reconciliator}` : ''} `}
          messageIfNoContent="Cell doesn't have any metadata"
          className={styles.ExpandableList}>
          <ExpandableListHeader>
            {getItems(0, 3).map((item, index) => (
              <ExpandableListItem key={`${item.name}-${index}`}>
                <div className={styles.Item}>
                  <Link
                    href={item.url}
                    target="_blank">
                    {item.name}
                  </Link>
                  {item.match ? <CheckRoundedIcon className={styles.Icon} /> : null}
                </div>
              </ExpandableListItem>
            ))}
          </ExpandableListHeader>
          <ExpandableListBody>
            {getItems(3, value.metadata.length).map((item, index) => (
              <ExpandableListItem key={`${item.name}-${index}`}>
                <Link
                  href={item.url}
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
