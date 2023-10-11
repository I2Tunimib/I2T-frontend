import { configureStore } from '@reduxjs/toolkit';
import { enablePatches } from 'immer';
import { lastAction } from './middlewares/action.middleware';
import tableReducer from './slices/table/table.slice';
import configReducer from './slices/config/config.slice';
import actionReducer from './slices/action/action.slice';
import datasetsReducer from './slices/datasets/datasets.slice';
import authReducer from './slices/auth/auth.slice';

enablePatches();

export const store = configureStore({
  reducer: {
    action: actionReducer,
    config: configReducer,
    datasets: datasetsReducer,
    table: tableReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }).concat(lastAction())
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
