import {
  ChangeEvent, FocusEvent,
  forwardRef, KeyboardEvent
} from 'react';
import styles from './EditableCell.module.scss';

interface EditableCellProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const EditableCell = forwardRef<HTMLInputElement, EditableCellProps>(({
  value,
  onChange,
  onBlur,
  onKeyDown
}: any, ref) => {
  return (
    <input
      ref={ref}
      autoComplete="off"
      spellCheck="false"
      className={styles.CellInput}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
});

export default EditableCell;
