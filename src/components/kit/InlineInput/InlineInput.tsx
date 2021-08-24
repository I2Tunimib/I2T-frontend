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
  onBlur,
  onChange
}) => (
  <div className={styles.Container}>
    <span className={styles.Text}>
      {value}
    </span>
    <input
      className={styles.Input}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
    />
  </div>
);

export default InlineInput;
