import { useFirstRender } from '@hooks/first-render/useFirstRender';
import { useQuery } from '@hooks/router';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import TableViewer from '@pages/Viewer/TableViewer';
import { selectCurrentView, selectGetTableStatus } from '@store/slices/table/table.selectors';
import { getTable } from '@store/slices/table/table.thunk';
import { FC, useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import Toolbar from '../Toolbar';
import W3CViewer from '../W3CViewer';

const ALLOWED_QUERY = ['table', 'graph', 'raw'];

const Viewer: FC<unknown> = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { view } = useQuery();
  const { loading } = useAppSelector(selectGetTableStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // redirect for parameters not allowed
    if (!view && ALLOWED_QUERY.indexOf(view) === -1) {
      history.push(`/table/${id}?view=table`);
    }
  }, [view]);

  useEffect(() => {
    if (id) {
      dispatch(getTable(id));
    }
  }, [id]);

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
