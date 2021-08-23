import { ComponentType } from 'react';
import { Route, Switch } from 'react-router-dom';
import styles from './RouteContainer.module.scss';

interface IRouteContainerProps {
  routes: IRoute[];
}

export interface IRoute {
  path: string;
  exact: boolean;
  Component: ComponentType;
}

/**
 * Renders active route
 */
const RouteContainer = ({ routes }: IRouteContainerProps) => (
  <div className={styles.Container}>
    <Switch>
      {routes.map(({ path, Component, exact }) => (
        <Route key={path} path={path} exact={exact} component={Component} />))}
    </Switch>
  </div>
);

export default RouteContainer;
