import { Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ComponentType, FC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import styles from './RouteContainer.module.scss';

interface RouteContainerProps {
  /**
   * If true subroutes are loaded.
   * This is useful to prevent rendering child routes before
   * the setup is finished (e.g.: getting config from server)
   */
  loadChildren?: boolean;
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
const RouteContainer: FC<RouteContainerProps> = ({
  loadChildren = true,
  routes
}) => (
  loadChildren
    ? (
      <div className={styles.Container}>
        <Switch>
          {routes.map(({ path, Component, exact }) => (
            <Route key={path} path={path} exact={exact} component={Component} />))}
          <Redirect from="*" to="/" />
        </Switch>
      </div>
    )
    : (
      <div className={styles.Loader}>
        <CircularProgress />
        <Typography color="textSecondary" variant="subtitle2" gutterBottom>
          Loading configuration...
        </Typography>
      </div>
    )

);

export default RouteContainer;
