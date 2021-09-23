import { Draft, original } from '@reduxjs/toolkit';
import { ID } from '@store/interfaces/store';
import {
  ColumnState, RowState, TableState, ColumnStatus
} from '../interfaces/table';
import {
  decrementReconciliated, decrementTotal,
  isCellReconciliated, isColumnPartialAnnotated, isColumnReconciliated
} from './table.reconciliation-utils';
import { getCell, getColumn, removeObject } from './table.utils';

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
  const { rows } = state.entities;

  Object.keys(selectedRowsIds).forEach((rowId) => {
    state.entities.columns.allIds.forEach((colId) => {
      const { cells } = rows.byId[rowId];
      const column = getColumn(state, colId);
      const cell = getCell(state, rowId, colId);
      const { reconciliator } = cell.metadata;
      // if cell has metadata
      if (reconciliator.id) {
        // decrement total
        column.reconciliators[reconciliator.id] = {
          ...decrementTotal(column.reconciliators[reconciliator.id])
        };
        // if the cell is also reconciliated, decrement reconciliated
        if (isCellReconciliated(cell)) {
          column.reconciliators[reconciliator.id] = {
            ...decrementReconciliated(column.reconciliators[reconciliator.id])
          };
        }
      }
    });
    // delete row after checking reconciliators for each cell
    state.entities.rows.byId = removeObject(state.entities.rows.byId, rowId);
  });
  // update all ids so that filter is executed only once
  state.entities.rows.allIds = rows.allIds.filter((id) => !(id in selectedRowsIds));

  state.entities.columns.allIds.forEach((colId) => {
    const column = getColumn(state, colId);
    // update column status
    if (isColumnReconciliated(state, colId)) {
      column.status = ColumnStatus.RECONCILIATED;
    } else if (isColumnPartialAnnotated(state, colId)) {
      column.status = ColumnStatus.PENDING;
    } else {
      column.status = ColumnStatus.EMPTY;
    }
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
