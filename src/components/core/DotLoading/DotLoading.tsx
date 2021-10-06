import { FC } from 'react';
import styles from './DotLoading.module.scss';

interface DotFlashingProps {}

const DotFlashing: FC<DotFlashingProps> = () => {
  return (
    <div className={styles.Container}>
      <div className={styles.DotFlashing} />
    </div>
  );
};

export default DotFlashing;
