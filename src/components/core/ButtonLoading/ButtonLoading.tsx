import { Button, CircularProgress } from '@material-ui/core';
import { MouseEvent, ReactNode } from 'react';
import styles from './ButtonLoading.module.scss';

interface ButtonLoadingProps {
  loading: boolean;
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const ButtonLoading = ({
  loading,
  children,
  onClick
}: ButtonLoadingProps) => (
  <Button
    onClick={(event) => (onClick ? onClick(event) : undefined)}
    color="primary"
  >
    {loading ? <CircularProgress className={styles.Progress} /> : children}
  </Button>
);

export default ButtonLoading;
