import { Battery, DotLoading } from '@components/core';
import { TableListView } from '@components/kit';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectDatasets } from '@store/slices/datasets/datasets.selectors';
import { setCurrentDataset } from '@store/slices/datasets/datasets.slice';
import { DatasetInstance } from '@store/slices/datasets/interfaces/datasets';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import TimeAgo from 'react-timeago';
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
  Stack, Tooltip
} from '@mui/material';
import { PlayArrowRounded, ReadMoreRounded } from '@mui/icons-material';
import deferMounting from '@components/HOC';
import globalStyles from '@styles/globals.module.scss';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import { dateRegex } from '@services/utils/regexs';
import { calcPercentage } from '../HomepageChallenge';

interface DatasetsProps {
  onSelectionChange: (state: { kind: 'dataset' | 'table', rows: any[] } | null) => void;
}

interface TableState {
  columns: any[];
  data: any[];
}

const defaultTableState = {
  columns: [],
  data: []
};

interface MakeDataOptions {
  sortFunctions: Record<string, any>
}

const makeData = (datasets: DatasetInstance[], options: Partial<MakeDataOptions> = {}) => {
  const data = datasets.map(({ tables, ...rest }) => {
    return {
      ...rest
      // id: datasetInstance.id,
      // name: datasetInstance.name,
      // nTables: datasetInstance.nTables,
      // nAvgRows: datasetInstance.nAvgRows,
      // nAvgCols: datasetInstance.nAvgCols,
      // stdDevRows: datasetInstance.stdDevRows,
      // stdDevCols: datasetInstance.stdDevCols,
      // completion: {
      //   raw: datasetInstance.status,
      //   percentage: calcPercentage(datasetInstance.status)
      // }
    };
  });

  const { sortFunctions } = options;

  const columns = Object.keys(data[0]).reduce((acc, key) => {
    if (key !== 'id') {
      return [
        ...acc, {
          Header: key,
          accessor: key,
          ...((sortFunctions && sortFunctions[key]) && { sortType: sortFunctions[key] }),
          Cell: ({ row, value }: Cell<any>) => {
            if (key === 'completion') {
              return (
                <Tooltip
                  arrow
                  title={(
                    <Stack>
                      {Object.keys(value.raw).map((status, index) => (
                        <span key={index}>
                          {`${status}: ${value.raw[status]}`}
                        </span>
                      ))}
                    </Stack>
                  )}
                  placement="left">
                  <Stack direction="row" gap="18px">
                    <Battery value={value.percentage} />
                    {value.raw.PENDING > 0 && <DotLoading />}
                  </Stack>
                </Tooltip>
              );
            }
            if (dateRegex.test(value)) {
              return (
                <TimeAgo title="" date={value} />
              );
            }
            return value;
          }
        }
      ];
    }
    return acc;
  }, [] as any[]);

  return { columns, data };
};

const DeferredTable = deferMounting(TableListView);

const Datasets: FC<DatasetsProps> = ({
  onSelectionChange
}) => {
  const [tableState, setTableState] = useState<TableState>(defaultTableState);
  const { path, url } = useRouteMatch();
  const datasets = useAppSelector(selectDatasets);
  const dispatch = useAppDispatch();
  const { API } = useAppSelector(selectAppConfig);

  useEffect(() => {
    dispatch(setCurrentDataset(''));
  }, []);

  const sortCompletion = useCallback((
    rowA: any, rowB: any,
    columnId: string,
    desc: boolean
  ) => {
    return rowA.values[columnId].percentage < rowB.values[columnId].percentage ? -1 : 1;
  }, []);

  useEffect(() => {
    if (datasets.length > 0) {
      setTableState(makeData(datasets, {
        sortFunctions: {
          completion: sortCompletion
        }
      }));
    }
  }, [datasets]);

  const handleRowSelection = (rows: any[]) => {
    if (rows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: 'dataset', rows });
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

  const tableColumns = useMemo(() => tableState.columns, [tableState.columns]);
  const tableRows = useMemo(() => tableState.data, [tableState.data]);

  return (
    <DeferredTable
      columns={tableColumns}
      data={tableRows}
      Actions={Actions}
      Icon={<FolderRoundedIcon color="action" />}
      onChangeRowSelected={handleRowSelection}
    />
  );
};

export default Datasets;
