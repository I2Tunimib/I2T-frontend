import usePrefetch from '@hooks/prefetch/usePrefetch';
import { useAppDispatch, useAppSelector } from '@hooks/store';
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
  const { loading } = useAppSelector(selectGetConfigRequest);

  useEffect(() => {
    dispatch(getConfig());
  }, []);

  return loading;
};

export default useInit;
