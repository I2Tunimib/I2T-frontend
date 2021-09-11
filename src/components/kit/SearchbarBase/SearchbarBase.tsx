import { FC, HTMLAttributes, ReactNode } from 'react';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import clsx from 'clsx';
import styles from './SearchbarBase.module.scss';
import ButtonShortcut from '../ButtonShortcut';

interface SearchbarBaseProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * Tag to display.
   */
  tag?: string;
  enableAutocomplete: boolean;
  autocompleteComponent: ReactNode;
  inputState: { focused: boolean; value: string };
}

/**
 * Wrapper component to SearchBar.
 */
const SearchbarBase: FC<SearchbarBaseProps> = ({
  inputState: { value, focused },
  enableAutocomplete,
  autocompleteComponent,
  tag,
  onClick,
  className,
  children
}) => {
  return (
    <div className={clsx(
      styles.AutocompleteOverlay,
      className,
      {
        [styles.Searching]: enableAutocomplete && value !== '' && focused
      }
    )}>
      <button
        onClick={onClick}
        className={clsx(
          styles.Container,
          {
            [styles.Focused]: focused,
            [styles.Searching]: enableAutocomplete && value !== '' && focused
          }
        )}>
        <SearchRoundedIcon />
        {tag && <ButtonShortcut text={tag} />}
        {children}
      </button>
      {enableAutocomplete && value !== '' && focused ? (
        <div className={styles.AutocompleteContentWrapper}>
          {autocompleteComponent}
        </div>
      ) : null}
    </div>
  );
};

export default SearchbarBase;
