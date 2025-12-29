import { useQuery } from '@hooks/router';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import TableViewer from '@pages/Viewer/TableViewer';
import { selectCurrentTable, selectGetTableStatus } from '@store/slices/table/table.selectors';
import { getTable } from '@store/slices/table/table.thunk';
import { FC, useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LinearProgress, Stack } from '@mui/material';
import { restoreInitialState } from '@store/slices/table/table.slice';
import deferMounting from '@components/HOC';
import { SnackbarKey, useSnackbar } from 'notistack';
import { isEmptyObject } from '@services/utils/objects-utils';
import { Loader } from '@components/core';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import Toolbar from '../Toolbar';
import W3CViewer from '../W3CViewer';
import GraphViewer from '../GraphViewer';

const ALLOWED_QUERY = ['table', 'graph', 'raw'];

const DeferredTableViewer = deferMounting(TableViewer);
const DeferredW3CViewer = deferMounting(W3CViewer);
const DeferredGraphViewer = deferMounting(GraphViewer);

const spin = keyframes`
  0% { transform: rotate(0deg) }
  100% { transform: rotate(359deg) }
`;

const LoaderAnnoation = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid;
  border-color: #ffffff rgba(255,255,255,0.1) rgba(255,255,255,0.1);
  animation: ${spin} .6s linear infinite;
`;

const Viewer: FC<unknown> = () => {
  const refSnack = useRef<SnackbarKey | null>(null);
  const history = useHistory();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { tableId, datasetId } = useParams<{ tableId: string; datasetId: string }>();
  const { view } = useQuery();
  const { loading } = useAppSelector(selectGetTableStatus);
  const currentTable = useAppSelector(selectCurrentTable);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (tableId && datasetId) {
      // redirect for parameters not allowed
      if (!view && ALLOWED_QUERY.indexOf(view) === -1) {
        history.push(`/datasets/${datasetId}/tables/${tableId}?view=table`);
      }
    }
  }, [view, tableId, datasetId]);

  useEffect(() => {
    if (tableId && datasetId) {
      // dispatch(restoreInitialState());
      dispatch(getTable({ tableId, datasetId }))
        .unwrap()
        .catch((err) => history.push('/404'));
    }
  }, [tableId, datasetId]);

  useEffect(() => {
    if (!isEmptyObject(currentTable)) {
      if (currentTable.mantisStatus === 'PENDING') {
        const key = enqueueSnackbar((
          <Stack direction="row" gap="10px" alignItems="center">
            <span>The table is being annotated</span>
            <LoaderAnnoation />
          </Stack>
        ), {
          persist: true,
          variant: 'info'
        });
        refSnack.current = key;
      } else {
        if (refSnack.current) {
          closeSnackbar(refSnack.current);
        }
      }
    }
  }, [currentTable]);

  useEffect(() => {
    return () => {
      dispatch(restoreInitialState());
      if (refSnack.current) {
        closeSnackbar(refSnack.current);
      }
    };
  }, []);

  const Switch = useCallback(() => {
    if (view) {
      switch (view) {
        case 'table': return <DeferredTableViewer />;
        case 'graph': return <DeferredGraphViewer />;
        case 'raw': return <DeferredW3CViewer />;
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
