import { useCallback, useRef, useState } from 'react';

const useShouldUnmount = (timer: number) => {
  const [state, setState] = useState(true);
  const timerRef = useRef<any | null>(null);

  const startUnmount = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setState(true);
    }, timer);
  }, []);

  return {
    shouldRender: state,
    startUnmount
  };
};

export default useShouldUnmount;
