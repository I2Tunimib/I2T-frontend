import { useEffect, useRef } from 'react';

const useIsMounted = () => {
  const isMountedRef = useRef<boolean>();
  useEffect(() => {
    if (isMountedRef && isMountedRef.current) {
      isMountedRef.current = true;
    }
    return () => {
      isMountedRef.current = false;
    };
  });
  return isMountedRef;
};

export default useIsMounted;
