import deferMounting from "@components/HOC";
import TableListView from "@components/kit/TableListView/TableListView";
import TableGridView from "@components/kit/TableGridView/TableGridView";
import GraphSnapshotTaker from "@components/kit/GraphSnapshotTaker/GraphSnapshotTaker";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  ReadMoreRounded,
  AssignmentTurnedInOutlined,
  AccountTreeRounded,
  LockOutlined,
  LockOpenOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import { updateUI } from "@store/slices/table/table.slice";
import { getTable, getDependencies } from "@store/slices/table/table.thunk";
import { selectComplianceDialogStatus } from "@store/slices/table/table.selectors";
import ComplianceDialog from "@pages/Viewer/TableViewer/ComplianceDialog";
import GraphDialog from '@pages/Viewer/TableViewer/GraphDialog';
import DependenciesPanel from "@pages/Viewer/TableViewer/DependenciesPanel";
import {
  Button,
  Box,
  CircularProgress,
  IconButton,
  LinearProgress,
  Pagination,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { ID } from '@store/interfaces/store';
import {
  selectCurrentDatasetTables,
  selectGetTablesDatasetStatus,
  selectDatasets,
} from "@store/slices/datasets/datasets.selectors";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import { getTablesByDataset } from "@store/slices/datasets/datasets.thunk";
import { FC, useCallback, useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import globalStyles from "@styles/globals.module.scss";
import styles from "@components/kit/TableListView/TableListView.module.scss";
import { useTableCollection } from "../useTableCollection";
import W3CViewer from "../../Viewer/W3CViewer/W3CViewer";

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
  previousPage,
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
        showLastButton
      />
    </div>
  );
};

interface TablesProps {
  onSelectionChange: (
    state: { kind: "dataset" | "table"; rows: any[] } | null,
  ) => void;
  viewType: "list" | "grid" | "raw";
}

const DeferredTable = deferMounting(TableListView);

