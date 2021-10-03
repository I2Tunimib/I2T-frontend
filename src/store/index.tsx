import { configureStore } from '@reduxjs/toolkit';
import { enablePatches } from 'immer';
import { lastAction } from './middlewares/action.middleware';
import tableReducer from './slices/table/table.slice';
import configReducer from './slices/config/config.slice';
import tablesReducer from './slices/tables/tables.slice';
import actionReducer from './slices/action/action.slice';
import datasetsReducer from './slices/datasets/datasets.slice';

enablePatches();

export const store = configureStore({
  reducer: {
    action: actionReducer,
    config: configReducer,
    tables: tablesReducer,
    datasets: datasetsReducer,
    table: tableReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(lastAction())
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
