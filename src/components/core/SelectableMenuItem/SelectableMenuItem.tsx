import { MenuItem, MenuItemProps, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { FC } from 'react';
import styles from './SelectableMenuItem.module.scss';

export interface SelectableMenuItemProps {
  selected?: boolean;
  onClick?: () => void;
}

const SelectableMenuItem: FC<SelectableMenuItemProps> = ({
  selected = false,
  onClick,
  children
}) => {
  return (
    <MenuItem onClick={onClick} className={styles.Container}>
      <Typography variant="body2">
        {children}
      </Typography>
      {selected && <CheckRoundedIcon className={styles.Icon} />}
    </MenuItem>
  );
};

export default SelectableMenuItem;
