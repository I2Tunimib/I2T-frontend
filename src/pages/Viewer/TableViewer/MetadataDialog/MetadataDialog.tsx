import {
  Box, Button, Dialog, Drawer, IconButton, Link, Skeleton, Stack, TextField, Tooltip, Typography
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
  selectMetadataDialogStatus
} from '@store/slices/table/table.selectors';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import { Tag } from '@components/core';
import { useForm } from 'react-hook-form';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { getCellContext } from '@store/slices/table/utils/table.reconciliation-utils';
import CustomTable from '@components/kit/CustomTable/CustomTable';
import deferMounting from '@components/HOC';
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
}

const MetadataDialog: FC<MetadataDialogProps> = ({ open }) => {
  const {
    setState,
    memoizedState: {
      columns,
      data
    }
  } = usePrepareTable({ selector: selectCellMetadataTableFormat, makeData });
  const [selectedMetadata, setSelectedMetadata] = useState<string>('');
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const { handleSubmit, reset, register } = useForm<FormState>();
  const cell = useAppSelector(selectCurrentCell);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const { API } = useAppSelector(selectAppConfig);
  const dispatch = useAppDispatch();

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
    // if (row) {
    //   setSelectedMetadata(row.id);
    // } else {
    //   setSelectedMetadata('');
    // }
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
              {(API.ENDPOINTS.SAVE && !isViewOnly) ? 'Cancel' : 'Close' }
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
              <Button type="submit" size="small" sx={{ textTransform: 'none' }}>Add</Button>
            </Stack>
          </Box>
        </Stack>
        )}
        <DeferredTable
          flexGrow={1}
          columns={columns}
          data={data}
          onSelectedRowChange={handleSelectedRowChange}
          showRadio={!!API.ENDPOINTS.SAVE && !isViewOnly}
        />
      </Stack>
    </Dialog>
  );
};

export default MetadataDialog;
