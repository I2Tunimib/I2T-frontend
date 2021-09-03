import React, { useState, useEffect, useRef } from 'react';

type Callback = (...params: any) => void | undefined;

const useInterval = (callback: Callback, delay: number) => {
  const savedCallback = useRef<Callback>();

  // Remember the latest callback.
  useEffect(() => {
    if (savedCallback) {
      savedCallback.current = callback;
    }
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const tick = () => {
      if (savedCallback && savedCallback.current) {
        savedCallback.current();
      }
    };
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useInterval;
