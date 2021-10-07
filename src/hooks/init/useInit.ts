import usePrefetch from '@hooks/prefetch/usePrefetch';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectGetConfigRequest } from '@store/slices/config/config.selectors';
import { getConfig } from '@store/slices/config/config.thunk';
import { useEffect } from 'react';

interface UseInitProps {
  mode: 'standard' | 'challenge';
  prefetchDelay?: number;
}

/**
 * Hook to initialize application based on configuration.
 */
const useInit = ({
  mode,
  prefetchDelay
}: UseInitProps) => {
  // preload routes based on configuration
  usePrefetch();
  const dispatch = useAppDispatch();

  let initializing: boolean | undefined = false;

  if (mode === 'standard') {
    const { loading } = useAppSelector(selectGetConfigRequest);
    initializing = loading;
  }

  useEffect(() => {
    if (mode === 'standard') {
      dispatch(getConfig());
    }
  }, [mode]);

  return initializing;
};

export default useInit;
