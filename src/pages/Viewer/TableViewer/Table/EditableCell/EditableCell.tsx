import {
  ChangeEvent, FocusEvent,
  forwardRef, KeyboardEvent
} from 'react';
import clsx from 'clsx';
import styles from './EditableCell.module.scss';

interface EditableCellProps {
  value: string;
  dense: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const EditableCell = forwardRef<HTMLInputElement, EditableCellProps>(({
  value,
  dense,
  onChange,
  onBlur,
  onKeyDown
}: any, ref) => {
  return (
    <input
      ref={ref}
      autoComplete="off"
      spellCheck="false"
      className={clsx(
        styles.CellInput,
        {
          [styles.Dense]: dense
        }
      )}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
});

export default EditableCell;
