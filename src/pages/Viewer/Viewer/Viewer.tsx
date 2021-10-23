import { useFirstRender } from '@hooks/first-render/useFirstRender';
import { useQuery } from '@hooks/router';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import TableViewer from '@pages/Viewer/TableViewer';
import { selectCurrentView, selectGetTableStatus } from '@store/slices/table/table.selectors';
import { getTable } from '@store/slices/table/table.thunk';
import { FC, useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { restoreInitialState } from '@store/slices/table/table.slice';
import Toolbar from '../Toolbar';
import W3CViewer from '../W3CViewer';

const ALLOWED_QUERY = ['table', 'graph', 'raw'];

const Viewer: FC<unknown> = () => {
  const history = useHistory();
  // const { id } = useParams<{ id: string }>();
  const { tableId, datasetId } = useParams<{ tableId: string; datasetId: string }>();
  const { view } = useQuery();
  const { loading } = useAppSelector(selectGetTableStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (tableId && datasetId) {
      // redirect for parameters not allowed
      if (!view && ALLOWED_QUERY.indexOf(view) === -1) {
        history.push(`/datasets/${datasetId}/tables/${tableId}?view=table`);
      }
    }
  }, [view, tableId, datasetId]);

  // useEffect(() => {
  //   if (id) {
  //     console.log(id);
  //     // dispatch(getTable(id));
  //   }
  // }, [id]);

  useEffect(() => {
    if (tableId && datasetId) {
      dispatch(restoreInitialState());
      dispatch(getTable({ tableId, datasetId }))
        .unwrap()
        .catch((err) => history.push('/404'));
    }
  }, [tableId, datasetId]);

  const Switch = useCallback(() => {
    if (view) {
      switch (view) {
        case 'table': return <TableViewer />;
        case 'graph': return null;
        case 'raw': return <W3CViewer />;
        default: return null;
      }
    }
  }, [view]);

  return (
    <>
      <Toolbar />
      {!loading ? (
        <>
          {Switch()}
        </>
      ) : <LinearProgress />}
    </>
  );
};

export default Viewer;
