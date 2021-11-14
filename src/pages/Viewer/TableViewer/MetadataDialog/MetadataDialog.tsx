import {
  Box, Button, Dialog,
  FormControl, IconButton,
  InputLabel,
  Link, MenuItem, Select,
  SelectChangeEvent, Skeleton,
  Stack, TextField, Tooltip,
  Typography
} from '@mui/material';
import {
  FC,
  forwardRef, ReactElement, Ref, useCallback, useEffect, useMemo, useState
} from 'react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  addCellMetadata, deleteCellMetadata, updateCellMetadata, updateUI
} from '@store/slices/table/table.slice';
import {
  selectCellMetadataTableFormat,
  selectCurrentCell,
  selectIsViewOnly,
  selectMetadataDialogStatus,
  selectReconcileRequestStatus
} from '@store/slices/table/table.selectors';
import { selectAppConfig, selectReconciliatorsAsArray } from '@store/slices/config/config.selectors';
import { Tag } from '@components/core';
import { Controller, useForm } from 'react-hook-form';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { getCellContext } from '@store/slices/table/utils/table.reconciliation-utils';
import CustomTable from '@components/kit/CustomTable/CustomTable';
import deferMounting from '@components/HOC';
import { reconcile } from '@store/slices/table/table.thunk';
import styles from './MetadataDialog.module.scss';
import usePrepareTable from './usePrepareTable';

const DeferredTable = deferMounting(CustomTable);

const LabelCell = ({ value }: any) => {
  const { label, link } = value;

  return (
    <Link onClick={(event) => event.stopPropagation()} title={label} href={link} target="_blank">{label}</Link>
  );
};

const MatchCell = ({ value }: any) => {
  return (
    <Tag size="medium" status={value === 'true' ? 'done' : 'doing'}>
      {value}
    </Tag>
  );
};

const makeData = ({ columns, data }: { columns: any[], data: any[] }) => {
  const cols = columns.map((col) => {
    if (col.accessor === 'name') {
      return {
        ...col,
        Cell: LabelCell
      };
    }
    if (col.accessor === 'match') {
      return {
        ...col,
        Cell: MatchCell
      };
    }
    return col;
  });

  return {
    columns: cols,
    data
  };
};

type MetadataDialogProps = {
  open: boolean;
}

interface FormState {
  id: string;
  name: string;
  score: number;
  match: string;
}

