import { MenuBase, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { useAppDispatch } from '@hooks/store';
import { makeStyles, MenuList } from '@material-ui/core';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import { deleteSelected } from '@store/slices/table/table.slice';
import { useCallback, FC } from 'react';

interface ContextMenuColumnProps extends MenuBaseProps {
  data?: any;
}

const useMenuStyles = makeStyles({
  list: {
    outline: 0
  }
});

const ContextMenuColumn: FC<ContextMenuColumnProps> = ({
  handleClose,
  ...props
}) => {
  const classes = useMenuStyles();
  const dispatch = useAppDispatch();

  /**
   * Handle delete column action.
   */
  const handleDeleteColumn = useCallback(() => {
    dispatch(deleteSelected({}));
    handleClose();
  }, [handleClose]);

  return (
    <MenuBase handleClose={handleClose} {...props}>
      <MenuList autoFocus className={classes.list}>
        <MenuItemIconLabel
          onClick={handleDeleteColumn}
          Icon={DeleteOutlineRoundedIcon}>
          Delete column
        </MenuItemIconLabel>
      </MenuList>
    </MenuBase>
  );
};

export default ContextMenuColumn;
