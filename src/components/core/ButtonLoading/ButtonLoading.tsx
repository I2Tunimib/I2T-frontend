import { Button, ButtonProps, CircularProgress } from '@material-ui/core';
import { FC, MouseEvent } from 'react';
import styles from './ButtonLoading.module.scss';

interface ButtonLoadingProps extends ButtonProps {
  /**
   * Show or hide loading status.
   */
  loading: boolean;
  /**
   * onClick handler function.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * HOC component for the material button which provides a loading status.
 */
const ButtonLoading: FC<ButtonLoadingProps> = ({
  loading,
  children,
  onClick
}) => (
  <Button
    onClick={(event) => (onClick ? onClick(event) : undefined)}
    color="primary"
  >
    {loading ? <CircularProgress className={styles.Progress} /> : children}
  </Button>
);

export default ButtonLoading;
