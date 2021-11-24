import {
  ActionReducerMapBuilder, AnyAction,
  createSlice, AsyncThunk, CreateSliceOptions, SliceCaseReducers
} from '@reduxjs/toolkit';
import { NoInfer } from '@reduxjs/toolkit/dist/tsHelpers';

/**
 * State slice which includes states for requests.
 */
export interface RequestEnhancedState {
  _requests: {
    byId: Record<string, Request>;
    allIds: string[];
  }
}

/**
 * A request entry which has a status and error.
 */
export interface Request {
  status: 'pending' | 'done';
  error: any;
}

interface RequestStatusSelector {
  loading: undefined | boolean;
  error: any;
}

/**
 * Type of a generic async thunk.
 */
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>
/**
 * Type of a pending action.
 */
export type PendingAction = ReturnType<GenericAsyncThunk['pending']>
/**
 * Type of a rejected action.
 */
export type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
/**
 * Type of a fulfilled action.
 */
export type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

/**
 * Extension of CreateSliceOptions with 'extraRules'
 */
export interface CreateSliceWithRequestsOptions
<State = any, CR
extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string>
extends CreateSliceOptions<State, CR, Name> {
  extraRules?: (builder: ActionReducerMapBuilder<State>) => ActionReducerMapBuilder<State>;
}

/**
 * Matcher for pendings actions request
 */
export const isPendingAction = (action: AnyAction): action is PendingAction => action.type.endsWith('/pending');
/**
 * Matcher for fulfilled actions request
 */
export const isFulfilledAction = (action: AnyAction): action is FulfilledAction => action.type.endsWith('/fulfilled');
/**
 * Matcher for fulfilled actions request
 */
export const isRejectedAction = (action: AnyAction): action is RejectedAction => action.type.endsWith('/rejected');

const handlePendingAction = <T>(state: any, action: any) => {
  const requestId = action.type.split('/')[1];
  state._requests.byId[requestId] = {
    status: 'pending',
    error: null
  };
  if (!state._requests.allIds.find((id: string) => id === requestId)) {
    state._requests.allIds.push(requestId);
  }
};

const handleFulfilledAction = <T>(state: any, action: any) => {
  const requestId = action.type.split('/')[1];
  state._requests.byId[requestId] = {
    status: 'done',
    error: null
  };
  // const { [requestId]: omit, ...rest } = state._requests.byId;
  // state._requests.byId = rest;
  // state._requests = {
  //   byId: rest,
  //   allIds: state._requests.allIds.filter((id: string) => id !== requestId)
  // };
};

const handleRejectedAction = <T>(state: any, action: any) => {
  const requestId = action.type.split('/')[1];
  state._requests.byId[requestId] = {
    status: 'done',
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
export const createSliceWithRequests = <T, CR extends SliceCaseReducers<T>, Name extends string>(
  options: CreateSliceWithRequestsOptions<T, CR, Name>) => {
  const { extraRules, name, ...rest } = options;

  return createSlice({
    name: name as Name,
    ...rest,
    extraReducers: (builder) => (extraRules
      ? buildExtraReducers(extraRules(builder))
      : buildExtraReducers(builder)
    )
  });
};

export const _getSliceWithRequestsConfig = <T>(
  extraRules: (builder: ActionReducerMapBuilder<T>) => ActionReducerMapBuilder<T>
) => {
  return {
    extraReducers: (builder: ActionReducerMapBuilder<NoInfer<T>>) => (extraRules
      ? buildExtraReducers(extraRules(builder))
      : buildExtraReducers(builder)
    )
  };
};

/**
 * Get request status by ID.
 */
export const getRequestStatus = (
  requests: {
    byId: { [key: string]: Request }
  },
  requestId: string
): RequestStatusSelector => {
  const request = requests.byId[requestId];
  if (!request) {
    return { loading: undefined, error: null };
  }
  if (request.status === 'done') {
    if (request.error) {
      return { loading: false, error: request.error };
    }
    return { loading: false, error: null };
  }
  return { loading: true, error: request.error };
};
