import { FC } from 'react';
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';
import { Typography } from '@material-ui/core';
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
