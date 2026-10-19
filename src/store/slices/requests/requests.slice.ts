import { AnyAction, createSlice } from "@reduxjs/toolkit";

/**
 * Status of every async thunk, keyed by its full action type prefix
 * (e.g. "table/getTable"), so thunks of different features cannot collide.
 * Any `<prefix>/pending|fulfilled|rejected` action updates its entry.
 */
export interface RequestEntry {
  status: "pending" | "done";
  error: any;
}

export interface RequestsState {
  byType: Record<string, RequestEntry>;
}

const initialState: RequestsState = { byType: {} };

const REQUEST_SUFFIX = /\/(pending|fulfilled|rejected)$/;
const typePrefix = (action: AnyAction) =>
  action.type.replace(REQUEST_SUFFIX, "");
const hasSuffix = (suffix: string) => (action: AnyAction) =>
  typeof action.type === "string" && action.type.endsWith(`/${suffix}`);

// Kept as a string, not imported from the table slice, to avoid a cycle.
const TABLE_RESTORE_INITIAL_STATE = "table/restoreInitialState";
const TABLE_PREFIX = "table/";

export const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addMatcher(hasSuffix("pending"), (state, action) => {
        state.byType[typePrefix(action)] = { status: "pending", error: null };
      })
      .addMatcher(hasSuffix("fulfilled"), (state, action) => {
        state.byType[typePrefix(action)] = { status: "done", error: null };
      })
      .addMatcher(hasSuffix("rejected"), (state, action) => {
        state.byType[typePrefix(action)] = {
          status: "done",
          error: action?.payload?.error || action.error,
        };
      })
      // leaving a table forgets the status of the table requests
      .addMatcher(
        (action: AnyAction) => action.type === TABLE_RESTORE_INITIAL_STATE,
        (state) => {
          Object.keys(state.byType)
            .filter((type) => type.startsWith(TABLE_PREFIX))
            .forEach((type) => delete state.byType[type]);
        },
      ),
});

export default requestsSlice.reducer;
