import { RouteContainer } from '@components/layout';
import { RouteOption } from '@components/layout/RouteContainer';
import { useAppDispatch } from '@hooks/store';
import { Homepage } from '@pages/Homepage';
import { TableViewer } from '@pages/TableViewer';
import { getConfig } from '@store/slices/config/config.thunk';
import React, { useEffect } from 'react';

/**
 * Define routes
 */
const routes: RouteOption[] = [
  {
    path: '/',
    exact: true,
    Component: Homepage
  },
  {
    path: '/table/:name',
    exact: false,
    Component: TableViewer
  }
];

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getConfig());
  }, []);

  return (
    <RouteContainer routes={routes} />
  );
};

export default App;
