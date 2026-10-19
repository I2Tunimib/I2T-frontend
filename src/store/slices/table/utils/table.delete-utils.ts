import { Draft } from "@reduxjs/toolkit";
import { ID } from "@store/interfaces/store";
import { TableState } from "../interfaces/table";

type State = Draft<TableState>;

// These only remove things. The columns' contexts, statuses and the table
// totals depend on what is left: callers refresh them afterwards.

/**
 * Delete one column by id. Its label is remembered so the backend can be told
 * which columns were deleted when the table is saved.
 */
export const deleteOneColumn = (state: State, colId: ID) => {
  const { columns, rows } = state.entities;
  const column = columns.byId[colId];
  if (column) {
    state.ui.deletedColumnsIds[colId] = column.label || colId;
  }
  delete columns.byId[colId];
  columns.allIds = columns.allIds.filter((id) => id !== colId);
  rows.allIds.forEach((rowId) => {
    delete rows.byId[rowId].cells[colId];
  });
};

export const deleteOneRow = (state: State, rowId: ID) => {
  const { rows } = state.entities;
  delete rows.byId[rowId];
  rows.allIds = rows.allIds.filter((id) => id !== rowId);
};

export const deleteSelectedColumns = (state: State) => {
  Object.keys(state.ui.selectedColumnsIds).forEach((colId) => {
    deleteOneColumn(state, colId);
  });
};

export const deleteSelectedRows = (state: State) => {
  Object.keys(state.ui.selectedRowsIds).forEach((rowId) => {
    deleteOneRow(state, rowId);
  });
};
