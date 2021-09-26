import { ButtonLoading } from '@components/core';
import { ButtonShortcut } from '@components/kit';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  Dialog, DialogTitle,
  Typography, DialogContentText,
  DialogContent, TextField,
  MenuItem, DialogActions,
  Button, withStyles, makeStyles
} from '@material-ui/core';
import { ChallengeTableDataset } from '@services/api/table';
import { updateUI } from '@store/slices/tables/tables.slice';
import { getChallengeDatasets } from '@store/slices/tables/tables.thunk';
import { useEffect, FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import TimeAgo from 'react-timeago';
import formatBytes from '@services/utils/format-bytes';
import { getChallengeTable } from '@store/slices/table/table.thunk';
import { useHistory } from 'react-router-dom';
import { selectGetChallengeTableStatus } from '@store/slices/table/table.selectors';
import styles from './LoadChallengeTableDialog.module.scss';

interface LoadChallengeTableDialogProps {
  open: boolean;
}

interface FormState {
  dataset: string;
  table: string;
}

const useClasses = makeStyles(() => ({
  root: {
    transition: 'none !important'
  }
}));

const LoadChallengeTableDialog: FC<LoadChallengeTableDialogProps> = ({
  open
}) => {
  const [datasets, setDatasets] = useState<ChallengeTableDataset[]>([]);
  const [currentTablesIndex, setCurrentTablesIndex] = useState<number>(0);
  const { handleSubmit, watch, register } = useForm<FormState>();
  const { loading } = useAppSelector(selectGetChallengeTableStatus);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const classes = useClasses();

  const watchDataset = watch('dataset');

  useEffect(() => {
    if (open && datasets.length === 0) {
      dispatch(getChallengeDatasets())
        .unwrap()
        .then((res) => {
          setDatasets(res);
        });
    }
  }, [open, setDatasets]);

  useEffect(() => {
    const index = datasets.findIndex(({ name }) => name === watchDataset);
    if (index !== -1) {
      setCurrentTablesIndex(index);
    }
  }, [watchDataset]);

  const handleClose = () => {
    dispatch(updateUI({
      challengeDialogOpen: false
    }));
  };

  const onSubmit = ({ dataset, table }: FormState) => {
    dispatch(getChallengeTable({
      datasetName: dataset,
      tableName: table
    }))
      .unwrap()
      .then((res) => {
        history.push(`/table/${res.id}`);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}>
      <DialogTitle disableTypography>
        <Typography variant="h6">Load challenge table</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {datasets.length > 0 && (
            <div className={styles.FormContent}>
              <TextField
                fullWidth
                label="Dataset"
                size="small"
                variant="outlined"
                defaultValue={datasets[0].name}
                select
                {...register('dataset')}
              >
                {datasets.map(({ name }) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </TextField>
              {currentTablesIndex > -1 && (
                <TextField
                  fullWidth
                  SelectProps={{
                    MenuProps: {
                      classes: {
                        paper: classes.root
                      }
                    }
                  }}
                  label="Table"
                  size="small"
                  variant="outlined"
                  defaultValue={datasets[currentTablesIndex].tables[0].fileName}
                  select
                  {...register('table')}
                >
                  {datasets[currentTablesIndex].tables.map((table) => (
                    <MenuItem
                      key={table.fileName}
                      value={table.fileName}>
                      <div className={styles.MenuItemContent}>
                        <div>{table.fileName}</div>
                        <Typography variant="caption" color="textSecondary">
                          <>
                            Modified:
                          </>
                          <TimeAgo title="" date={table.ctime} />
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {`Size: ${formatBytes(table.size, 1)}`}
                        </Typography>
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <ButtonLoading type="submit" loading={!!loading}>
            Confirm
          </ButtonLoading>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoadChallengeTableDialog;
