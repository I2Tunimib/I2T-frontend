import { MenuBase, MenuItemIconLabel } from "@components/core";
import { MenuBaseProps } from "@components/core/MenuBase";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { MenuList } from "@mui/material";
import styled from "@emotion/styled";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SecurityIcon from "@mui/icons-material/Security";
import TransformIcon from "@mui/icons-material/Transform";
import {
  deleteSelected,
  updateColumnVisibility,
  updateUI,
} from "@store/slices/table/table.slice";
import { useCallback, FC } from "react";
import {
  selectAreCellReconciliated,
  selectIsCellSelected,
} from "@store/slices/table/table.selectors";
import { useSnackbar } from "notistack";
import { selectExtendersAsArray } from "@store/slices/config/config.selectors";
import { extend } from "@store/slices/table/table.thunk";

interface ContextMenuColumnProps extends MenuBaseProps {
  data?: any;
  columns: any[];
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (v: Record<string, boolean>) => void;
  columnPinning: { left: string[] };
  setColumnPinning: (v: { left: string[] }) => void;
}

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
  const dispatch = useAppDispatch();
  const isCellSelected = useAppSelector(selectIsCellSelected);
  const cellReconciliated = useAppSelector(selectAreCellReconciliated);
  const extensionServices = useAppSelector(selectExtendersAsArray);

  /**
   * Handle modify column action.
   */
  const handleModify = useCallback(() => {
    if (isCellSelected) {
      dispatch(updateUI({ openModificationDialog: true }));
      handleClose();
    }
  }, [isCellSelected, dispatch, handleClose]);
  /**
   * Handle reconcile column action.
   */
  const handleReconcile = useCallback(() => {
    if (isCellSelected) {
      dispatch(updateUI({ openReconciliateDialog: true }));
      handleClose();
    }
  }, [isCellSelected, dispatch, handleClose]);

  /**
   * Handle extend column action.
   */
  const { enqueueSnackbar } = useSnackbar();

  const handleExtend = useCallback(() => {
    if (!cellReconciliated) {
      enqueueSnackbar("The column must be reconciled to extend it", {
        variant: "info",
        autoHideDuration: 3000,
      });
      handleClose();
    } else {
      dispatch(updateUI({ openExtensionDialog: true }));
      handleClose();
    }
  }, [
    isCellSelected,
    cellReconciliated,
    dispatch,
    handleClose,
    enqueueSnackbar,
  ]);

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

  /**
   * Handle anonymize column action.
   */
  const handleAnonymize = useCallback(() => {
    // Find the pseudoanonymization service
    const pseudoService = extensionServices.find(
      (service) => service.id === "pseudoanonymization",
    );

    if (!pseudoService) {
      enqueueSnackbar("Pseudoanonymization service not available", {
        variant: "error",
        autoHideDuration: 3000,
      });
      handleClose();
      return;
    }

    // Call the extension with default form values (empty object)
    const req = dispatch(
      extend({
        extender: pseudoService,
        formValues: {},
      }),
    );

    req
      .unwrap()
      .then(({ data }) => {
        const nColumns = Object.keys(data.columns).length;
        const infoText = `Column anonymized - ${nColumns} ${
          nColumns > 1 ? "columns" : "column"
        } added`;
        enqueueSnackbar(infoText, {
          variant: "success",
          autoHideDuration: 3000,
        });
      })
      .catch((error) => {
        enqueueSnackbar("Failed to anonymize column", {
          variant: "error",
          autoHideDuration: 3000,
        });
        console.error("Anonymization error:", error);
      });

    handleClose();
  }, [extensionServices, dispatch, enqueueSnackbar, handleClose]);

  return (
    <MenuBase
      handleClose={handleClose}
      open={props.open}
      anchorElement={props.anchorElement}
      id={props.id}
      placement={props.placement}
    >
      <StyledMenuList
        autoFocus //className={classes.list}
      >
        <MenuItemIconLabel onClick={handleModify} Icon={EditRoundedIcon}>
          Modify column
        </MenuItemIconLabel>
        <MenuItemIconLabel onClick={handleReconcile} Icon={LinkRoundedIcon}>
          Reconcile column
        </MenuItemIconLabel>
        <MenuItemIconLabel onClick={handleExtend} Icon={AddRoundedIcon}>
          Extend column
        </MenuItemIconLabel>
        <MenuItemIconLabel onClick={handleAnonymize} Icon={SecurityIcon}>
          Anonymize
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={togglePinColumn}
          Icon={isPinned ? PushPinIcon : PushPinOutlinedIcon}
        >
          {isPinned ? "Unpin column" : "Pin column"}
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={handleHideColumn}
          Icon={VisibilityOffRoundedIcon}
        >
          Hide column
        </MenuItemIconLabel>
        <MenuItemIconLabel
          onClick={handleDeleteColumn}
          Icon={DeleteOutlineRoundedIcon}
        >
          Delete column
        </MenuItemIconLabel>
      </StyledMenuList>
    </MenuBase>
  );
};

export default ContextMenuColumn;
