import { Draft } from "@reduxjs/toolkit";
import { ID } from "@store/interfaces/store";
import { TableState } from "../interfaces/table";
import {
  decrementContextReconciliated,
  decrementContextTotal,
  getCellContext,
  getColumnStatus,
  isCellReconciliated,
} from "./table.reconciliation-utils";
import { getCell, getColumn, removeObject } from "./table.utils";

/**
 * Delete one column by id.
 */
export const deleteOneColumn = (state: Draft<TableState>, colId: ID) => {
  state.entities.columns = {
    byId: removeObject(state.entities.columns.byId, colId),
    allIds: state.entities.columns.allIds.filter((id) => colId !== id),
  };
  state.entities.rows = {
    byId: state.entities.rows.allIds.reduce((acc, rowId) => {
      return {
        ...acc,
        [rowId]: {
          ...state.entities.rows.byId[rowId],
          cells: removeObject(state.entities.rows.byId[rowId].cells, colId),
        },
      };
    }, {}),
    allIds: [...state.entities.rows.allIds],
  };
};

export const deleteOneRow = (state: Draft<TableState>, rowId: ID) => {
  state.entities.rows.byId = removeObject(state.entities.rows.byId, rowId);
  state.entities.rows.allIds = state.entities.rows.allIds.filter(
    (id) => rowId !== id
  );
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
      const cellContext = getCellContext(cell);
      // if cell has metadata
      if (cellContext) {
        // decrement total
        column.context[cellContext] = decrementContextTotal(
          column.context[cellContext]
        );
        // if the cell is also reconciliated, decrement reconciliated
        if (isCellReconciliated(cell)) {
          column.context[cellContext] = decrementContextReconciliated(
            column.context[cellContext]
          );
        }
      }
    });
    // delete row after checking reconciliators for each cell
    state.entities.rows.byId = removeObject(state.entities.rows.byId, rowId);
  });
  // update all ids so that filter is executed only once
  state.entities.rows.allIds = rows.allIds.filter(
    (id) => !(id in selectedRowsIds)
  );

  state.entities.columns.allIds.forEach((colId) => {
    const column = getColumn(state, colId);
    // update column status
    column.status = getColumnStatus(state, colId);
  });
};

/**
 * Delete all selected columns.
 */
export const deleteSelectedColumns = (state: Draft<TableState>) => {
  const { selectedColumnsIds } = state.ui;
  Object.keys(selectedColumnsIds).forEach((colId) => {
    // Track the deleted column before deleting it
    const columnToDelete = state.entities.columns.byId[colId];
    if (columnToDelete) {
      state.ui.deletedColumnsIds[colId] = columnToDelete.label || colId;
    }
    deleteOneColumn(state, colId);
  });
};
