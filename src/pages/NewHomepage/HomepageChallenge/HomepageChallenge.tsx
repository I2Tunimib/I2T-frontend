import {
  Breadcrumbs, Button, Chip, Divider, LinearProgress, Stack, Typography, useMediaQuery
} from '@mui/material';
import { MainLayout } from '@components/layout';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { FC, useEffect, useState } from 'react';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Battery, SplitButton } from '@components/core';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import {
  Link, Redirect, Route, Switch, useHistory, useParams, useRouteMatch
} from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { annotate, getDataset } from '@store/slices/datasets/datasets.thunk';
import {
  selectCurrentDataset,
  selectGetAllDatasetsStatus
} from '@store/slices/datasets/datasets.selectors';
import { Status as CompletionStatus } from '@store/slices/datasets/interfaces/datasets';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import clsx from 'clsx';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import { updateUI } from '@store/slices/datasets/datasets.slice';
import SidebarContent from './SidebarContent/SidebarContent';
import ToolbarContent from './ToolbarContent';
import styles from './HomepageChallenge.module.scss';
import Datasets from './Datasets/Datasets';
import Tables from './Tables';
import UploadDataset from './UploadDataset/UploadDataset';

export const calcPercentage = (status: CompletionStatus) => {
  const total = Object.keys(status)
    .reduce((acc, key) => status[key as keyof CompletionStatus] + acc, 0);
  const value = (status.DONE / total) * 100;
  return value > 100 ? 100 : value;
};

interface SelectedRowsState {
  kind: 'dataset' | 'table';
  rows: any[];
}

const HomepageChallenge: FC<any> = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedRows, setSelectedRows] = useState<SelectedRowsState | null>(null);
  const dispatch = useAppDispatch();
  const {
    path,
    url
  } = useRouteMatch();
  const matches = useMediaQuery('(max-width:1365px)');
  const currentDataset = useAppSelector(selectCurrentDataset);
  const { loading: loadingDatasets } = useAppSelector(selectGetAllDatasetsStatus);
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

  const handleSelectedRowsChange = (state: { kind: 'dataset' | 'table', rows: any[] } | null) => {
    setSelectedRows(state);
  };

  const startProcess = (option: string) => {
    const endpoint = API.ENDPOINTS.PROCESS_START.find((value) => value.name === option);
    if (endpoint) {
      if (selectedRows) {
        const { kind, rows } = selectedRows;
        if (kind === 'dataset') {
          dispatch(annotate({
            name: endpoint.name || '',
            idDataset: rows.map((row) => row.id),
            idTable: []
          }));
        } else {
          dispatch(annotate({
            name: endpoint.name || '',
            idDataset: [currentDataset.id],
            idTable: rows.map((row) => row.id)
          }));
        }
      }
    }
  };

  let breadcrumbsDatasetProps = {};
  if (currentDataset) {
    breadcrumbsDatasetProps = {
      component: Link,
      to: '/datasets',
      className: clsx([styles.BreadcrumbsItem, styles.BreadcrumbsLink])
    };
  }

  return (
    <MainLayout
      ToolbarContent={<ToolbarContent />}
      sidebarCollapsed={sidebarCollapsed}
      sibebarCollapseChange={() => setSidebarCollapsed((old) => !old)}>
      <div className={styles.Header}>
        <div className={styles.Column}>
          <div className={clsx(
            styles.Row
          )}>
            <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
              <Typography
                className={styles.BreadcrumbsItem}
                {...breadcrumbsDatasetProps}
                variant="h6">
                Datasets
              </Typography>
              {currentDataset && (
                <Typography
                  className={styles.BreadcrumbsItem}
                  variant="h6">
                  {currentDataset.name}
                </Typography>
              )}
            </Breadcrumbs>
          </div>
          <div className={clsx(styles.Row, styles.SubHeader)}>

            {selectedRows && (
              <div className={styles.NSelected}>
                <strong>{selectedRows.rows.length}</strong>
                &nbsp;selected
              </div>
            )}
            {API.ENDPOINTS.PROCESS_START && API.ENDPOINTS.PROCESS_START.length > 0 && (
              <SplitButton
                prefix="Start process:"
                handleClick={startProcess}
                disabled={!selectedRows || selectedRows.rows.length === 0}
                options={API.ENDPOINTS.PROCESS_START.map(({ name }) => name)} />
            )}
            {/* <Button
              className={styles.ButtonAnnotation}
              disabled={!selectedRows || selectedRows.rows.length === 0}
              variant="contained"
              size="small"
              endIcon={<PlayArrowRoundedIcon />}>
              Start annotation
            </Button> */}
          </div>
        </div>
        {currentDataset && (
          <Stack
            alignItems="center"
            direction="row"
            gap="10px"
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Stack justifyContent="center" direction="column" gap="10px">
              <Chip label={`Tables: ${currentDataset.nTables}`} size="small" />
              <Chip label={`Avg cols: ${currentDataset.nAvgCols}`} size="small" />
              <Chip label={`Avg rows: ${currentDataset.nAvgRows}`} size="small" />
            </Stack>

            <Stack gap="10px" alignItems="center">
              <Typography variant="body2" fontWeight="500">Dataset completion</Typography>
              <Battery size="medium" value={calcPercentage(currentDataset.status)} />
            </Stack>
          </Stack>
        )
        }
        {!currentDataset && API.ENDPOINTS.UPLOAD_DATASET
                && (
                <Button
                  size="small"
                  component="label"
                  startIcon={<AddRoundedIcon />}
                  color="primary"
                  onClick={() => dispatch(updateUI({ uploadDialogOpen: true }))}
                  variant="text">
                  New Dataset
                </Button>
                )
        }

      </div>
      <div className={styles.TableContainer}>
        <Switch>
          <Route exact path={path}>
            <Datasets onSelectionChange={handleSelectedRowsChange} />
          </Route>
          <Route path={`${path}/:datasetId/tables`}>
            {loadingDatasets === false
              ? <Tables onSelectionChange={handleSelectedRowsChange} /> : <LinearProgress />}
          </Route>
          <Redirect from="*" to="/datasets" />
        </Switch>
      </div>
      <UploadDataset />
    </MainLayout>
  );
};

export default HomepageChallenge;
