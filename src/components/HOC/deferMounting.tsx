import { ComponentType, useEffect, useState } from 'react';

type StateProps = {
  shouldRender: boolean;
}

/**
 * Allows two animation frames to complete to allow other components to update
 * and re-render before mounting and rendering an expensive `WrappedComponent`.
 */
function deferMounting <T>(WrappedComponent: ComponentType<T>) {
  return (props: T) => {
    const [state, setState] = useState<StateProps>({ shouldRender: false });

    useEffect(() => {
      let refA = 0;
      let refB = 0;
      refA = requestAnimationFrame(() => {
        refB = requestAnimationFrame(() => setState({ shouldRender: true }));
      });
      // cleanup function
      return () => {
        cancelAnimationFrame(refA);
        cancelAnimationFrame(refB);
      };
    }, []);

    return state.shouldRender
      ? <WrappedComponent {...props} />
      : null;
  };
}

export default deferMounting;
