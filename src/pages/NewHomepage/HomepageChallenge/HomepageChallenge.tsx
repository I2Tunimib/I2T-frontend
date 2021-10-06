import {
  Breadcrumbs, Button,
  Chip, IconButton, Stack,
  Typography, useMediaQuery
} from '@mui/material';
import { MainLayout } from '@components/layout';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import {
  FC, useEffect, useState
} from 'react';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Battery } from '@components/core';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import {
  Link,
  Route, Switch,
  useHistory, useRouteMatch
} from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { getAllDatasets } from '@store/slices/datasets/datasets.thunk';
import { selectCurrentDataset, selectGetAllDatasetsStatus } from '@store/slices/datasets/datasets.selectors';
import { Status as CompletionStatus } from '@store/slices/datasets/interfaces/datasets';
import clsx from 'clsx';
import SidebarContent from './SidebarContent/SidebarContent';
import ToolbarContent from './ToolbarContent';
import styles from './HomepageChallenge.module.scss';
import Datasets from './Datasets/Datasets';
import Tables from './Tables';

export const calcPercentage = (status: CompletionStatus) => {
  const total = Object.keys(status)
    .reduce((acc, key) => status[key as keyof CompletionStatus] + acc, 0);
  const value = (status.DONE / total) * 100 + (Math.random() * 101);
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
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const matches = useMediaQuery('(max-width:1365px)');
  const currentDataset = useAppSelector(selectCurrentDataset);
  const { loading: loadingDatasets } = useAppSelector(selectGetAllDatasetsStatus);

  useEffect(() => {
    dispatch(getAllDatasets());
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

  return (
    <MainLayout
      ToolbarContent={<ToolbarContent />}
      SidebarContent={<SidebarContent />}
      sidebarCollapsed={sidebarCollapsed}
      sibebarCollapseChange={() => setSidebarCollapsed((old) => !old)}>
      <div className={styles.Header}>
        <div className={styles.Column}>
          <div className={clsx(
            styles.Row
          )}>
            <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
              <Typography
                component={Link}
                to="/datasets"
                sx={{
                  textDecoration: 'none'
                }}
                style={{ color: '#132F4C' }}
                variant="h5">
                Datasets
              </Typography>
              {currentDataset && (
                <Typography
                  sx={{
                    textDecoration: 'none'
                  }}
                  style={{ color: '#132F4C' }}
                  variant="h5">
                  {currentDataset.name}
                </Typography>
              )}
            </Breadcrumbs>
          </div>
          <div className={clsx(styles.Row, styles.SubHeader)}>
            {currentDataset && (
              <Stack alignItems="center" direction="row" spacing={1} marginRight="10px">
                <Chip label={`Tables: ${currentDataset.nTables}`} size="small" />
                <Chip label={`Avg cols: ${currentDataset.nAvgCols}`} size="small" />
                <Chip label={`Avg rows: ${currentDataset.nAvgRows}`} size="small" />
              </Stack>
            )}
            {selectedRows && (
              <div className={styles.NSelected}>
                {`${selectedRows.rows.length} selected`}
              </div>
            )}
            <Button
              className={styles.ButtonAnnotation}
              disabled={!selectedRows || selectedRows.rows.length === 0}
              variant="contained"
              size="small"
              endIcon={<PlayArrowRoundedIcon />}>
              Start annotation
            </Button>
          </div>
        </div>
        {currentDataset && (
          <Stack gap="10px" alignItems="center">
            <Typography variant="body2" fontWeight="500">Dataset completion</Typography>
            <Battery size="medium" value={calcPercentage(currentDataset.status)} />
          </Stack>
        )}
      </div>
      <div className={styles.TableContainer}>
        <Switch>
          <Route exact path={path}>
            <Datasets onSelectionChange={handleSelectedRowsChange} />
          </Route>
          <Route path={`${path}/:datasetId/tables`}>
            {loadingDatasets === false ? <Tables onSelectionChange={handleSelectedRowsChange} /> : 'Loading datasets'}
          </Route>
        </Switch>
      </div>
    </MainLayout>
  );
};

export default HomepageChallenge;
