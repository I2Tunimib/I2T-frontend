import { MenuBase, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { useAppDispatch } from '@hooks/store';
import { MenuList } from '@mui/material';
//import makeStyles from '@mui/styles/makeStyles';
import styled from '@emotion/styled';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { deleteSelected, updateColumnEditable } from '@store/slices/table/table.slice';
import { useCallback, FC } from 'react';

interface ContextMenuColumnProps extends MenuBaseProps {
  data?: any;
}

/*
const useMenuStyles = makeStyles({
  list: {
    outline: 0
  }
});
*/

const StyledMenuList = styled(MenuList)`
  outline: 0;
`;

const ContextMenuColumn: FC<ContextMenuColumnProps> = ({
  data: { id },
  handleClose,
  ...props
}) => {
  //const classes = useMenuStyles();
  const dispatch = useAppDispatch();

    /**
   * Handle edit column action.
   */
    const editColumn = useCallback(() => {
      dispatch(updateColumnEditable({ colId: id }));
      handleClose();
    }, [handleClose]);

  /**
   * Handle delete column action.
   */
  const handleDeleteColumn = useCallback(() => {
    dispatch(deleteSelected({}));
    handleClose();
  }, [handleClose]);

  return (
    <MenuBase handleClose={handleClose} {...props}>
      <StyledMenuList autoFocus //className={classes.list}
      >
      <MenuItemIconLabel
          onClick={editColumn}
          Icon={EditRoundedIcon}>
          Edit
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={handleDeleteColumn}
          Icon={DeleteOutlineRoundedIcon}>
          Delete column
        </MenuItemIconLabel>
      </StyledMenuList>
    </MenuBase>
  );
};

export default ContextMenuColumn;
