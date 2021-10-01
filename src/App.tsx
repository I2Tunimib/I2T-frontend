import { RouteContainer } from '@components/layout';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import Homepage from '@pages/Homepage';
import Viewer from '@pages/Viewer';
import { selectGetConfigRequest } from '@store/slices/config/config.selectors';
import { getConfig } from '@store/slices/config/config.thunk';
import React, { Suspense, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import config from './config.yaml';
import usePrefetch from './hooks/prefetch/usePrefetch';
import { getRoutes, getRedirects } from './routes';

const App = () => {
  // preload routes based on configuration
  usePrefetch();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectGetConfigRequest);
  const { MODE } = config.APP;

  useEffect(() => {
    dispatch(getConfig());
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouteContainer loadChildren={loading === false}>
        {getRoutes(MODE).map((routeProps, index) => (
          <Route key={index} {...routeProps} />
        ))}
        {getRedirects(MODE).map((redirectProps, index) => (
          <Redirect key={index} {...redirectProps} />
        ))}
      </RouteContainer>
    </Suspense>
  );
};

export default App;
