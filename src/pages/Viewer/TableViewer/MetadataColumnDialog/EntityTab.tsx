import { StatusBadge } from '@components/core';
import deferMounting from '@components/HOC';
import CustomTable from '@components/kit/CustomTable/CustomTable';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import { selectAppConfig, selectReconciliatorsAsArray } from '@store/slices/config/config.selectors';
import { BaseMetadata, Column } from '@store/slices/table/interfaces/table';
import { selectColumnCellMetadataTableFormat, selectCurrentCol, selectIsViewOnly, selectReconcileRequestStatus, selectSettings } from '@store/slices/table/table.selectors';
import { updateColumnMetadata, updateUI } from '@store/slices/table/table.slice';
import { reconcile } from '@store/slices/table/table.thunk';
import { FC, useCallback, useEffect, useState } from 'react';
import { Cell } from 'react-table';
import { getCellComponent } from '../MetadataDialog/componentsConfig';
import usePrepareTable from '../MetadataDialog/usePrepareTable';

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
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const column = useAppSelector(selectCurrentCol);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

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
    dispatch(updateUI({ openMetadataColumnDialog: false }));
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

  const fetchMetadata = (service: string) => {
    const reconciliator = reconciliators.find((recon) => recon.prefix === service);
    if (reconciliator && column) {
      dispatch(reconcile({
        baseUrl: reconciliator.relativeUrl,
        items: [{
          id: column.id,
          label: column.label
        }],
        reconciliator,
        contextColumns: []
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

  const {
    lowerBound
  } = settings;

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
      <DeferredTable
        flexGrow={1}
        stickyHeaderTop="61.5px"
        columns={columns}
        data={data}
        loading={loading}
        onSelectedRowChange={handleSelectedRowChange}
        showRadio={!!API.ENDPOINTS.SAVE && !isViewOnly}
      />
    </>
  );
};

export default EntityTab;
