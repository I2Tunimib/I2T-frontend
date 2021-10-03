import {
  Avatar, Breadcrumbs,
  Button,
  Chip, Grow, IconButton, Typography
} from '@mui/material';
import { MainLayout } from '@root/components/layout';
import { useAppDispatch, useAppSelector } from '@root/hooks/store';
import {
  FC, useEffect, useState
} from 'react';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Cell, Row } from 'react-table';
import { ButtonPlay, Tag } from '@root/components/core';
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

const calcPercentage = (status: CompletionStatus) => {
  const total = Object.keys(status)
    .reduce((acc, key) => status[key as keyof CompletionStatus] + acc, 0);
  return (status.DONE / total) * 100 + 70;
};

interface SelectedRowsState {
  kind: 'dataset' | 'table';
  rows: any[];
}

const HomepageChallenge: FC<any> = () => {
  const [selectedRows, setSelectedRows] = useState<SelectedRowsState | null>(null);
  const dispatch = useAppDispatch();
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const currentDataset = useAppSelector(selectCurrentDataset);
  const { loading: loadingDatasets } = useAppSelector(selectGetAllDatasetsStatus);

  useEffect(() => {
    dispatch(getAllDatasets());
  }, []);

  const handleSelectedRowsChange = (state: { kind: 'dataset' | 'table', rows: any[] } | null) => {
    setSelectedRows(state);
  };

  return (
    <MainLayout
      ToolbarContent={<ToolbarContent />}
      SidebarContent={<SidebarContent />}>
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
          </div>
        </div>
        {currentDataset && (
          <Status
            value={calcPercentage(currentDataset.status)}
            status={currentDataset.status} />
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
