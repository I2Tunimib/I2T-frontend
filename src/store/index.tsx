import { configureStore } from '@reduxjs/toolkit';
import { enablePatches } from 'immer';
import tableReducer from './slices/table/table.slice';
import configReducer from './slices/config/config.slice';
import tablesSlice from './slices/tables/tables.slice';

enablePatches();

export const store = configureStore({
  reducer: {
    config: configReducer,
    tables: tablesSlice,
    table: tableReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
