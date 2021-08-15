import { RouteContainer, Toolbar } from '@components/layout';
import { IRoute } from '@components/layout/route-container/interfaces';
import { useFetch } from '@hooks/fetch';
import { HomepageContainer } from '@pages/homepage';
import { TableViewer } from '@pages/table-viewer';
import { IConfigResponse, servicesConfigEndpoint } from '@services/api/endpoints/services-config';
import { setConfig } from '@store/config/config.slice';
import React from 'react';

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
  // fetch configuration file
  useFetch<IConfigResponse>(
    servicesConfigEndpoint(),
    {
      mappingFn: (res) => ({ servicesConfig: res.data }),
      dispatchFn: setConfig
    }
  );

  return (
    <RouteContainer routes={routes} />
  );
};

export default App;
