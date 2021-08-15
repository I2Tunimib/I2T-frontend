import { configureStore } from '@reduxjs/toolkit';
import tableReducer from './table/table.slice';
import configReducer from './config/config.slice';

export const store = configureStore({
  reducer: {
    config: configReducer,
    table: tableReducer
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
