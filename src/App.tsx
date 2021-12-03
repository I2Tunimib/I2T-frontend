import { RouteContainer } from '@components/layout';
import useInit from '@hooks/init/useInit';
import React, { Suspense, useEffect } from 'react';
import { Link, Redirect, Route } from 'react-router-dom';
import { Loader, useSocketIo } from '@components/core';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '@hooks/store';
import { updateTableSocket } from '@store/slices/table/table.thunk';
import { GetTableResponse } from '@services/api/table';
import { Button } from '@mui/material';
import { getRedirects, getRoutes } from './routes';

// const { MODE } = config.APP;
const MODE = 'challenge';

const App = () => {
  // initialize app
  const loading = useInit();
  const socket = useSocketIo();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (socket) {
      socket.on('done', (data: GetTableResponse) => {
        const { table } = data;
        dispatch(updateTableSocket(data));
        enqueueSnackbar(`Annotation for table ${table.name} completed`, {
          variant: 'success',
          action: (key) => {
            return (
              <Button
                sx={{
                  color: '#ffffff'
                }}
                component={Link}
                to={`/datasets/${table.idDataset}/tables/${table.id}`}
                onClick={() => closeSnackbar(key)}>
                view
              </Button>
            );
          }
        });
      });
    }
  }, [socket]);

  return (
    <Suspense fallback={<Loader />}>
      <RouteContainer loadChildren={loading === false}>
        {getRoutes()
          .map((routeProps, index) => (
            <Route key={index} {...routeProps} />
          ))}
        {getRedirects()
          .map((redirectProps, index) => (
            <Redirect key={index} {...redirectProps} />
          ))}
      </RouteContainer>
    </Suspense>
  );
};

export default App;
