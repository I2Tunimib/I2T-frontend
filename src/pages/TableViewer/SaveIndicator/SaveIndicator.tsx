import { FC, HTMLAttributes, useEffect } from 'react';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import { IconButton, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { useAppSelector } from '@hooks/store';
import { selectLastChangeDate } from '@store/slices/table/table.selectors';
import TimeAgo from 'react-timeago';
import styles from './SaveIndicator.module.scss';
import timeAgoFormatter from './time-formatter';

interface SaveIndicatorProps extends HTMLAttributes<HTMLDivElement> { }

const SaveIndicator: FC<SaveIndicatorProps> = ({
  className
}) => {
  const lastChange = useAppSelector(selectLastChangeDate);

  return (
    <div className={styles.Container}>
      <IconButton size="small" className={className}>
        <CloudOffIcon className={styles.Icon} />
      </IconButton>
      <Typography className={styles.LastChange} color="textSecondary" variant="body2">
        {lastChange
          ? (
            <TimeAgo formatter={timeAgoFormatter} date={lastChange} />
          )
          : 'No changes yet'
        }
      </Typography>
    </div>
  );
};

export default SaveIndicator;
