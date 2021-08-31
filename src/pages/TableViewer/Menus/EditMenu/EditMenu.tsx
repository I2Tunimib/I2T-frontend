import { MenuBase, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { makeStyles, MenuList } from '@material-ui/core';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import RedoRoundedIcon from '@material-ui/icons/RedoRounded';
import { FC } from 'react';
import { useAppSelector } from '@hooks/store';
import { selectCanRedo, selectCanUndo } from '@store/slices/table/table.selectors';

interface EditMenuProps extends MenuBaseProps {}

const useMenuStyles = makeStyles({
  list: {
    outline: 0
  }
});

const EditMenu: FC<EditMenuProps> = (props) => {
  const classes = useMenuStyles();
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  return (
    <MenuBase {...props}>
      <MenuList autoFocus className={classes.list}>
        <MenuItemIconLabel disabled={!canUndo} Icon={UndoRoundedIcon} shortcutLabel="Ctrl+Z">Undo</MenuItemIconLabel>
        <MenuItemIconLabel disabled={!canRedo} Icon={RedoRoundedIcon} shortcutLabel="Ctrl+Shift+Z">Redo</MenuItemIconLabel>
        <MenuItemIconLabel disabled={!canUndo}>Undo all</MenuItemIconLabel>
        <MenuItemIconLabel disabled={!canRedo}>Redo all</MenuItemIconLabel>
      </MenuList>
    </MenuBase>
  );
};

export default EditMenu;
