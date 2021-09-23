import { useAppDispatch } from '@hooks/store';
import {
  Dialog, DialogTitle,
  Typography, DialogContentText, DialogContent
} from '@material-ui/core';
import { updateUI } from '@store/slices/tables/tables.slice';
import { getChallengeDatasets } from '@store/slices/tables/tables.thunk';
import { useEffect, FC } from 'react';

interface LoadChallengeTableDialogProps {
  open: boolean;
}

const LoadChallengeTableDialog: FC<LoadChallengeTableDialogProps> = ({
  open
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getChallengeDatasets())
      .unwrap()
      .then((res) => {
        console.log(res);
      });
  }, []);

  const handleClose = () => {
    dispatch(updateUI({
      challengeDialogOpen: false
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}>
      <DialogTitle disableTypography>
        <Typography variant="h6">Load challenge table</Typography>
      </DialogTitle>
      {/* <DialogContent>

      </DialogContent> */}
    </Dialog>
  );
};

export default LoadChallengeTableDialog;
