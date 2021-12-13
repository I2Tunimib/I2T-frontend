import { useEffect } from 'react';
import APP_ROUTES, { getRoutes, LazyExoticComponentWithPreload } from '../../routes';

interface UsePrefetchProps {
  delay: number;
}

export const usePrefetch = ({
  delay
}: Partial<UsePrefetchProps> = {
  delay: 2000
}) => {
  const { preload } = APP_ROUTES.options;

  useEffect(() => {
    if (preload) {
      setTimeout(() => {
        getRoutes().forEach((route) => {
          try {
            const Component = route.component as LazyExoticComponentWithPreload;
            if (Component && Component.preload) {
              Component.preload();
            }
          } catch {
            //
          }
        });
      }, delay);
    }
  }, [preload]);
};

export default usePrefetch;
