import {
  ComponentType, lazy,
  LazyExoticComponent
} from 'react';
import { RedirectProps, RouteProps } from 'react-router-dom';
import { store } from './store';

export type LazyExoticComponentWithPreload = LazyExoticComponent<any>
  & { preload?: () => Promise<{ default: ComponentType<any> }> };

const lazyWithPreload = (factory: () => Promise<{ default: ComponentType<any> }>) => {
  const Component = lazy(factory) as LazyExoticComponentWithPreload;
  Component.preload = factory;
  return Component;
};

interface AppRoutes {
  [mode: string]: {
    routes: RouteProps[];
    redirect: RedirectProps[];
    preload: 'all'
  }
}

/**
 * Applciation routes.
 */
const APP_ROUTES: AppRoutes = {
  // routes if application is set to challenge
  standard: {
    routes: [
      { path: '/:tables', exact: true, component: lazyWithPreload(() => import('@pages/Homepage')) },
      { path: '/table/:id', exact: false, component: lazyWithPreload(() => import('@pages/Viewer')) }
    ],
    redirect: [
      { from: '/', to: '/raw' }
    ],
    preload: 'all'
  },
  // routes if application is set to challenge
  challenge: {
    routes: [
      { path: '/datasets/:datasetId/tables/:tableId', exact: false, component: lazyWithPreload(() => import('@pages/Viewer')) },
      { path: '/datasets', exact: false, component: lazyWithPreload(() => import('@pages/NewHomepage/HomepageChallenge/HomepageChallenge')) }
    ],
    redirect: [],
    preload: 'all'
  },
  // common routes between application modes
  shared: {
    routes: [
      { path: '/404', exact: false, component: lazyWithPreload(() => import('@pages/NotFound/NotFound')) }
    ],
    redirect: [
      { from: '*', to: '/datasets' }
    ],
    preload: 'all'
  }
};

// const { MODE = 'CHALLENGE' } = store.getState().config.app.APP;
const MODE = 'challenge';

/**
 * Get all routes based on mode + common
 */
export const getRoutes = () => {
  return APP_ROUTES[MODE].routes.concat(APP_ROUTES.shared.routes);
};
/**
 * Get all redirects based on mode + common
 */
export const getRedirects = () => {
  return APP_ROUTES[MODE].redirect.concat(APP_ROUTES.shared.redirect);
};

export default APP_ROUTES;
