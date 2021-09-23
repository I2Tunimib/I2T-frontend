import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import styles from './ButtonShortcut.module.scss';

interface ButtonShortcutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Text to display in the button.
   */
  text?: string;
}

/**
 * Small button symbol.
 */
const ButtonShortcut: FC<ButtonShortcutProps> = ({
  text = 'CTRL',
  className
}) => {
  return (
    <div className={clsx(styles.Container, className)}>
      {text}
    </div>
  );
};

export default ButtonShortcut;
