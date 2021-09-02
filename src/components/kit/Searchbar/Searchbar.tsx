import {
  FC, HTMLAttributes,
  useRef, useEffect,
  useCallback,
  useState,
  ChangeEvent,
  KeyboardEvent
} from 'react';
import SearchbarBase from '../SearchbarBase';
import styles from './Searchbar.module.scss';

interface SearchbarProps extends HTMLAttributes<HTMLInputElement> {
  /**
   * Callback function on tag change.
   */
  onTagChange: (tag: string) => void;
  /**
   * Default tag if no tag is present.
   */
  defaultTag?: string;
  /**
   * Regex to search for tags. Defaults to find tags in the form of
   * :[tagName]:
   */
  tagRegex?: RegExp;
  /**
   * List of permitted tags.
   */
  permittedTags?: string[];
  /**
   * Control focus status of input search.
   */
  focused?: boolean;
}

/**
 * Searchbar component with tag search.
 * The components provides a searchbar with an additional functionality
 * of tag filtering based on the tagRegex prop and permitted tags.
 */
const Searchbar: FC<SearchbarProps> = ({
  onTagChange,
  onChange,
  defaultTag,
  tagRegex,
  permittedTags,
  focused,
  className,
  ...props
}) => {
  const [inputState, setInputState] = useState<{ focused: boolean; value: string }>({ focused: false, value: '' });
  const [tag, setTag] = useState<string>(defaultTag ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputState.value && tagRegex && permittedTags) {
      const matches = tagRegex.exec(inputState.value);
      if (matches && permittedTags.indexOf(matches[1]) !== -1) {
        setTag(matches[1]);
        setInputState((state) => ({ ...state, value: '' }));
      }
    }
  }, [inputState.value]);

  useEffect(() => {
    if (tag) {
      onTagChange(tag);
    }
  }, [tag]);

  useEffect(() => {
    if (focused) {
      setInputState((state) => ({ ...state, focused }));
    }
  }, [focused]);

  const onClickBaseHandler = useCallback(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputState((state) => ({ ...state, value: event.target.value }));
    if (onChange && !event.target.value.startsWith(':')) {
      onChange(event);
    }
  }, [onChange, inputState.value]);

  const handleOnFocus = useCallback(() => {
    setInputState((state) => ({ ...state, focused: true }));
  }, []);

  const handleOnBlur = useCallback(() => {
    setInputState((state) => ({ ...state, focused: false }));
  }, []);

  const handleOnKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && inputState.value === '' && tag) {
      setTag(defaultTag ?? '');
    }
  }, [inputState.value, tag]);

  return (
    <SearchbarBase
      tag={tag}
      onClick={onClickBaseHandler}
      className={className}>
      <input
        ref={inputRef}
        value={inputState.value}
        onKeyDown={handleOnKeyDown}
        onChange={handleOnChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        placeholder="Search table, metadata..."
        autoComplete="off"
        spellCheck="false"
        className={styles.Input}
      />
    </SearchbarBase>
  );
};

export default Searchbar;
