import { Tag } from '@components/core';
import {
  Box, CircularProgress,
  CircularProgressProps, Typography
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';
import styles from './Status.module.scss';

interface StatusProps {
  value: number;
  status: {
    TODO: number;
    DOING: number;
    DONE: number;
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    color: (({ value }: any) => {
      if (value < 40) {
        return '#F45725';
      }
      if (value < 70) {
        return '#FFC808';
      }
      return '#4AC99B';
    })
  },
  svg: {
    strokeLinecap: 'round'
  }
}));

const CircularProgressWithLabel = (
  { value, ...props }: CircularProgressProps & { value: number }
) => {
  const classes = useStyles({ value });

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        classes={classes}
        size={80}
        variant="determinate"
        value={value}
        {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="body1"
          component="div"
          className={clsx({
            [styles.Red]: value < 40,
            [styles.Yellow]: value >= 40 && value < 70,
            [styles.Green]: value >= 70
          })}>
          {`${Math.round(
            value
          )}%`}
        </Typography>
      </Box>
    </Box>
  );
};

const Status: FC<StatusProps> = ({
  status,
  value
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.Container}>
      <CircularProgressWithLabel value={progress} />
      <div className={styles.Column}>
        <Tag status="todo" size="medium">
          {`TODO: ${status.TODO}`}
        </Tag>
        <Tag status="doing" size="medium">
          {`DOING: ${status.DOING}`}
        </Tag>
        <Tag status="done" size="medium">
          {`DONE: ${status.DONE}`}
        </Tag>
      </div>
    </div>
  );
};

export default Status;
