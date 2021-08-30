import { MenuBase, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { makeStyles, MenuList } from '@material-ui/core';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import { FC } from 'react';

interface EditMenuProps extends MenuBaseProps {}

const useMenuStyles = makeStyles({
  list: {
    outline: 0
  }
});

const EditMenu: FC<EditMenuProps> = (props) => {
  const classes = useMenuStyles();

  return (
    <MenuBase {...props}>
      <MenuList autoFocus className={classes.list}>
        <MenuItemIconLabel Icon={UndoRoundedIcon} shortcutLabel="Ctrl+Z">Undo</MenuItemIconLabel>
        <MenuItemIconLabel Icon={RedoRoundedIcon} shortcutLabel="Ctrl+Shift+Z">Redo</MenuItemIconLabel>
        <MenuItemIconLabel>Undo all</MenuItemIconLabel>
        <MenuItemIconLabel>Redo all</MenuItemIconLabel>
      </MenuList>
    </MenuBase>
  );
};

export default EditMenu;
