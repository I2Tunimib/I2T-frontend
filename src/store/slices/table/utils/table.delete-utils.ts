import { Draft, original } from '@reduxjs/toolkit';
import {
  ColumnState, RowState,
  ID, TableState, ColumnStatus
} from '../interfaces/table';
import { hasColumnMetadata, isColumnReconciliated, isReconciliatorPresent } from './table.reconciliation-utils';
import { removeObject } from './table.utils';

/**
 * Delete one column by id.
 */
export const deleteOneColumn = (state: Draft<TableState>, colId: ID) => {
  state.entities.columns = {
    byId: removeObject(state.entities.columns.byId, colId),
    allIds: state.entities.columns.allIds.filter((id) => colId !== id)
  };
  state.entities.rows = {
    byId: state.entities.rows.allIds.reduce((acc, rowId) => {
      return {
        ...acc,
        [rowId]: {
          ...state.entities.rows.byId[rowId],
          cells: removeObject(state.entities.rows.byId[rowId].cells, colId)
        }
      };
    }, {}),
    allIds: [...state.entities.rows.allIds]
  };
};

export const deleteOneRow = (state: Draft<TableState>, rowId: ID) => {
  state.entities.rows.byId = removeObject(state.entities.rows.byId, rowId);
  state.entities.rows.allIds = state.entities.rows.allIds.filter((id) => rowId !== id);
};

/**
 * Delete all selected rows.
 */
export const deleteSelectedRows = (state: Draft<TableState>) => {
  const { selectedRowsIds } = state.ui;
  // keep track of which reconciliators are going to be deleted
  // when deleting a cell
  const reconciliatorsToBeDiscarded = new Set<string>();
  Object.keys(selectedRowsIds).forEach((rowId) => {
    state.entities.columns.allIds.forEach((colId) => {
      const { reconciliator } = state.entities.rows.byId[rowId].cells[colId].metadata;
      reconciliatorsToBeDiscarded.add(reconciliator);
    });
    state.entities.rows.byId = removeObject(state.entities.rows.byId, rowId);
  });
  state.entities.rows.allIds = state.entities.rows.allIds.filter((id) => !(id in selectedRowsIds));
  // when a row is deleted check if a column is reconciliated
  state.entities.columns.allIds.forEach((colId) => {
    // check column status after deleting a row
    if (isColumnReconciliated(state, colId)) {
      state.entities.columns.byId[colId].status = ColumnStatus.RECONCILIATED;
    } else if (!hasColumnMetadata(state, colId)) {
      state.entities.columns.byId[colId].status = ColumnStatus.EMPTY;
    }
    // check which reconciliators needs to be discarded
    reconciliatorsToBeDiscarded.forEach((reconToDiscard) => {
      if (!isReconciliatorPresent(state, colId, reconToDiscard)) {
        state.entities.columns.byId[colId].reconciliators = state.entities.columns.byId[colId]
          .reconciliators.filter((item) => item !== reconToDiscard);
      }
    });
  });
};

/**
 * Delete all selected columns.
 */
export const deleteSelectedColumns = (state: Draft<TableState>) => {
  const { selectedColumnsIds } = state.ui;
  Object.keys(selectedColumnsIds).forEach((colId) => {
    deleteOneColumn(state, colId);
  });
};
