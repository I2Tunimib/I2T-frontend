import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@store";
import type { RequestEntry } from "./requests.slice";

export interface RequestStatus {
  /** undefined until the request has been started once. */
  loading: undefined | boolean;
  error: any;
}

export const toRequestStatus = (entry?: RequestEntry): RequestStatus => {
  if (!entry) return { loading: undefined, error: null };
  if (entry.status === "done") {
    return { loading: false, error: entry.error || null };
  }
  return { loading: true, error: entry.error };
};

/**
 * Selector of the status of one thunk.
 *
 * @example
 * export const selectGetTableStatus = createRequestStatusSelector(getTable);
 */
export const createRequestStatusSelector = (thunk: { typePrefix: string }) =>
  createSelector(
    (state: RootState) => state.requests.byType[thunk.typePrefix],
    toRequestStatus,
  );
