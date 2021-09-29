import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { setAction } from '@store/slices/action/action.slice';

export const lastAction = (): Middleware<
{}, // Most middleware do not modify the dispatch return value
any
> => {
  return (store) => (next) => (action) => {
    if (action.type !== 'action/setAction') {
      store.dispatch(setAction(action.type));
    }
    return next(action);
  };
};
