import { RouteContainer } from '@components/layout';
import { RouteOption } from '@components/layout/RouteContainer';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Homepage } from '@pages/Homepage';
import RefactorHomepage from '@pages/RefactorHomepage';
import { TableViewer } from '@pages/TableViewer';
import { selectGetConfigRequest } from '@store/slices/config/config.selectors';
import { getConfig } from '@store/slices/config/config.thunk';
import React, { useEffect } from 'react';

/**
 * Define routes
 */
const routes: RouteOption[] = [
  {
    path: '/:tables',
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
  const { loading } = useAppSelector(selectGetConfigRequest);

  useEffect(() => {
    dispatch(getConfig());
  }, []);

  return (
    <RouteContainer loadChildren={loading === false} routes={routes} />
  );
};

export default App;
