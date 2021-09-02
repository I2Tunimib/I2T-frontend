import { FC } from 'react';
import styles from './ButtonShortcut.module.scss';

interface ButtonShortcutProps {
  /**
   * Text to display in the button.
   */
  text?: string;
}

/**
 * Small button symbol.
 */
const ButtonShortcut: FC<ButtonShortcutProps> = ({
  text = 'CTRL'
}) => {
  return (
    <div className={styles.Container}>
      {text}
    </div>
  );
};

export default ButtonShortcut;
