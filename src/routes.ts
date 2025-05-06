import { RouteProps } from '@components/core/Route';
import {
  ComponentType, lazy,
  LazyExoticComponent
} from 'react';
import { RedirectProps } from 'react-router-dom';
import { store } from './store';

export type LazyExoticComponentWithPreload = LazyExoticComponent<any>
  & { preload?: () => Promise<{ default: ComponentType<any> }> };

const lazyWithPreload = (factory: () => Promise<{ default: ComponentType<any> }>) => {
  const Component = lazy(factory) as LazyExoticComponentWithPreload;
  Component.preload = factory;
  return Component;
};

interface AppRoutes {
  routes: RouteProps[];
  redirect: RedirectProps[];
  options: RouteOptions;
}

interface RouteOptions {
  preload: 'all'
}

/**
 * Applciation routes.
 */
const APP_ROUTES: AppRoutes = {
  routes: [
    { path: '/', exact: true, component: lazyWithPreload(() => import('@pages/Homepage/Homepage')) },
    { path: '/signin', exact: true, redirectWhen: ({ loggedIn }) => loggedIn, redirectTo: '/datasets', component: lazyWithPreload(() => import('@pages/Login')) },
    { path: '/signup', exact: true, redirectWhen: ({ loggedIn }) => loggedIn, redirectTo: '/datasets', component: lazyWithPreload(() => import('@pages/SignUp')) },
    { path: '/datasets/:datasetId/tables/:tableId', redirectWhen: ({ loggedIn }) => !loggedIn, redirectTo: '/signin', exact: false, component: lazyWithPreload(() => import('@pages/Viewer')) },
    { path: '/datasets', exact: false, redirectWhen: ({ loggedIn }) => !loggedIn, redirectTo: '/signin', component: lazyWithPreload(() => import('@pages/Dashboard/Dashboard')) },
    { path: '/404', exact: false, component: lazyWithPreload(() => import('@pages/NotFound/NotFound')) }
  ],
  redirect: [
    { from: '*', to: '/datasets' }
  ],
  options: {
    preload: 'all'
  }
};

/**
 * Get all routes based on mode + common
 */
export const getRoutes = () => {
  return APP_ROUTES.routes;
};
/**
 * Get all redirects based on mode + common
 */
export const getRedirects = () => {
  return APP_ROUTES.redirect;
};

export default APP_ROUTES;
