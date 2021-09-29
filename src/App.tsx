import { RouteContainer } from '@components/layout';
// import { RouteOption } from '@components/layout/RouteContainer';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Homepage } from '@pages/Homepage';
import TableViewer from '@pages/Viewer/TableViewer';
import Viewer from '@pages/Viewer';
import { selectGetConfigRequest } from '@store/slices/config/config.selectors';
import { getConfig } from '@store/slices/config/config.thunk';
import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';

const App = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectGetConfigRequest);

  useEffect(() => {
    dispatch(getConfig());
  }, []);

  return (
    <RouteContainer loadChildren={loading === false}>
      <Route exact path="/:tables" component={Homepage} />
      <Route path="/table/:id" component={Viewer} />
      <Redirect from="/" to="/raw" />
      <Redirect from="*" to="/" />
    </RouteContainer>
  );
};

export default App;
