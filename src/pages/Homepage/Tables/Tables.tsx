import { Tag } from '@components/core';
import deferMounting from '@components/HOC';
import { TableListView } from '@components/kit';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { ReadMoreRounded } from '@mui/icons-material';
import {
  Button, IconButton,
  LinearProgress, Stack
} from '@mui/material';
import { ID } from '@store/interfaces/store';
import { selectCurrentDatasetTables, selectGetTablesDatasetStatus } from '@store/slices/datasets/datasets.selectors';
import { getTablesByDataset } from '@store/slices/datasets/datasets.thunk';
import {
  FC, useCallback, useEffect
} from 'react';
import { Link, useParams } from 'react-router-dom';
import globalStyles from '@styles/globals.module.scss';
import { useTableCollection } from '../../../hooks/useTableCollection';

interface TablesProps {
  onSelectionChange: (state: { kind: 'dataset' | 'table', rows: any[] } | null) => void;
}

const DeferredTable = deferMounting(TableListView);

const Tables: FC<TablesProps> = ({
  onSelectionChange
}) => {
  const { columns, rows } = useTableCollection(selectCurrentDatasetTables);
  const { datasetId } = useParams<{ datasetId: ID }>();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectGetTablesDatasetStatus);

  useEffect(() => {
    dispatch(getTablesByDataset({ datasetId }));
  }, [datasetId]);

  const handleRowSelection = (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: 'table', rows: selectedRows });
    }
  };

  const Actions = useCallback(({ mediaMatch, row }) => {
    return (
      <Stack direction="row" gap="5px" className={globalStyles.Actions}>
        {mediaMatch ? (
          <IconButton
            color="primary"
            size="small"
            component={Link}
            to={`/datasets/${datasetId}/tables/${row.original.id}?view=table`}>
            <ReadMoreRounded />
          </IconButton>
        ) : (
          <Button
            size="small"
            component={Link}
            to={`/datasets/${datasetId}/tables/${row.original.id}?view=table`}
            endIcon={<ReadMoreRounded />}
            classes={{ endIcon: globalStyles.IconButton }}>
            Explore
          </Button>
        )}
      </Stack>
    );
  }, [datasetId]);

  return (
    <>
      {loading ? (
        <LinearProgress />
      ) : (
        <DeferredTable
          columns={columns}
          data={rows}
          Actions={Actions}
          onChangeRowSelected={handleRowSelection}
        />
      )}
    </>
  );
};

export default Tables;
