import { FC } from 'react';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import { Typography } from '@mui/material';
import styles from './EmptyList.module.scss';

interface EmptyListProps {
  message?: string;
}

const EmptyList: FC<EmptyListProps> = ({
  message = 'List is empty'
}) => {
  return (
    <div className={styles.Container}>
      <FindInPageOutlinedIcon />
      <Typography color="textSecondary">{message}</Typography>
    </div>
  );
};

export default EmptyList;
