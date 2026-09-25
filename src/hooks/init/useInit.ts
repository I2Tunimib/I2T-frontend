import usePrefetch from '@hooks/prefetch/usePrefetch';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectMeStatus } from '@store/slices/auth/auth.selectors';
import { selectGetConfigRequest } from '@store/slices/config/config.selectors';
import { getConfig } from '@store/slices/config/config.thunk';
import { useEffect } from 'react';

interface UseInitProps {
  prefetchDelay?: number;
}

/**
 * Hook to initialize application based on configuration.
 */
const useInit = ({
  prefetchDelay
}: UseInitProps = {}) => {
  // preload routes based on configuration
  usePrefetch();
  const dispatch = useAppDispatch();
  const configStatus = useAppSelector(selectGetConfigRequest);
  // authMe is dispatched by App.tsx's initAuth — read the status here without re-dispatching.
  const meStatus = useAppSelector(selectMeStatus);

  useEffect(() => {
    dispatch(getConfig());
  }, []);

  // Use || so routes only render once BOTH config AND auth have resolved.
  // With &&, routes would render as soon as either finishes — if config is
  // faster than authMe, routes mount with loggedIn=false and the table route
  // redirects to /signin before auth completes.
  return configStatus.loading || meStatus.loading;
};

export default useInit;
