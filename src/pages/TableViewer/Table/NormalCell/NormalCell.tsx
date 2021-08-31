import { FC } from 'react';
import StatusBadge from '@components/core/StatusBadge';
import { Metadata } from '@store/slices/table/interfaces/table';
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
  const getBadgeStatus = (metadata: Metadata) => {
    if (matching) {
      return 'Success';
    }
    if (metadata.reconciliator && metadata.values.length > 0) {
      return 'Warn';
    }
    return 'Error';
  };

  return (
    <>
      <div className={styles.CellLabel}>
        {!!value.metadata.reconciliator && (
          <StatusBadge
            className={styles.Badge}
            status={getBadgeStatus(value.metadata)}
          />
        )}
        {label}
      </div>
    </>
  );
};

export default NormalCell;
