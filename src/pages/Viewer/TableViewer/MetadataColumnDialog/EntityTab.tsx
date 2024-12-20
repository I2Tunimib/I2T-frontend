import { StatusBadge } from '@components/core';
import deferMounting from '@components/HOC';
import CustomTable from '@components/kit/CustomTable/CustomTable';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Box, Button, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { selectAppConfig, selectReconciliatorsAsArray } from '@store/slices/config/config.selectors';
import { BaseMetadata, Column } from '@store/slices/table/interfaces/table';
import { selectColumnCellMetadataTableFormat, selectCurrentCol, selectIsViewOnly, selectReconcileRequestStatus, selectSettings } from '@store/slices/table/table.selectors';
import { addCellMetadata, addColumnMetadata, updateColumnMetadata, undo, updateUI } from '@store/slices/table/table.slice';
import { reconcile } from '@store/slices/table/table.thunk';
import { getCellContext } from '@store/slices/table/utils/table.reconciliation-utils';
import { FC, useCallback, useEffect, useState } from 'react';
import { Controller, FormState, useForm } from 'react-hook-form';
import { Cell } from 'react-table';
import { getCellComponent } from '../MetadataDialog/componentsConfig';
import usePrepareTable from '../MetadataDialog/usePrepareTable';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

const DeferredTable = deferMounting(CustomTable);

const makeData = (rawData: ReturnType<typeof selectColumnCellMetadataTableFormat>) => {
  if (!rawData) {
    return {
      columns: [],
      data: []
    };
  }

  const { column, service } = rawData;
  if (!service) {
    return {
      columns: [],
      data: []
    };
  }
  const { metaToView } = service;

  if (!column.metadata || !column.metadata[0].entity) {
    return {
      columns: [],
      data: []
    };
  }

  const { entity: metadata } = column.metadata[0];

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
};

const hasColumnMetadata = (column: Column | undefined) => {
  return !!(column && column.metadata.length > 0
    && column.metadata[0].entity
    && column.metadata[0].entity.length > 0);
};

// const getBadgeStatus = (column: Column | undefined) => {
//   if (column) {
//     if (column.metadata[0].entity) {
//       const matching = column.metadata[0].entity.some((meta: BaseMetadata) => meta.match);
//       if (matching) {
//         return 'Success';
//       }
//     }
//   }
//   return 'Warn';
// };
interface NewMetadata {
  id: string;
  name: string;
  score: number;
  match: string;
  uri?: string;
}

