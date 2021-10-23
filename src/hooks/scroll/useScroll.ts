import {
  useCallback, useEffect,
  useRef, useState
} from 'react';

interface UseScrollProps {
  threshold: number
}

interface UseScrollState {
  scrollTop: number;
  overpass: boolean;
}

const useScroll = (props: UseScrollProps = {
  threshold: 0
}) => {
  const { threshold } = props;

  const [state, setState] = useState<UseScrollState>({
    scrollTop: 0,
    overpass: false
  });
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((event: any) => {
    setState({
      scrollTop: event.currentTarget.scrollTop,
      overpass: (event.currentTarget.scrollTop as number) > threshold
    });
  }, []);

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.addEventListener('scroll', handleScroll);
    }
    return () => ref.current?.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return {
    ref,
    state
  };
};

export default useScroll;
