import usePrefetch from '@hooks/prefetch/usePrefetch';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectMeStatus } from '@store/slices/auth/auth.selectors';
import { authMe } from '@store/slices/auth/auth.thunk';
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
  const meStatus = useAppSelector(selectMeStatus);

  useEffect(() => {
    dispatch(authMe());
    dispatch(getConfig());
  }, []);

  return configStatus.loading && meStatus.loading;
};

export default useInit;
