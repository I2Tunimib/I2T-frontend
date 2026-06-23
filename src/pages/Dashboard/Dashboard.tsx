import {
  Breadcrumbs,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { MainLayout } from "@components/layout";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { FC, useEffect, useState } from "react";
import { IconButtonTooltip, SplitButton } from "@components/core";
import {
  Link,
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from "react-router-dom";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import {
  annotate,
  deleteDataset,
  deleteTable,
  getDataset,
} from "@store/slices/datasets/datasets.thunk";
import {
  selectCurrentDataset,
  selectGetAllDatasetsStatus,
  selectIsHelpDialogOpen,
} from "@store/slices/datasets/datasets.selectors";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Status as CompletionStatus } from "@store/slices/datasets/interfaces/datasets";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import clsx from "clsx";
import { selectAppConfig } from "@store/slices/config/config.selectors";
import { updateUI } from "@store/slices/datasets/datasets.slice";
import ToolbarContent from "./ToolbarContent";
import styles from "./Dashboard.module.scss";
import Datasets from "./Datasets/Datasets";
import Tables from "./Tables";
import UploadDataset from "./UploadDataset/UploadDataset";
import UploadTable from "./UploadTable/UploadTable";
import HelpDialog from "./HelpDialog/HelpDialog";

export const calcPercentage = (status: CompletionStatus) => {
  const total = Object.keys(status).reduce(
    (acc, key) => status[key as keyof CompletionStatus] + acc,
    0,
  );
  const value = (status.DONE / total) * 100;
  return value > 100 ? 100 : value;
};

interface SelectedRowsState {
  kind: "dataset" | "table";
  rows: any[];
}

const Dashboard: FC<any> = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRows, setSelectedRows] = useState<SelectedRowsState | null>(
    null,
  );
  const [viewType, setViewType] = useState<'list' | 'card'>('list');
  const dispatch = useAppDispatch();
  const { path, url } = useRouteMatch();
  const matches = useMediaQuery("(max-width:1365px)");
  const currentDataset = useAppSelector(selectCurrentDataset);
  const helpDialogOpen = useAppSelector(selectIsHelpDialogOpen);
  const history = useHistory();
  const { loading: loadingDatasets } = useAppSelector(
    selectGetAllDatasetsStatus,
  );
  const { API } = useAppSelector(selectAppConfig);

  useEffect(() => {
    dispatch(getDataset());
  }, []);

  useEffect(() => {
    if (matches) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [matches]);

  const handleSelectedRowsChange = (
    state: { kind: "dataset" | "table"; rows: any[] } | null,
  ) => {
    setSelectedRows(state);
  };

  const handleDelete = () => {
    if (selectedRows) {
      const { kind, rows } = selectedRows;

      if (kind === "dataset") {
        rows.forEach(({ id }) => {
          dispatch(deleteDataset({ datasetId: id }));
        });
      } else {
        rows.forEach(({ id }) => {
          dispatch(deleteTable({ datasetId: currentDataset.id, tableId: id }));
        });
      }
    }
    setSelectedRows(null);
  };

  const startProcess = (option: string) => {
    const endpoint = API.ENDPOINTS.PROCESS_START.find(
      (value) => value.name === option,
    );
    if (endpoint) {
      if (selectedRows) {
        const { kind, rows } = selectedRows;
        if (kind === "dataset") {
          dispatch(
            annotate({
              name: endpoint.name || "",
              idDataset: rows.map((row) => row.id),
              idTable: [],
            }),
          );
        } else {
          dispatch(
            annotate({
              name: endpoint.name || "",
              idDataset: [currentDataset.id],
              idTable: rows.map((row) => row.id),
            }),
          );
        }
      }
    }
  };

  let breadcrumbsDatasetProps = {};
  if (currentDataset) {
    breadcrumbsDatasetProps = {
      component: Link,
      to: "/datasets",
      className: clsx([styles.BreadcrumbsItem, styles.BreadcrumbsLink]),
    };
  }

  return (
    <MainLayout
      ToolbarContent={<ToolbarContent />}
      sidebarCollapsed={sidebarCollapsed}
      sibebarCollapseChange={() => setSidebarCollapsed((old) => !old)}
    >
      <div className={styles.Header}>
        <div className={styles.Column}>
          <div className={clsx(styles.Row)}>
            <Breadcrumbs
              separator={
                <Typography fontSize="24px" color="textSecondary">
                  /
                </Typography>
              }
            >
              <Stack direction="row" alignItems="center" gap="5px">
                {currentDataset && (
                  <IconButton
                    size="small"
                    onClick={() => history.push("/datasets")}
                  >
                    <ArrowBackIosRoundedIcon fontSize="medium" />
                  </IconButton>
                )}
                <Typography
                  className={styles.BreadcrumbsItem}
                  {...breadcrumbsDatasetProps}
                  variant="h6"
                >
                  Datasets
                </Typography>
              </Stack>
              {currentDataset && (
                <Typography className={styles.BreadcrumbsItem} variant="h6">
                  {currentDataset.name}
                </Typography>
              )}
            </Breadcrumbs>
          </div>
          {/*DELETE TABLE/DATASETS*/}
          <div className={clsx(styles.Row, styles.SubHeader)}>
            {API.ENDPOINTS.DELETE_DATASET && (
              <IconButtonTooltip
                onClick={handleDelete}
                tooltipText="Delete"
                Icon={DeleteRoundedIcon}
                disabled={!selectedRows}
              />
            )}
            {selectedRows && (
              <div className={styles.NSelected}>
                <strong>{selectedRows.rows.length}</strong>
                &nbsp;selected
              </div>
            )}
            {API.ENDPOINTS.PROCESS_START &&
              API.ENDPOINTS.PROCESS_START.length > 0 && (
                <SplitButton
                  prefix="Start process:"
                  handleClick={startProcess}
                  disabled={!selectedRows || selectedRows.rows.length === 0}
                  options={API.ENDPOINTS.PROCESS_START.map(({ name }) => name)}
                />
              )}
          </div>
        </div>
        <Stack direction="row" alignItems="center" gap="12px">
          {!currentDataset && API.ENDPOINTS.UPLOAD_DATASET && (
            <Button
              size="small"
              component="label"
              startIcon={<AddRoundedIcon />}
              color="primary"
              onClick={() =>
                dispatch(updateUI({ uploadDatasetDialogOpen: true }))
              }
              variant="outlined"
            >
              New Dataset
            </Button>
          )}
          {currentDataset && API.ENDPOINTS.UPLOAD_TABLE && (
            <Button
              size="small"
              component="label"
              startIcon={<AddRoundedIcon />}
              color="primary"
              onClick={() => dispatch(updateUI({ uploadTableDialogOpen: true }))}
              variant="outlined"
            >
              New Table
            </Button>
          )}
          {currentDataset && (
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={(_, next) => next && setViewType(next)}
              size="small"
              aria-label="view type"
              sx={{
                height: "30px",
                "& .MuiToggleButton-root": {
                  color: "text.disabled",
                  borderColor: "#94b3e4",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "rgba(27, 116, 228, 0.04)",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    borderColor: "primary.main",
                    backgroundColor: "rgba(27, 116, 228, 0.08)",
                    zIndex: 1,
                    "&:hover": {
                      borderColor: "primary.dark",
                      backgroundColor: "#ecf0f3",
                    }
                  },
                },
              }}
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewListRoundedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="card" aria-label="card view">
                <ViewModuleRoundedIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
      </div>
      <div className={styles.TableContainer}>
        <Switch>
          <Route exact path={path}>
            <Datasets onSelectionChange={handleSelectedRowsChange} />
          </Route>
          <Route path={`${path}/:datasetId/tables`}>
            {loadingDatasets === false ? (
              <Tables onSelectionChange={handleSelectedRowsChange} viewType={viewType} />
            ) : (
              <LinearProgress />
            )}
          </Route>
          <Redirect from="*" to="/datasets" />
        </Switch>
      </div>
      <UploadDataset />
      <UploadTable />
      <HelpDialog
        open={helpDialogOpen}
        onClose={() => dispatch(updateUI({ helpDialogOpen: false }))}
      />
    </MainLayout>
  );
};

export default Dashboard;
