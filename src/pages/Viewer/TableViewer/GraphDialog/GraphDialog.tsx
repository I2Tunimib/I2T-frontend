import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { updateUI } from "@store/slices/table/table.slice";
import GraphViewer from "../../GraphViewer/GraphViewer";

interface GraphDialogProps {
  datasetId?: string;
  tableId?: string;
}

const GraphDialog: FC<GraphDialogProps> = ({ datasetId, tableId }) => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.table.ui.openGraphDialog);

  const handleClose = () => {
    dispatch(updateUI({ openGraphDialog: false }));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <DialogTitle sx={{ p: 0 }}>Schema Graph Visualization</DialogTitle>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </Stack>
      <DialogContent sx={{ height: '70vh', p: 0, overflow: 'hidden' }}>
        <GraphViewer datasetId={datasetId} tableId={tableId} isDialog={true} />
      </DialogContent>
    </Dialog>
  );
};

export default GraphDialog;