const MetadataDialog: FC<MetadataDialogProps> = ({ open }) => {
  const {
    setState,
    memoizedState: {
      columns,
      data
    }
  } = usePrepareTable({ selector: selectCellMetadataTableFormat, makeData });
  const [currentService, setCurrentService] = useState<string>();
  const [selectedMetadata, setSelectedMetadata] = useState<string>('');
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const {
    handleSubmit, reset,
    register, control
  } = useForm<FormState>({
    defaultValues: {
      score: 0,
      match: 'false'
    }
  });
  const { API } = useAppSelector(selectAppConfig);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const cell = useAppSelector(selectCurrentCell);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0].prefix);
    }
  }, [reconciliators]);

  const handleClose = () => {
    setShowAdd(false);
    setShowTooltip(false);
    dispatch(updateUI({
      openMetadataDialog: false
    }));
  };

  const handleCancel = () => {
    // set to inital state if canceled
    handleClose();
  };

  const handleConfirm = () => {
    // update global state if confirmed
    if (cell) {
      const previousMatch = cell.metadata.find((meta) => meta.match);
      if (!previousMatch || (previousMatch.id !== selectedMetadata)) {
        dispatch(updateCellMetadata({ metadataId: selectedMetadata, cellId: cell.id }));
      }
    }
    handleClose();
  };

  const handleSelectedRowChange = useCallback((row: any) => {
    if (row) {
      setState(({ columns: colState, data: dataState }) => {
        const newData = dataState.map((item) => {
          if (item.id === row.id) {
            const match = item.match === 'true' ? 'false' : 'true';
            if (match === 'true') {
              setSelectedMetadata(row.id);
            } else {
              setSelectedMetadata('');
            }
            return {
              ...item,
              match
            };
          }
          return {
            ...item,
            match: 'false'
          };
        });

        return {
          columns: colState,
          data: newData
        };
      });
    }
  }, []);

  const handleDeleteRow = ({ original }: any) => {
    if (cell) {
      dispatch(deleteCellMetadata({
        cellId: cell.id,
        metadataId: original.id.label
      }));
    }
  };

  const onSubmitNewMetadata = (formState: FormState) => {
    if (cell) {
      dispatch(addCellMetadata({
        cellId: cell.id,
        prefix: getCellContext(cell),
        value: { ...formState }
      }));
      reset();
      setShowAdd(false);
    }
  };

  const handleTooltipOpen = () => {
    setShowTooltip(!showAdd);
  };

  const handleTooltipClose = () => {
    setShowTooltip(false);
  };

  const handleShowAdd = () => {
    setShowAdd(!showAdd);
    setShowTooltip(false);
  };

  const fetchMetadata = (service: string) => {
    const reconciliator = reconciliators.find((recon) => recon.prefix === service);
    if (reconciliator && cell) {
      dispatch(reconcile({
        baseUrl: reconciliator.relativeUrl,
        items: [{
          id: cell.id,
          label: cell.label
        }],
        reconciliator
      }));
    }
  };

  const handleChangeService = (event: SelectChangeEvent<string>) => {
    const newService = event.target.value;
    if (newService) {
      setCurrentService(newService);
      fetchMetadata(newService);
    }
  };

  return (
    <Dialog
      maxWidth="lg"
      open={open}
      onClose={handleCancel}>
      <Stack height="100%">
        <Stack direction="row" gap="10px" alignItems="center" padding="12px 16px">
          <Typography variant="h4">
            Metadata
          </Typography>
          <Typography color="textSecondary">
            {`(Cell value: ${cell?.label})`}
          </Typography>
          <Stack direction="row" marginLeft="auto" gap="10px">
            <Button onClick={handleClose}>
              {(API.ENDPOINTS.SAVE && !isViewOnly) ? 'Cancel' : 'Close'}
            </Button>
            {(API.ENDPOINTS.SAVE && !isViewOnly)
              && (
                <Button
                  onClick={handleConfirm}
                  variant="outlined">
                  Confirm
                </Button>
              )
            }
          </Stack>
        </Stack>
        <Box paddingLeft="16px" paddingBottom="12px">
          {currentService && (
            <FormControl
              sx={{
                maxWidth: '200px'
              }}
              fullWidth
              size="small">
              <InputLabel variant="outlined" htmlFor="uncontrolled-native">
                Reconciliator service
              </InputLabel>
              <Select
                label="Reconciliator service"
                value={currentService}
                onChange={(e) => handleChangeService(e)}
                variant="outlined"
              >
                {reconciliators && reconciliators.map((reconciliator) => (
                  <MenuItem key={reconciliator.prefix} value={reconciliator.prefix}>
                    {reconciliator.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        {(data.length > 0 && API.ENDPOINTS.SAVE && !isViewOnly) && (
          <Stack
            position="relative"
            direction="row"
            alignItems="center"
            alignSelf="flex-start"
            padding="0px 12px">
            <Tooltip open={showTooltip} title="Add metadata" placement="right">
              <IconButton
                color="primary"
                onMouseLeave={handleTooltipClose}
                onMouseEnter={handleTooltipOpen}
                onClick={handleShowAdd}>
                <AddRoundedIcon sx={{
                  transition: 'transform 150ms ease-out',
                  transform: showAdd ? 'rotate(45deg)' : 'rotate(0)'
                }} />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                padding: '12px 16px',
                borderRadius: '6px',
                transition: 'all 150ms ease-out',
                opacity: showAdd ? 1 : 0,
                transform: showAdd ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-20px)'
              }}>
              <Stack
                component="form"
                direction="row"
                gap="10px"
                onSubmit={handleSubmit(onSubmitNewMetadata)}>
                <TextField
                  sx={{ minWidth: '200px' }}
                  size="small"
                  label="Id"
                  variant="outlined"
                  {...register('id')} />
                <TextField
                  sx={{ minWidth: '200px' }}
                  size="small"
                  label="Name"
                  variant="outlined"
                  {...register('name')} />
                <TextField
                  sx={{ minWidth: '200px' }}
                  size="small"
                  label="Score"
                  variant="outlined"
                  {...register('score')} />
                <FormControl size="small" sx={{ width: '200px' }}>
                  <InputLabel>Match</InputLabel>
                  <Controller
                    render={({ field }) => (
                      <Select {...field} labelId="select-match" label="Match">
                        <MenuItem value="true">
                          true
                        </MenuItem>
                        <MenuItem value="false">
                          false
                        </MenuItem>
                      </Select>
                    )}
                    name="match"
                    control={control}
                  />
                </FormControl>
                <Button type="submit" size="small" sx={{ textTransform: 'none' }}>Add</Button>
              </Stack>
            </Box>
          </Stack>
        )}
        <DeferredTable
          flexGrow={1}
          columns={columns}
          data={data}
          loading={loading}
          onSelectedRowChange={handleSelectedRowChange}
          showRadio={!!API.ENDPOINTS.SAVE && !isViewOnly}
        />
      </Stack>
    </Dialog>
  );
};

export default MetadataDialog;
