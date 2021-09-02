import { FC, HTMLAttributes } from 'react';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import clsx from 'clsx';
import styles from './SearchbarBase.module.scss';
import ButtonShortcut from '../ButtonShortcut';

interface SearchbarBaseProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * Tag to display.
   */
  tag?: string;
}

/**
 * Wrapper component to SearchBar.
 */
const SearchbarBase: FC<SearchbarBaseProps> = ({
  tag,
  onClick,
  className,
  children
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        styles.Container,
        className
      )}>
      <SearchRoundedIcon />
      {tag && <ButtonShortcut text={tag} />}
      {children}
    </button>
  );
};

export default SearchbarBase;
