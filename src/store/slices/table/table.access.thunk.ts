import { createAsyncThunk } from "@reduxjs/toolkit";
import datasetAPI from "@services/api/datasets";
import { updateUI } from "./table.slice";
import { canEditTable } from "./utils/table.access-utils";

const ACTION_PREFIX = "table";

const setViewOnly = (isViewOnly: boolean) =>
  updateUI({ settings: { isViewOnly } });

/**
 * Decide whether the current user edits or only views a table, and take the
 * edit lock when they can edit. The lock is the single source of truth for
 * concurrent editing, owners included. Any failure means view-only.
 * Abort the returned promise to discard the outcome (e.g. on unmount).
 */
export const checkEditAccess = createAsyncThunk(
  `${ACTION_PREFIX}/checkEditAccess`,
  async (
    {
      datasetId,
      tableId,
      userId,
    }: { datasetId: string; tableId: string; userId?: string | number },
    { dispatch, signal },
  ) => {
    try {
      const { data: dataset } = await datasetAPI.getDatasetInfo({ datasetId });

      let tableAcl = null;
      try {
        tableAcl = (await datasetAPI.getTableAcl(datasetId, tableId)).data;
      } catch {
        // fall back to dataset-level rights
      }

      if (!canEditTable(userId, dataset, tableAcl)) {
        dispatch(setViewOnly(true));
        return;
      }

      const lock = await datasetAPI.acquireTableLock(tableId);
      // someone else holding the lock also means view-only
      if (!signal.aborted) dispatch(setViewOnly(lock.data?.acquired !== true));
    } catch {
      if (!signal.aborted) dispatch(setViewOnly(true));
    }
  },
);

/** Release the edit lock, e.g. when leaving the table. Failures are ignored. */
export const releaseTableLock = createAsyncThunk(
  `${ACTION_PREFIX}/releaseTableLock`,
  async ({ tableId }: { tableId: string }) => {
    await datasetAPI.releaseTableLock(tableId).catch(() => {});
  },
);

/** Take the lock over from another user (dataset owners only, server-checked). */
export const forceUnlockTable = createAsyncThunk(
  `${ACTION_PREFIX}/forceUnlockTable`,
  async ({ tableId }: { tableId: string }, { dispatch }) => {
    await datasetAPI.forceReleaseTableLock(tableId);
    const lock = await datasetAPI.acquireTableLock(tableId);
    if (lock.data?.acquired === true) dispatch(setViewOnly(false));
  },
);
