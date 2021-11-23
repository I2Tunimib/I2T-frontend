import { RouteContainer } from '@components/layout';
import useInit from '@hooks/init/useInit';
import React, { Suspense } from 'react';
import { Redirect, Route } from 'react-router-dom';
// import usePrefetch from './hooks/prefetch/usePrefetch';
import { Loader } from '@components/core';
import { getRedirects, getRoutes } from './routes';

// const { MODE } = config.APP;
const MODE = 'challenge';

const App = () => {
  // initialize app
  const loading = useInit();

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
