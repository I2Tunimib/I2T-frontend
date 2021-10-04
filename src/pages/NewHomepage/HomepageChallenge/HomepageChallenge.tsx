import {
  Avatar, Breadcrumbs,
  Button,
  Chip, Grid, Grow, IconButton, Stack, Typography, useMediaQuery
} from '@mui/material';
import { MainLayout } from '@root/components/layout';
import { useAppDispatch, useAppSelector } from '@root/hooks/store';
import {
  FC, useEffect, useState
} from 'react';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Cell, Row } from 'react-table';
import { Battery, ButtonPlay, Tag } from '@root/components/core';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import {
  Link,
  Route, Switch,
  useHistory, useRouteMatch
} from 'react-router-dom';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { getAllDatasets } from '@store/slices/datasets/datasets.thunk';
import { selectCurrentDataset, selectGetAllDatasetsStatus } from '@store/slices/datasets/datasets.selectors';
import { Status } from '@components/kit';
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
  return (status.DONE / total) * 100 + (Math.random() * 101);
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
  const matches = useMediaQuery('(max-width:1230px)');
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
            styles.Row,
            [styles.Title],
            {
              [styles.Back]: !!currentDataset
            }
          )}>
            <IconButton onClick={() => history.push('/datasets')}>
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <Typography style={{ color: '#132F4C' }} variant="h4">
              Datasets
            </Typography>
            {currentDataset && (
              <Stack marginLeft="10px" alignItems="center" direction="row" spacing={1}>
                <Chip label={`Tables: ${currentDataset.nTables}`} size="small" />
                <Chip label={`Avg cols: ${currentDataset.nAvgCols}`} size="small" />
                <Chip label={`Avg rows: ${currentDataset.nAvgRows}`} size="small" />
              </Stack>
            )}
          </div>
          <div className={clsx(styles.Row, styles.SubHeader)}>
            <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
              <Typography
                className={styles.Link}
                component={Link}
                to="/datasets"
                color="textSecondary">
                All datasets
              </Typography>
              {currentDataset && (
                <Typography
                  component={Link}
                  to={url}
                  className={styles.Link}
                  color="textSecondary">
                  {currentDataset.name}
                </Typography>
              )}
            </Breadcrumbs>
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
