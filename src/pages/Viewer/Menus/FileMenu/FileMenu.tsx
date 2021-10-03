import { MenuBase, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { MenuItem, MenuList } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { FC } from 'react';

interface FileMenuProps extends MenuBaseProps {}

const useMenuStyles = makeStyles({
  list: {
    outline: 0
  }
});

const FileMenu: FC<FileMenuProps> = (props) => {
  const classes = useMenuStyles();

  return (
    <MenuBase {...props}>
      <MenuList autoFocus className={classes.list}>
        <MenuItemIconLabel Icon={SaveRoundedIcon} shortcutLabel="Ctrl+S">Save</MenuItemIconLabel>
        <MenuItemIconLabel>Export...</MenuItemIconLabel>
      </MenuList>
    </MenuBase>
  );
};

export default FileMenu;
