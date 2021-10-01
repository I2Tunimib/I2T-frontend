import {
  ComponentType, lazy,
  LazyExoticComponent
} from 'react';
import { RedirectProps, RouteProps } from 'react-router-dom';

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
      { path: '', exact: false, component: lazyWithPreload(() => import('@pages/HomepageDataset')) }
    ],
    redirect: [],
    preload: 'all'
  },
  // common routes between application modes
  common: {
    routes: [],
    redirect: [
      { from: '*', to: '/' }
    ],
    preload: 'all'
  }
};

/**
 * Get all routes based on mode + common
 */
export const getRoutes = (appMode: 'standard' | 'challenge') => {
  return APP_ROUTES[appMode].routes.concat(APP_ROUTES.common.routes);
};
/**
 * Get all redirects based on mode + common
 */
export const getRedirects = (appMode: 'standard' | 'challenge') => {
  return APP_ROUTES[appMode].redirect.concat(APP_ROUTES.common.redirect);
};

export default APP_ROUTES;
