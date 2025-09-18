import { MenuBase, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { useAppDispatch } from '@hooks/store';
import { MenuList } from '@mui/material';
//import makeStyles from '@mui/styles/makeStyles';
import styled from '@emotion/styled';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { deleteSelected, updateColumnEditable, updateColumnVisibility } from '@store/slices/table/table.slice';
import { useCallback, FC } from 'react';

interface ContextMenuColumnProps extends MenuBaseProps {
  data?: any;
  columns: any[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (v: Record<string, boolean>) => void;
  columnPinning: { left: string[] };
  setColumnPinning: (v: { left: string[] }) => void;
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
  columns,
  columnVisibility,
  setColumnVisibility,
  columnPinning,
  setColumnPinning,
  ...props
}) => {
  //const classes = useMenuStyles();
  const dispatch = useAppDispatch();

    /**
     * Handle pin/unpin column action.
     */
    const isPinned = columnPinning.left.includes(id);

  const togglePinColumn = useCallback(() => {
    let newPinning;
    if (isPinned) {
      newPinning = {
        ...columnPinning,
        left: columnPinning.left.filter((colId) => colId !== id),
      };
    } else {
      newPinning = {
        ...columnPinning,
        left: [...columnPinning.left, id],
      };
    }

    setColumnPinning(newPinning);
    handleClose();
  }, [isPinned, id, columnPinning, setColumnPinning, dispatch, handleClose]);

  /**
   * Handle edit column action.
   */
    const editColumn = useCallback(() => {
      dispatch(updateColumnEditable({ colId: id }));
      handleClose();
    }, [handleClose]);

  /**
   * Handle hide column action.
   */
  const handleHideColumn = useCallback(() => {
    const newVisibility = { ...columnVisibility, [id]: false };
    setColumnVisibility(newVisibility);
    dispatch(updateColumnVisibility({ id, isVisible: false }));
    handleClose();
  }, [id, columnVisibility, setColumnVisibility, dispatch, handleClose]);

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
          onClick={togglePinColumn}
          Icon={isPinned ? PushPinIcon : PushPinOutlinedIcon}>
          {isPinned ? 'Unpin column' : 'Pin column'}
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={handleHideColumn}
          Icon={VisibilityOffRoundedIcon}>
          Hide column
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={editColumn}
          Icon={EditRoundedIcon}>
          Edit column
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
