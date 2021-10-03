import { FC, HTMLAttributes } from 'react';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import clsx from 'clsx';
import styles from './ButtonPlay.module.scss';

interface ButtonPlayProps extends HTMLAttributes<HTMLButtonElement> {
  loading: boolean;
}

const ButtonPlay: FC<ButtonPlayProps> = ({
  loading,
  className
}) => {
  return (
    <button className={clsx(styles.Container, className)}>
      <PlayArrowRoundedIcon color="action" />
    </button>
  );
};

export default ButtonPlay;
