import { MenuBase, MenuDivider, MenuItemIconLabel } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { MenuList } from '@mui/material';
//import makeStyles from '@mui/styles/makeStyles';
import styled from '@emotion/styled';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SettingsEthernetRoundedIcon from '@mui/icons-material/SettingsEthernetRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { FC, useCallback } from 'react';
import { useAppDispatch } from '@hooks/store';
import {
  deleteColumn, deleteRow,
  updateCellEditable, updateUI
} from '@store/slices/table/table.slice';
import { getIdsFromCell } from '@store/slices/table/utils/table.utils';

interface ContextMenuCellProps extends MenuBaseProps {
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

const ContextMenuCell: FC<ContextMenuCellProps> = ({
  data: { id },
  handleClose,
  ...props
}) => {
  //const classes = useMenuStyles();
  const dispatch = useAppDispatch();

  /**
   * Handle edit cell action.
   */
  const editCell = useCallback(() => {
    dispatch(updateCellEditable({ cellId: id }));
    handleClose();
  }, [id, handleClose]);

  /**
   * Handle renconcile cell action.
   */
  const reconciliateCell = useCallback(() => {
    dispatch(updateUI({ openReconciliateDialog: true }));
    handleClose();
  }, [handleClose]);

  /**
   * Handle managae metadata cell action.
   */
  const manageMetadata = useCallback(() => {
    dispatch(updateUI({ openMetadataDialog: true }));
    handleClose();
  }, [handleClose]);

  /**
   * Handle delete column action.
   */
  const deleteOneColumn = useCallback(() => {
    dispatch(deleteColumn({ colId: getIdsFromCell(id)[1] }));
    handleClose();
  }, [id, handleClose]);

  /**
   * Handle delete row action.
   */
  const deleteOneRow = useCallback(() => {
    dispatch(deleteRow({ rowId: getIdsFromCell(id)[0] }));
    handleClose();
  }, [id, handleClose]);

  return (
    <MenuBase
      handleClose={handleClose}
      {...props}
    >
      <StyledMenuList autoFocus //className={classes.list}
      >
        <MenuItemIconLabel
          onClick={editCell}
          Icon={EditRoundedIcon}>
          Edit
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={reconciliateCell}
          Icon={LinkRoundedIcon}>
          Reconciliate cell
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={manageMetadata}
          Icon={SettingsEthernetRoundedIcon}>
          Manage metadata
        </MenuItemIconLabel>
        <MenuDivider />
        <MenuItemIconLabel
          onClick={deleteOneColumn}
          Icon={DeleteOutlineRoundedIcon}>
          Delete column
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={deleteOneRow}
          Icon={DeleteOutlineRoundedIcon}>
          Delete row
        </MenuItemIconLabel>
      </StyledMenuList>
    </MenuBase>
  );
};

export default ContextMenuCell;
