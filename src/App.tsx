import { RouteContainer } from '@components/layout';
import { IRoute } from '@components/layout/route-container/interfaces';
import { useAppDispatch } from '@hooks/store';
import { HomepageContainer } from '@pages/homepage';
import { TableViewer } from '@pages/table-viewer';
import { getConfig } from '@store/config/config.thunk';
import React, { useEffect } from 'react';

/**
 * Define routes
 */
const routes: IRoute[] = [
  {
    path: '/',
    exact: true,
    Component: HomepageContainer
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
