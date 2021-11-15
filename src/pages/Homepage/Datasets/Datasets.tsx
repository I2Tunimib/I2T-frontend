import { Battery, DotLoading, Tag } from '@components/core';
import { TableListView } from '@components/kit';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectDatasets } from '@store/slices/datasets/datasets.selectors';
import { setCurrentDataset } from '@store/slices/datasets/datasets.slice';
import { DatasetInstance } from '@store/slices/datasets/interfaces/datasets';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import {
  FC, useEffect,
  useMemo, useState,
  useCallback
} from 'react';
import {
  Link, useRouteMatch
} from 'react-router-dom';
import { Cell } from 'react-table';
import {
  Button, IconButton,
  Stack
} from '@mui/material';
import { ReadMoreRounded } from '@mui/icons-material';
import deferMounting from '@components/HOC';
import globalStyles from '@styles/globals.module.scss';
import { getDataset } from '@store/slices/datasets/datasets.thunk';
import { useTableCollection } from '../useTableCollection';

interface DatasetsProps {
  onSelectionChange: (state: { kind: 'dataset' | 'table', rows: any[] } | null) => void;
}

const DeferredTable = deferMounting(TableListView);

const Datasets: FC<DatasetsProps> = ({
  onSelectionChange
}) => {
  const { columns, rows } = useTableCollection(selectDatasets);
  const { path, url } = useRouteMatch();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentDataset(''));
  }, []);

  const handleRowSelection = (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: 'dataset', rows: selectedRows });
    }
  };

  const Actions = useCallback(({ mediaMatch, row }) => {
    return (
      <Stack direction="row" gap="8px" className={globalStyles.Actions}>
        {mediaMatch ? (
          <IconButton
            color="primary"
            size="small"
            component={Link}
            to={`${url}/${row.original.id}/tables`}>
            <ReadMoreRounded />
          </IconButton>
        ) : (
          <Button
            size="small"
            component={Link}
            to={`${url}/${row.original.id}/tables`}
            endIcon={<ReadMoreRounded />}
            classes={{ endIcon: globalStyles.IconButton }}
          >
            Explore
          </Button>
        )}
      </Stack>
    );
  }, []);

  return (
    <DeferredTable
      columns={columns}
      data={rows}
      Actions={Actions}
      Icon={<FolderRoundedIcon color="action" />}
      onChangeRowSelected={handleRowSelection}
    />
  );
};

export default Datasets;
