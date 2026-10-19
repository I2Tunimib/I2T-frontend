import { configureStore } from '@reduxjs/toolkit';
import tableReducer from './slices/table/table.slice';
import configReducer from './slices/config/config.slice';
import datasetsReducer from './slices/datasets/datasets.slice';
import authReducer from './slices/auth/auth.slice';
import requestsReducer from './slices/requests/requests.slice';
import { listenerMiddleware } from './slices/table/table.listeners';

export const store = configureStore({
  reducer: {
    config: configReducer,
    datasets: datasetsReducer,
    table: tableReducer,
    auth: authReducer,
    requests: requestsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).prepend(
      listenerMiddleware.middleware
    ),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
