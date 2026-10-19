import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useDatasetAcl } from "@hooks/acl";
import { useAppSelector } from "@hooks/store";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import AclMembers from "../AclMembers/AclMembers";

type Props = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
  onChange?: () => void;
};

const DatasetAclDialog: FC<Props> = ({
  open,
  onClose,
  datasetId,
  onChange,
}) => {
  const currentUserId = useAppSelector(selectIsLoggedIn).user?.id;
  const acl = useDatasetAcl({ open, datasetId, onChange });
  const { acl: dataset } = acl;
  const isOwner = Boolean(
    dataset && String(dataset.userId) === String(currentUserId),
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography>Dataset access control</Typography>
        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh" }}>
        {!dataset ? (
          <div>Loading...</div>
        ) : (
          <Stack gap={2}>
            <Typography variant="body2" color="text.secondary">
              This dataset is accessible only to its owner and the users listed
              below.
              {!isOwner && " Only the owner can modify access control."}
            </Typography>
            <Divider />
            <AclMembers acl={acl} isOwner={isOwner} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatasetAclDialog;
