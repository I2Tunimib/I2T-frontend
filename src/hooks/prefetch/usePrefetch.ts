import { useEffect } from 'react';
import APP_ROUTES, { getRoutes, LazyExoticComponentWithPreload } from '../../routes';
// import config from '../../config.yaml';

interface UsePrefetchProps {
  delay: number;
}

const MODE = 'challenge';

export const usePrefetch = ({
  delay
}: Partial<UsePrefetchProps> = {
  delay: 2000
}) => {
  // const { MODE = 'CHALLENGE' } = config.APP;
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
