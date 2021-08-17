import { Route, Switch } from 'react-router-dom';
import { IRoute } from './interfaces';
import styles from './route-container.module.scss';

interface IRouteContainerProps {
  routes: IRoute[];
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
