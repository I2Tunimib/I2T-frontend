import { FC } from 'react';

export function assertFC<T>(component: FC<T>): asserts component is FC<T> {
  // We don't need to do anything here because the assertion happens
  // on the type level - we need to pass a valid React component
}