const EntityTab: FC<{}> = () => {
  const {
    setState,
    memoizedState: {
      columns,
      data
    }
  } = usePrepareTable({ selector: selectColumnCellMetadataTableFormat, makeData });
  const [selectedMetadata, setSelectedMetadata] = useState<string>('');
  const [currentService, setCurrentService] = useState<string>();
  const [undoSteps, setUndoSteps] = useState(0);
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const column = useAppSelector(selectCurrentCol);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const {
    handleSubmit, reset,
    register, control
  } = useForm<NewMetadata>({
    defaultValues: {
      score: 0,
      match: 'false'
    }
  });

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0].prefix);
    }
  }, [reconciliators]);

  const handleConfirm = () => {
    // update global state if confirmed
    if (column) {
      if (column.metadata && column.metadata.length > 0 && column.metadata[0].entity) {
        const { entity } = column.metadata[0];
        const previousMatch = entity.find((meta) => meta.match);
        if (!previousMatch || (previousMatch.id !== selectedMetadata)) {
          dispatch(updateColumnMetadata({ metadataId: selectedMetadata, colId: column.id }));
          dispatch(updateUI({ openMetadataColumnDialog: false }));
        }
      }
    }
  };

  const handleCancel = () => {
    dispatch(undo(undoSteps));
    dispatch(updateUI({ openMetadataColumnDialog: false }));
  };

  const handleSelectedRowDelete = useCallback((row: any) => {
  }, []);

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

  const fetchMetadata = (service: string) => {
    const reconciliator = reconciliators.find((recon) => recon.prefix === service);
    if (reconciliator && column) {
      // dispatch(reconcile({
      //   baseUrl: reconciliator.relativeUrl,
      //   items: [{
      //     id: column.id,
      //     label: column.label
      //   }],
      //   reconciliator,
      //   contextColumns: []
      // }));
    }
  };

  const handleChangeService = (event: SelectChangeEvent<string>) => {
    const newService = event.target.value;
    if (newService) {
      setCurrentService(newService);
      fetchMetadata(newService);
    }
  };

  const {
    lowerBound
  } = settings;

  const onSubmitNewMetadata = (formState: NewMetadata) => {
    if (column) {
      if (column.metadata /*&& column.metadata.length > 0 && column.metadata[0].entity*/) {
        /*const { entity } = column.metadata[0];
        const previousMatch = entity.find((meta) => meta.match);
        if (!previousMatch || (previousMatch.id !== selectedMetadata)) {*/
        //dispatch(updateColumnMetadata({ metadataId: selectedMetadata, colId: column.id }));
        //dispatch(updateUI({ openMetadataColumnDialog: false }));
        dispatch(addColumnMetadata({
          colId: column.id,
          type: 'entity',
          prefix: getCellContext(column),
          value: { ...formState }
        }));
        setUndoSteps(undoSteps + 1);
        reset();
        setShowAdd(false);
        //}
      }
    }

    /*if (cell) {
      dispatch(addCellMetadata({
        cellId: cell.id,
        prefix: getCellContext(cell),
        value: { ...formState }
      }));
      reset();
      setShowAdd(false);
    }*/
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

  const getBadgeStatus = useCallback((col: Column) => {
    const {
      annotationMeta: {
        match,
        highestScore
      }
    } = col;

    if (match.value) {
      switch (match.reason) {
        case 'manual':
          return 'match-manual';
        case 'reconciliator':
          return 'match-reconciliator';
        case 'refinement':
          return 'match-refinement';
        default:
          return 'match-reconciliator';
      }
    }

    const {
      isScoreLowerBoundEnabled,
      scoreLowerBound
    } = lowerBound;

    if (isScoreLowerBoundEnabled) {
      if (scoreLowerBound && highestScore < scoreLowerBound) {
        return 'miss';
      }
    }
    return 'warn';
  }, [lowerBound]);

  return (
    <>
      <Stack position="sticky" top="0" zIndex={10} bgcolor="#FFF">
        <Stack direction="row" gap="10px" alignItems="center" padding="12px 16px">
          <Stack direction="row" alignItems="center" gap={1}>
            {column && column.annotationMeta && column.annotationMeta.annotated && (
              <StatusBadge status={getBadgeStatus(column)} />
            )}
            <Typography variant="h5">
              {column?.label}
            </Typography>
            <Typography color="textSecondary">
              (Cell label)
            </Typography>
          </Stack>
          <Stack direction="row" marginLeft="auto" gap="10px">
            <Button onClick={handleCancel}>
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
      </Stack>
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
      {(/*data.length > 0 && */API.ENDPOINTS.SAVE && !isViewOnly) && (
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
              <Tooltip title="Enter a complete id, like wd:Q215627" arrow placement="top">
                <TextField
                  sx={{ minWidth: '200px' }}
                  size="small"
                  label="Id"
                  variant="outlined"
                  required
                  placeholder="wd:"
                  {...register('id')} />
              </Tooltip>
              <Tooltip title="Enter a name, like person" arrow placement="top">
                <TextField
                  sx={{ minWidth: '200px' }}
                  size="small"
                  label="Name"
                  variant="outlined"
                  required
                  {...register('name')} />
              </Tooltip>
              <TextField
                sx={{ minWidth: '200px' }}
                size="small"
                label="Uri"
                variant="outlined"
                {...register('uri')} />
              <Tooltip title="Enter the score value, from 0.00 to 1.00" arrow placement="top">
                <TextField
                  sx={{ minWidth: '200px' }}
                  size="small"
                  label="Score"
                  variant="outlined"
                  required
                  {...register('score')} />
              </Tooltip>
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
        stickyHeaderTop="61.5px"
        columns={columns}
        data={data}
        loading={loading}
        onSelectedRowChange={handleSelectedRowChange}
        onSelectedRowDeleteRequest={handleSelectedRowDelete}
        showRadio={!!API.ENDPOINTS.SAVE && !isViewOnly}
      />
    </>
  );
};

export default EntityTab;
