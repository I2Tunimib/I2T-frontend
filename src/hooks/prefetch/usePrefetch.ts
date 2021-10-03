import { useEffect } from 'react';
import APP_ROUTES, { getRoutes, LazyExoticComponentWithPreload } from '@root/routes';
import config from '@root/config.yaml';

interface UsePrefetchProps {
  delay: number;
}

export const usePrefetch = ({
  delay
}: Partial<UsePrefetchProps> = {
  delay: 2000
}) => {
  const { MODE } = config.APP;
  const preloadConf = APP_ROUTES[MODE].preload;

  useEffect(() => {
    if (preloadConf) {
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
  }, [preloadConf]);
};

export default usePrefetch;
