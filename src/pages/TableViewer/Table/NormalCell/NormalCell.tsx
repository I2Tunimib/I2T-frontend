import { FC } from 'react';
import StatusBadge from '@components/core/StatusBadge';
import styles from './NormalCell.module.scss';

interface NormalCellProps {
  label: string;
  value: any;
  matching: boolean;
}

const NormalCell: FC<NormalCellProps> = ({
  label,
  value,
  matching
}) => {
  const getBadgeStatus = (match: boolean) => {
    if (matching) {
      return 'Success';
    }
    return match ? 'Success' : 'Warn';
  };

  return (
    <>
      {value.metadata.length > 0 && (
        <StatusBadge
          className={styles.Badge}
          status={getBadgeStatus(value.metadata.match)}
        />
      )}
      {label}
    </>
  );
};

export default NormalCell;
