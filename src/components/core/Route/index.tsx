import { useAppSelector } from '@hooks/store';
import { selectIsLoggedIn } from '@store/slices/auth/auth.selectors';
import { Route as ReactRouterRoute, Redirect, RouteProps as ReactRouterRouteProps } from 'react-router-dom';

export type RouteProps = ReactRouterRouteProps & {
  redirectWhen?: ({ loggedIn }: { loggedIn: boolean }) => boolean;
  redirectTo?: string;
}

const Route = ({ redirectWhen, redirectTo, ...routeProps }: RouteProps) => {
  const { loggedIn } = useAppSelector(selectIsLoggedIn);

  if (redirectWhen && redirectWhen({ loggedIn })) {
    return <Redirect to={redirectTo} />;
  }

  return <ReactRouterRoute {...routeProps} />;
};

export default Route;
