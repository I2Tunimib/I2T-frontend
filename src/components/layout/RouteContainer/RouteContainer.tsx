import { ComponentType, FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import styles from './RouteContainer.module.scss';

interface RouteContainerProps {
  /**
   * Routes configuration.
   */
  routes: RouteOption[];
}

/**
 * A single route configuration.
 */
export interface RouteOption {
  /**
   * Path to render the route.
   */
  path: string;
  /**
   * If the path should be matched exactly.
   */
  exact: boolean;
  /**
   * The component to render at given path.
   */
  Component: ComponentType;
}

/**
 * Renders active route.
 */
const RouteContainer: FC<RouteContainerProps> = ({ routes }) => (
  <div className={styles.Container}>
    <Switch>
      {routes.map(({ path, Component, exact }) => (
        <Route key={path} path={path} exact={exact} component={Component} />))}
    </Switch>
  </div>
);

export default RouteContainer;
