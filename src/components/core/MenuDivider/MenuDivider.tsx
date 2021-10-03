import { Divider } from '@mui/material';
import { FC } from 'react';
import styles from './MenuDivider.module.scss';

const MenuDivider: FC = () => {
  return (
    <Divider light className={styles.Root} />
  );
};

export default MenuDivider;
