import { Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
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
}

/**
 * Renders active route.
 */
const RouteContainer: FC<RouteContainerProps> = ({
  loadChildren = true,
  children
}) => (
  loadChildren
    ? (
      <div className={styles.Container}>
        <Switch>
          {children}
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
