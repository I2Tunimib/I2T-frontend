import { Battery, Tag } from '@root/components/core';
import { TableListView } from '@root/components/kit';
import { useAppDispatch, useAppSelector } from '@root/hooks/store';
import { selectDatasets } from '@root/store/slices/datasets/datasets.selectors';
import { setCurrentDataset } from '@store/slices/datasets/datasets.slice';
import { DatasetInstance } from '@store/slices/datasets/interfaces/datasets';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import {
  FC, useEffect,
  useMemo, useState
} from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Cell, Row } from 'react-table';
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

const makeData = (datasets: DatasetInstance[]) => {
  const data = Array(20).fill(datasets[0]).map((datasetInstance) => {
    return {
      id: datasetInstance.id,
      name: datasetInstance.name,
      nTables: datasetInstance.nTables,
      nAvgRows: datasetInstance.nAvgRows,
      nAvgCols: datasetInstance.nAvgCols,
      stdDevRows: datasetInstance.stdDevRows,
      stdDevCols: datasetInstance.stdDevCols,
      status: calcPercentage(datasetInstance.status)
    };
  });

  const columns = Object.keys(data[0]).reduce((acc, key) => {
    if (key !== 'id') {
      return [
        ...acc, {
          Header: key,
          accessor: key,
          ...(key === 'status' && {
            Cell: ({ row, value }: Cell<any>) => (
              <>
                <Battery value={value} />
              </>
            )
          })
        }
      ];
    }
    return acc;
  }, [] as any[]);

  return { columns, data };
};

const Datasets: FC<DatasetsProps> = ({
  onSelectionChange
}) => {
  const [tableState, setTableState] = useState<TableState>(defaultTableState);
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const datasets = useAppSelector(selectDatasets);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentDataset(''));
  }, []);

  useEffect(() => {
    if (datasets.length > 0) {
      setTableState(makeData(datasets));
    }
  }, [datasets]);

  const handleRowSelection = (rows: any[]) => {
    if (rows.length === 0) {
      onSelectionChange(null);
    } else {
      onSelectionChange({ kind: 'dataset', rows });
    }
  };

  const rowPropGetter = ({ original }: Row<any>) => ({
    onDoubleClick: () => {
      history.push(`${url}/${original.id}/tables`);
    }
  });

  const tableColumns = useMemo(() => tableState.columns, [tableState.columns]);
  const tableRows = useMemo(() => tableState.data, [tableState.data]);

  return (
    <TableListView
      columns={tableColumns}
      data={tableRows}
      Icon={<FolderRoundedIcon color="action" />}
      rowPropGetter={rowPropGetter}
      onChangeRowSelected={handleRowSelection}
    />
  );
};

export default Datasets;
