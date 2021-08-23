import {
  ChangeEvent,
  FocusEvent
} from 'react';
import styles from './InlineInput.module.scss';

interface IInlineInputProps {
  value: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * An inline input which behaves as text unless it is hoverd/clickd.
 * When clicked it becomes an input.
 */
const InlineInput = ({
  value,
  onBlur,
  onChange
}: IInlineInputProps) => (
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
