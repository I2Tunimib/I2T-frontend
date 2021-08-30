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
        <MenuItemIconLabel divider shortcutLabel="Ctrl+O">Load new table</MenuItemIconLabel>
        <MenuItemIconLabel Icon={SaveRoundedIcon} shortcutLabel="Ctrl+S">Save</MenuItemIconLabel>
        <MenuItemIconLabel divider>Save as...</MenuItemIconLabel>
        <MenuItemIconLabel>Export as...</MenuItemIconLabel>
      </MenuList>
    </MenuBase>
  );
};

export default FileMenu;
