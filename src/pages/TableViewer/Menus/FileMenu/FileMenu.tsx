import { MenuBase, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { makeStyles, MenuItem, MenuList } from '@material-ui/core';
import SaveRoundedIcon from '@material-ui/icons/SaveRounded';
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
