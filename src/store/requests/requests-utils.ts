import {
  ActionReducerMapBuilder, AnyAction,
  createSlice, CreateSliceOptions
} from '@reduxjs/toolkit';
import {
  PendingAction, FulfilledAction,
  RejectedAction, IRequest
} from './interfaces/requests';

export const isPendingAction = (action: AnyAction): action is PendingAction => action.type.endsWith('/pending');
export const isFulfilledAction = (action: AnyAction): action is FulfilledAction => action.type.endsWith('/fulfilled');
export const isRejectedAction = (action: AnyAction): action is RejectedAction => action.type.endsWith('/rejected');

interface CreateSliceWithRequestsOptions<T> extends CreateSliceOptions<T> {
  extraRules?: (builder: ActionReducerMapBuilder<T>) => ActionReducerMapBuilder<T>;
}

const handlePendingAction = <T>(state: any, action: any) => {
  const requestId = action.type.split('/')[1];
  state.requests.byId[requestId] = {
    status: 'pending',
    error: null
  };
  if (!state.requests.allIds.find((id: string) => id === requestId)) {
    state.requests.allIds.push(requestId);
  }
};

const handleFulfilledAction = <T>(state: any, action: any) => {
  const requestId = action.type.split('/')[1];
  const { [requestId]: omit, ...rest } = state.requests.byId;
  state.requests.byId = rest;
  state.requests = {
    byId: rest,
    allIds: state.requests.allIds.filter((id: string) => id !== requestId)
  };
};

const handleRejectedAction = <T>(state: any, action: any) => {
  const requestId = action.type.split('/')[1];
  state.requests.byId[requestId] = {
    status: 'error',
    error: action.error
  };
};

/**
 * Reducers which handle requests status.
 * Can be used in the extra reducers section of a store slice.
 */
const handleRequests = <T>(builder: ActionReducerMapBuilder<T>) => builder
  .addMatcher(isPendingAction, (state, action) => handlePendingAction<T>(state, action))
  .addMatcher(isFulfilledAction, (state, action) => handleFulfilledAction<T>(state, action))
  .addMatcher(isRejectedAction, (state, action) => handleRejectedAction<T>(state, action));

const buildExtraReducers = <T>(builder: ActionReducerMapBuilder<T>) => handleRequests(builder);

/**
 * Extension of createSlice.
 * It automatically adds reducers to handle API requests with loading and error states.
 */
export const createSliceWithRequests = <T>(options: CreateSliceWithRequestsOptions<T>) => {
  const { extraRules, ...rest } = options;

  return createSlice({
    ...rest,
    extraReducers: (builder) => (extraRules
      ? buildExtraReducers(extraRules(builder))
      : buildExtraReducers(builder)
    )
  });
};

/**
 * Get request status by ID.
 */
export const getRequestStatus = (
  requests: {
    byId: { [key: string]: IRequest }
  },
  requestId: string
) => {
  const request = requests.byId[requestId];
  if (!request) {
    return { loading: false, error: null };
  }
  if (request.error) {
    return { loading: false, error: request.error };
  }
  return { loading: true, error: request.error };
};
