import { Tag } from '@components/core';
import deferMounting from '@components/HOC';
import { TableListView } from '@components/kit';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { PlayArrowRounded, ReadMoreRounded } from '@mui/icons-material';
import {
  Button, IconButton,
  LinearProgress, Stack
} from '@mui/material';
import { ID } from '@store/interfaces/store';
import { selectCurrentDatasetTables, selectGetTablesDatasetStatus } from '@store/slices/datasets/datasets.selectors';
import { getTablesByDataset } from '@store/slices/datasets/datasets.thunk';
import { TableInstance } from '@store/slices/datasets/interfaces/datasets';
import {
  FC, useCallback, useEffect,
  useMemo, useState
} from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Cell } from 'react-table';
import TimeAgo from 'react-timeago';
import globalStyles from '@styles/globals.module.scss';
import { selectAppConfig } from '@store/slices/config/config.selectors';
import { dateRegex } from '@services/utils/regexs';

interface TablesProps {
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

const makeData = (tables: TableInstance[]) => {
  const data = tables.map(({ idDataset, ...rest }: any) => {
    return {
      ...rest
      // id: tableInstance.id,
      // name: tableInstance.name,
      // nCols: tableInstance.nCols,
      // nRows: tableInstance.nRows,
      // status: tableInstance.status
    };
  });

  const columns = Object.keys(data[0]).reduce((acc, key) => {
    if (key !== 'id') {
      return [
        ...acc, {
          Header: key,
          accessor: key,
          Cell: ({ row, value }: Cell<any>) => {
            if (key === 'status') {
              return (
                <div>
                  {value === 'TODO' ? (
                    <Tag status="todo">TODO</Tag>
                  ) : value === 'DOING' ? (
                    <Tag status="doing">DOING</Tag>
                  ) : (
                    <Tag status="done">DONE</Tag>
                  )}
                </div>
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

const Tables: FC<TablesProps> = ({
  onSelectionChange
}) => {
  const [tableState, setTableState] = useState<TableState>(defaultTableState);
  const { datasetId } = useParams<{ datasetId: ID }>();
  const dispatch = useAppDispatch();
  const tables = useAppSelector(selectCurrentDatasetTables);
  const { loading } = useAppSelector(selectGetTablesDatasetStatus);
  const history = useHistory();
  const { API } = useAppSelector(selectAppConfig);

  useEffect(() => {
    if (tables.length > 0) {
      setTableState(makeData(tables));
    }
  }, [tables]);

  useEffect(() => {
    dispatch(getTablesByDataset({ datasetId }));
  }, [datasetId]);

  const handleRowSelection = (rows: any[]) => {
    if (rows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: 'table', rows });
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

  const tableColumns = useMemo(() => tableState.columns, [tableState.columns]);
  const tableRows = useMemo(() => tableState.data, [tableState.data]);

  return (
    <>
      {loading ? (
        <LinearProgress />
      ) : (
        <DeferredTable
          columns={tableColumns}
          data={tableRows}
          Actions={Actions}
          onChangeRowSelected={handleRowSelection}
        />
      )}
    </>
  );
};

export default Tables;
