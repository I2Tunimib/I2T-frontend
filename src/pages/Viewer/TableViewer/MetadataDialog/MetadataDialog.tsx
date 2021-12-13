/* eslint-disable react/destructuring-assignment */
import {
  Box, Button, Dialog,
  Divider,
  FormControl, IconButton,
  InputLabel,
  MenuItem, Select,
  SelectChangeEvent,
  Stack, TextField, Tooltip,
  Typography
} from '@mui/material';
import {
  FC, useCallback, useEffect, useState
} from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  addCellMetadata, deleteCellMetadata, updateCellMetadata, updateUI
} from '@store/slices/table/table.slice';
import {
  selectCellMetadataTableFormat,
  selectCurrentCell,
  selectIsViewOnly,
  selectReconcileRequestStatus,
  selectSettings
} from '@store/slices/table/table.selectors';
import { selectAppConfig, selectReconciliatorsAsArray } from '@store/slices/config/config.selectors';
import { Controller, useForm } from 'react-hook-form';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { getCellContext } from '@store/slices/table/utils/table.reconciliation-utils';
import CustomTable from '@components/kit/CustomTable/CustomTable';
import deferMounting from '@components/HOC';
import { reconcile } from '@store/slices/table/table.thunk';
import { Cell } from 'react-table';
import { BaseMetadata, Cell as TableCell } from '@store/slices/table/interfaces/table';
import { StatusBadge } from '@components/core';
import usePrepareTable from './usePrepareTable';
import { getCellComponent } from './componentsConfig';

const DeferredTable = deferMounting(CustomTable);

const makeData = (rawData: ReturnType<typeof selectCellMetadataTableFormat>) => {
  if (rawData) {
    const { cell, service } = rawData;
    const { metaToView } = service;
    const { metadata } = cell;

    const columns = Object.keys(metaToView).map((key) => {
      const { label = key, type } = metaToView[key];
      return {
        Header: label,
        accessor: key,
        Cell: (cellValue: Cell<{}>) => getCellComponent(cellValue, type)
      };
    });

    const data = metadata.map((metadataItem) => {
      return Object.keys(metaToView).reduce((acc, key) => {
        const value = metadataItem[key as keyof BaseMetadata];
        if (value !== undefined) {
          acc[key] = value;
        } else {
          acc[key] = null;
        }

        return acc;
      }, {} as Record<string, any>);
    });

    return {
      columns,
      data
    };
  }
  return {
    columns: [],
    data: []
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
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

  const {
    lowerBound: {
      isScoreLowerBoundEnabled,
      scoreLowerBound
    }
  } = settings;

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
        const newData = dataState.map((item: any) => {
          if (item.id === row.id) {
            const match = !item.match;
            if (match) {
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
            match: false
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

  const getBadgeStatus = (cellItem: TableCell) => {
    const {
      annotationMeta: {
        match,
        highestScore
      }
    } = cellItem;

    if (match) {
      return 'Success';
    }
    if (isScoreLowerBoundEnabled) {
      if (scoreLowerBound && highestScore < scoreLowerBound) {
        return 'Error';
      }
    }
    return 'Warn';
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

  return cell ? (
    <Dialog
      maxWidth="lg"
      open={open}
      onClose={handleCancel}>
      <Stack height="100%" minHeight="600px">
        <Stack direction="row" gap="10px" alignItems="center" padding="12px 16px">
          <Stack direction="row" alignItems="center" gap={1}>
            {cell.annotationMeta && cell.annotationMeta.annotated
              && (
                <StatusBadge
                  status={getBadgeStatus(cell)}
                />
              )
            }
            <Typography variant="h5">
              {cell?.label}
            </Typography>
            <Typography color="textSecondary">
              (Cell label)
            </Typography>
          </Stack>
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
        <Divider orientation="horizontal" flexItem />
        <Box paddingLeft="16px" paddingBottom="12px" marginTop="20px">
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
  ) : null;
};

export default MetadataDialog;