const Tables: FC<TablesProps> = ({ onSelectionChange, viewType }) => {
  const { columns, rows } = useTableCollection(selectCurrentDatasetTables);
  const { datasetId } = useParams<{ datasetId: ID }>();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectGetTablesDatasetStatus);
  const [snapshots, setSnapshots] = useState<Record<string, string>>({});
  const [selectedTableId, setSelectedTableId] = useState<string | undefined>(
    undefined,
  );
  const [isLoadingTableData, setIsLoadingTableData] = useState(false);
  const [isDependenciesPanelOpen, setIsDependenciesPanelOpen] = useState(false);
  const [isLoadingDeps, setIsLoadingDeps] = useState(false);
  const [highlightedTableId, setHighlightedTableId] = useState<
    string | undefined
  >(undefined);
  const isComplianceOpen = useAppSelector(selectComplianceDialogStatus);

  useEffect(() => {
    if (!isComplianceOpen && !isDependenciesPanelOpen) {
      setHighlightedTableId(undefined);
    }
  }, [isComplianceOpen, isDependenciesPanelOpen]);

  const table = useReactTable({
    data: rows,
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 4 } },
  });

  const auth = useAppSelector(selectIsLoggedIn);
  const currentUserId = auth?.user?.id;

  // Get current dataset to check ownership
  const { rows: datasetRows } = useTableCollection(selectDatasets);
  const currentDataset = datasetRows.find(
    (r: any) => String(r.id) === String(datasetId),
  );
  const isDatasetOwner =
    currentUserId !== undefined &&
    currentDataset !== undefined &&
    String(currentUserId) === String((currentDataset as any).userId);
  const datasetVisibility: "private" | "public" | undefined = (
    currentDataset as any
  )?.visibility;

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
      onSelectionChange({ kind: "table", rows: selectedRows });
    }
  };

  const handleSnapshotReady = (tableId: string, imgUrl: string) => {
    setSnapshots((prev) => ({ ...prev, [tableId]: imgUrl }));
  };

  const isGridReady = useMemo(() => {
    if (rows.length === 0) return true;
    return rows.every((t) => !!snapshots[t.id]);
  }, [rows, snapshots]);

  const getTablePermission = useCallback(
    (tableRow: any): "rw" | "ro" => {
      if (isDatasetOwner) return "rw";
      if (currentUserId) {
        const uid = String(currentUserId);
        const tableEditors: string[] = tableRow?.editors?.map(String) ?? [];
        const tableViewers: string[] = tableRow?.viewers?.map(String) ?? [];
        if (tableEditors.includes(uid)) return "rw";
        if (tableViewers.includes(uid)) return "ro";
        const datasetEditors: string[] =
          (currentDataset as any)?.editors?.map(String) ?? [];
        const datasetViewers: string[] =
          (currentDataset as any)?.viewers?.map(String) ?? [];
        if (datasetEditors.includes(uid)) return "rw";
        if (datasetViewers.includes(uid)) return "ro";
      }
      return "ro";
    },
    [isDatasetOwner, currentUserId, currentDataset],
  );

  const rowPropGetter = useCallback(
    (row: any) => {
      if (String(row.original?.id) === String(highlightedTableId)) {
        return { style: { backgroundColor: "rgba(25, 118, 210, 0.08)" } };
      }
      return {};
    },
    [highlightedTableId],
  );

  const Actions = useCallback(
    ({ mediaMatch, row, targetView }) => {
      const viewMode = targetView || (viewType === "grid" ? "graph" : "table");
      const perm = getTablePermission(row.original);
      return (
        <Stack
          direction="row"
          gap="5px"
          alignItems="center"
          className={globalStyles.Actions}
        >
          <Tooltip title={perm === "rw" ? "Read & Write" : "Read Only"}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: perm === "rw" ? "success.main" : "action.disabled",
              }}
            >
              {perm === "rw" ? (
                <LockOpenOutlined fontSize="small" />
              ) : (
                <LockOutlined fontSize="small" />
              )}
            </Box>
          </Tooltip>
          {mediaMatch ? (
            <IconButton
              color="primary"
              size="small"
              component={Link}
              to={`/datasets/${datasetId}/tables/${row.original.id}?view=${viewMode}`}>
              <ReadMoreRounded />
            </IconButton>
          ) : (
            <>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={isLoadingTableData ? <CircularProgress size={14} color="inherit" /> : <AssignmentTurnedInOutlined />}
                disabled={isLoadingTableData}
                onClick={async () => {
                  setSelectedTableId(row.original.id);
                  setHighlightedTableId(row.original.id);
                  setIsLoadingTableData(true);
                  try {
                    await dispatch(
                      getTable({ tableId: row.original.id, datasetId }),
                    ).unwrap();
                  } catch {
                    // open dialog anyway on error
                  }
                  setIsLoadingTableData(false);
                  dispatch(updateUI({ openComplianceStatusDialog: true }));
                }}
              >
                Compliance
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={isLoadingTableData ? <CircularProgress size={14} color="inherit" /> : <ShareOutlined />}
                disabled={isLoadingTableData}
                onClick={async () => {
                  setSelectedTableId(row.original.id);
                  setIsLoadingTableData(true);
                  try {
                    await dispatch(getTable({ tableId: row.original.id, datasetId })).unwrap();
                  } catch {
                  }
                  setIsLoadingTableData(false);
                  dispatch(updateUI({ openGraphDialog: true }));
                }}>
                Schema
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={
                  isLoadingDeps ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <AccountTreeRounded />
                  )
                }
                disabled={isLoadingDeps}
                onClick={async () => {
                  setHighlightedTableId(row.original.id);
                  setIsLoadingDeps(true);
                  try {
                    await dispatch(
                      getTable({ tableId: row.original.id, datasetId }),
                    ).unwrap();
                    await dispatch(
                      getDependencies({ tableId: row.original.id, datasetId }),
                    ).unwrap();
                  } catch {
                    // open panel anyway on error
                  }
                  setIsLoadingDeps(false);
                  setIsDependenciesPanelOpen(true);
                }}
              >
                Pipeline
              </Button>
            </>
          )}
        </Stack>
      );
    },
    [datasetId, viewType, dispatch, getTablePermission],
  );

  return (
    <>
      <ComplianceDialog datasetId={datasetId} tableId={selectedTableId} />
      <GraphDialog datasetId={datasetId} tableId={selectedTableId} />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 400 }}>
        <Box sx={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          {loading ? (
            <LinearProgress />
          ) : viewType === "raw" ? (
            <W3CViewer />
          ) : viewType === "list" ? (
            <DeferredTable
              columns={columns}
              data={rows}
              Actions={Actions}
              onChangeRowSelected={handleRowSelection}
              rowPropGetter={rowPropGetter}
            />
          ) : (
            <>
              {!isGridReady ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px",
                    gap: 2,
                  }}
                >
                  {rows.map((t) => {
                    if (snapshots[t.id]) return null;
                    return (
                      <GraphSnapshotTaker
                        key={t.id}
                        table={t}
                        onSnapshotReady={(imgUrl) => handleSnapshotReady(t.id, imgUrl)}
                      />
                    );
                  })}
                  <CircularProgress size={40} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
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
                          targetView: "graph",
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
        </Box>
        <DependenciesPanel
          open={isDependenciesPanelOpen}
          onClose={() => setIsDependenciesPanelOpen(false)}
          readonly
        />
      </Box>
    </>
  );
};

export default Tables;
