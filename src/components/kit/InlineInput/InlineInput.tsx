import clsx from 'clsx';
import {
  ChangeEvent,
  FC,
  FocusEvent,
  HTMLAttributes
} from 'react';
import styles from './InlineInput.module.scss';

interface InlineInputProps extends HTMLAttributes<HTMLInputElement> {
  /**
   * Value of the input
   */
  value: string;
}

/**
 * An inline input which behaves as text unless it is hoverd/clickd.
 * When clicked it becomes an input.
 */
const InlineInput: FC<InlineInputProps> = ({
  value,
  className,
  onClick,
  onBlur,
  onChange
}) => (
  <div className={styles.Container}>
    <span className={styles.Text}>
      {value}
    </span>
    <input
      className={clsx(styles.Input, className)}
      value={value}
      onClick={onClick}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
    />
  </div>
);

export default InlineInput;
