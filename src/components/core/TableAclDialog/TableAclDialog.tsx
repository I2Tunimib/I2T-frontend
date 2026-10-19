import React, { FC } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTableAcl } from "@hooks/acl";
import { useAppSelector } from "@hooks/store";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import AclMembers from "../AclMembers/AclMembers";

type Props = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
  tableId: string;
  onChange?: () => void;
};

const TableAclDialog: FC<Props> = ({
  open,
  onClose,
  datasetId,
  tableId,
  onChange,
}) => {
  const currentUserId = useAppSelector(selectIsLoggedIn).user?.id;
  const acl = useTableAcl({ open, datasetId, tableId, onChange });
  const { acl: tableAcl, visibility, changeVisibility } = acl;
  const isOwner = Boolean(
    tableAcl && String(tableAcl.datasetOwnerId) === String(currentUserId),
  );

  const handleClose = () => {
    acl.notifyIfDirty();
    onClose();
  };

  const effectiveLabel =
    visibility === "restricted"
      ? "Restricted — only the dataset owner and the users listed below can access this table. Dataset viewers/editors do not get access automatically."
      : "Inheriting from dataset — this table follows the dataset's viewers and editors.";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography>Table access control</Typography>
        <IconButton onClick={handleClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh" }}>
        {!tableAcl ? (
          <div>Loading...</div>
        ) : (
          <Stack gap={2}>
            <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ py: 0.5 }}>
              {effectiveLabel}
            </Alert>
            <div>
              <Typography variant="subtitle1">Table access</Typography>
              {!isOwner && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Only the dataset owner can modify table access control
                </Typography>
              )}
              <FormControl component="fieldset" disabled={!isOwner}>
                <RadioGroup
                  value={visibility === "restricted" ? "restricted" : "inherit"}
                  onChange={(_, v) =>
                    changeVisibility(v === "restricted" ? "restricted" : null)
                  }
                >
                  <FormControlLabel
                    value="inherit"
                    control={<Radio />}
                    label="Inherit from dataset (follows the dataset's viewers/editors)"
                  />
                  <FormControlLabel
                    value="restricted"
                    control={<Radio />}
                    label="Restricted (only owner + explicitly listed users can access)"
                  />
                </RadioGroup>
              </FormControl>
            </div>

            {visibility === "restricted" && (
              <>
                <Divider />
                <AclMembers acl={acl} isOwner={isOwner} />
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableAclDialog;
