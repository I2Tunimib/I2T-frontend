import deferMounting from '@components/HOC';
import TableListView from '@components/kit/TableListView/TableListView';
import TableGridView from '@components/kit/TableGridView/TableGridView';
import GraphSnapshotTaker from '@components/kit/GraphSnapshotTaker/GraphSnapshotTaker';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { ReadMoreRounded } from '@mui/icons-material';
import {
  Button,
  Box,
  CircularProgress,
  IconButton,
  LinearProgress,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import { ID } from '@store/interfaces/store';
import { selectCurrentDatasetTables, selectGetTablesDatasetStatus } from '@store/slices/datasets/datasets.selectors';
import { getTablesByDataset } from '@store/slices/datasets/datasets.thunk';
import {
  FC, useCallback, useEffect, useState, useMemo
} from 'react';
import { Link, useParams } from 'react-router-dom';
import globalStyles from '@styles/globals.module.scss';
import styles from "@components/kit/TableListView/TableListView.module.scss";
import { useTableCollection } from '../useTableCollection';

interface FooterProps {
  pageIndex: number;
  pageCount: number;
  gotoPage: (index: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

const Footer: FC<FooterProps> = ({
  pageIndex,
  pageCount,
  gotoPage,
  nextPage,
  previousPage
}) => {
  const handleChange = (event: any, page: number) => {
    gotoPage(page - 1);
  };

  return (
    <div className={styles.FooterContainer}>
      <Pagination
        onChange={handleChange}
        count={pageCount}
        page={pageIndex + 1}
        showFirstButton
        showLastButton />
    </div>
  );
};

interface TablesProps {
  onSelectionChange: (state: { kind: 'dataset' | 'table', rows: any[] } | null) => void;
  viewType: 'list' | 'card';
}

const DeferredTable = deferMounting(TableListView);

const Tables: FC<TablesProps> = ({
  onSelectionChange,
  viewType
}) => {
  const { columns, rows } = useTableCollection(selectCurrentDatasetTables);
  const { datasetId } = useParams<{ datasetId: ID }>();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectGetTablesDatasetStatus);
  const [snapshots, setSnapshots] = useState<Record<string, string>>({});

  const table = useReactTable({
    data: rows,
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 4 } }
  });

  useEffect(() => {
    dispatch(getTablesByDataset({ datasetId }));
  }, [datasetId]);

  useEffect(() => {
    onSelectionChange(null);
  }, [viewType]);

  const handleRowSelection = (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: 'table', rows: selectedRows });
    }
  };

  const handleSnapshotReady = (tableId: string, imgUrl: string) => {
    setSnapshots((prev) => ({ ...prev, [tableId]: imgUrl }));
  };

  const isGridReady = useMemo(() => {
    if (rows.length === 0) return true;
    return rows.every((table) => !!snapshots[table.id]);
  }, [rows, snapshots]);

  const Actions = useCallback(({ mediaMatch, row, targetView }) => {
    const viewMode = targetView || (viewType === 'card' ? 'graph' : 'table');
    return (
      <Stack direction="row" gap="5px" className={globalStyles.Actions}>
        {mediaMatch ? (
          <IconButton
            color="primary"
            size="small"
            component={Link}
            to={`/datasets/${datasetId}/tables/${row.original.id}?view=${viewMode}`}>
            <ReadMoreRounded />
          </IconButton>
        ) : (
          <Button
            size="small"
            component={Link}
            to={`/datasets/${datasetId}/tables/${row.original.id}?view=${viewMode}`}
            endIcon={<ReadMoreRounded />}
            classes={{ endIcon: globalStyles.IconButton }}>
            Explore
          </Button>
        )}
      </Stack>
    );
  }, [datasetId, viewType]);

  return (
    <>
      {loading ? (
        <LinearProgress />
      ) : viewType === 'list' ? (
        <DeferredTable
          columns={columns}
          data={rows}
          Actions={Actions}
          onChangeRowSelected={handleRowSelection}
        />
      ) : (
        <>
          {!isGridReady ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: 2
              }}
            >
              {rows.map((table) => {
                if (snapshots[table.id]) return null;
                return (
                  <GraphSnapshotTaker
                    key={table.id}
                    table={table}
                    onSnapshotReady={(imgUrl) => handleSnapshotReady(table.id, imgUrl)}
                  />
                );
              })}
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Fetching graph previews...
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
                gap="20px"
                padding="24px"
              >
                {table.getRowModel().rows.map((row) => (
                  <TableGridView
                    key={row.original.id}
                    table={row.original}
                    datasetId={datasetId}
                    graphSnapshot={snapshots[row.original.id]}
                    action={Actions({
                      mediaMatch: false,
                      row,
                      targetView: 'graph'
                    })}
                  />
                ))}
              </Box>
              <Footer
                pageIndex={table.getState().pagination.pageIndex}
                pageCount={table.getPageCount()}
                gotoPage={table.setPageIndex}
                nextPage={table.nextPage}
                previousPage={table.previousPage}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default Tables;
