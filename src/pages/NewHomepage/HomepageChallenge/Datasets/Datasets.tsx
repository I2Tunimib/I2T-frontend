import { Battery, DotLoading } from '@components/core';
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
  Stack, Tooltip
} from '@mui/material';
import { PlayArrowRounded, ReadMoreRounded } from '@mui/icons-material';
import deferMounting from '@components/HOC';
import { calcPercentage } from '../HomepageChallenge';
import styles from './Datasets.module.scss';

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
  const data = Array(20).fill(datasets[0]).map((datasetInstance) => {
    return {
      id: datasetInstance.id,
      name: datasetInstance.name,
      nTables: datasetInstance.nTables,
      nAvgRows: datasetInstance.nAvgRows,
      nAvgCols: datasetInstance.nAvgCols,
      stdDevRows: datasetInstance.stdDevRows,
      stdDevCols: datasetInstance.stdDevCols,
      status: {
        raw: datasetInstance.status,
        percentage: calcPercentage(datasetInstance.status)
      }
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
          ...(key === 'status' && {
            Cell: ({ row, value }: Cell<any>) => (
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
                  {Math.random() > 0.5 ? <DotLoading /> : null}
                </Stack>
              </Tooltip>
            )
          })
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

  useEffect(() => {
    dispatch(setCurrentDataset(''));
  }, []);

  const sortStatus = useCallback((
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
          status: sortStatus
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
      <Stack direction="row" gap="5px" className={styles.Actions}>
        {mediaMatch ? (
          <>
            <IconButton color="primary" size="small">
              <PlayArrowRounded />
            </IconButton>
            <IconButton
              color="primary"
              size="small"
              component={Link}
              to={`${url}/${row.original.id}/tables`}>
              <ReadMoreRounded />
            </IconButton>
          </>
        ) : (
          <>
            <Button size="small" endIcon={<PlayArrowRounded />}>
              Annotate
            </Button>
            <Button
              size="small"
              component={Link}
              to={`${url}/${row.original.id}/tables`}
              endIcon={<ReadMoreRounded />}>
              Explore
            </Button>
          </>
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
