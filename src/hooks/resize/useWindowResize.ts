import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

const useWindowDimension = () => {
  const [dimension, setDimension] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  });
  useEffect(() => {
    const debouncedResizeHandler = debounce(() => {
      setDimension({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      });
    }, 100);
    window.addEventListener('resize', debouncedResizeHandler);

    return () => window.removeEventListener('resize', debouncedResizeHandler);
  }, []);
  return dimension;
};

export default useWindowDimension;
