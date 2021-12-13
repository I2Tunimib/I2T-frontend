import styled from '@emotion/styled';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import styles from './StatusBadge.module.scss';

interface StatusBadgeProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Color of the badge
   */
  status: 'Error' | 'Warn' | 'Success';
  size?: 'small' | 'medium';
}

const StatusBadge = styled(Box)<StatusBadgeProps>(({ size = 'medium', status }) => ({
  borderRadius: '50%',
  ...(size === 'small' && {
    width: '7px',
    height: '7px'
  }),
  ...(size === 'medium' && {
    width: '10px',
    height: '10px'
  }),
  ...(status === 'Error' && {
    backgroundColor: '#f45725'
  }),
  ...(status === 'Warn' && {
    backgroundColor: '#ffc700'
  }),
  ...(status === 'Success' && {
    backgroundColor: '#4ac99b'
  })
}));

export default StatusBadge;
