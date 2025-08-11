import styled from '@emotion/styled';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import styles from './StatusBadge.module.scss';

// interface StatusBadgeProps extends HTMLAttributes<HTMLDivElement> {
//   /**
//    * Color of the badge
//    */
//   status: 'Error' | 'Warn' | 'Success';
//   size?: 'small' | 'medium';
// }

export type StatusBadgeProps = {
  status: 'miss' | 'warn' | 'match-manual' | 'match-reconciliator' | 'match-refinement',
  size?: 'small' | 'medium'
}

const StatusBadge = styled(Box)<StatusBadgeProps>(({ size = 'medium', status }) => ({
  display: 'inline-flex',
  flexShrink: 0,
  borderRadius: '50%',
  ...(size === 'small' && {
    width: '7px',
    height: '7px'
  }),
  ...(size === 'medium' && {
    width: '10px',
    height: '10px'
  }),
  ...(status === 'miss' && {
    backgroundColor: '#f45725'
  }),
  ...(status === 'warn' && {
    backgroundColor: '#ffc700'
  }),
  ...(status === 'match-manual' && {
    backgroundColor: '#106b4a',
    width: '9px',
    height: '5px',
    borderRadius: '5px'
  }),
  ...(status === 'match-refinement' && {
    backgroundColor: '#30a077',
    width: '5px',
    height: '9px',
    borderRadius: '5px'
  }),
  ...(status === 'match-reconciliator' && {
    backgroundColor: '#4ac99b'
  })
})) as typeof Box;

export default StatusBadge;
