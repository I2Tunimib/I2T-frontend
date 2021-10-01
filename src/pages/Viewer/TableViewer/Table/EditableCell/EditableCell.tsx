import {
  ChangeEvent, FC, FocusEvent,
  useEffect, KeyboardEvent, useRef
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

const EditableCell:FC<EditableCellProps> = ({
  value,
  dense,
  onChange,
  onBlur,
  onKeyDown
}: any) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.select();
    }
  }, [ref]);

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
};

export default EditableCell;
