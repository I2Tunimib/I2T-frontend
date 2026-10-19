import { Draft } from "@reduxjs/toolkit";
import { isEmptyObject } from "@services/utils/objects-utils";
import { ID } from "@store/interfaces/store";
import { TableState } from "../interfaces/table";
import { removeObject, getIdsFromCell } from "./table.utils";

type State = Draft<TableState>;

const cellIdOf = (rowId: ID, colId: ID) => `${rowId}$${colId}`;

/** A column counts as selected once all of its cells are. */
const isColumnSelected = (state: State, colId: ID) => {
  const selectedInColumn = Object.keys(state.ui.selectedCellIds).filter(
    (id) => getIdsFromCell(id)[1] === colId,
  );
  return selectedInColumn.length === state.entities.rows.allIds.length;
};

const areAllColumnsSelected = (state: State) =>
  state.entities.columns.allIds.every(
    (colId) => colId in state.ui.selectedColumnsIds,
  );

const selectCell = (state: State, cellId: ID) => {
  state.ui.selectedCellIds[cellId] = true;
};
const deselectCell = (state: State, cellId: ID) => {
  state.ui.selectedCellIds = removeObject(state.ui.selectedCellIds, cellId);
};

const selectColumn = (state: State, colId: ID) => {
  state.ui.selectedColumnsIds[colId] = true;
};
const deselectColumn = (state: State, colId: ID) => {
  state.ui.selectedColumnsIds = removeObject(
    state.ui.selectedColumnsIds,
    colId,
  );
};

const deselectRow = (state: State, rowId: ID) => {
  state.ui.selectedRowsIds = removeObject(state.ui.selectedRowsIds, rowId);
};
const selectAllRows = (state: State) => {
  state.ui.selectedRowsIds = Object.fromEntries(
    state.entities.rows.allIds.map((rowId) => [rowId, true]),
  );
};

/** Forget every selection (columns, column cells, cells and rows). */
const clearSelection = (state: State) => {
  state.ui.selectedColumnsIds = {};
  state.ui.selectedColumnCellsIds = {};
  state.ui.selectedCellIds = {};
  state.ui.selectedRowsIds = {};
};

/**
 * Select a column with its cells, keeping only the cells of the other
 * selected columns. When every column is selected, every row is too.
 */
const selectColumnWithCells = (state: State, colId: ID) => {
  selectColumn(state, colId);
  state.ui.selectedRowsIds = {};
  state.ui.selectedCellIds = Object.fromEntries(
    Object.keys(state.ui.selectedCellIds)
      .filter((cellId) => getIdsFromCell(cellId)[1] in state.ui.selectedColumnsIds)
      .map((cellId) => [cellId, true]),
  );
  state.entities.rows.allIds.forEach((rowId) => {
    selectCell(state, cellIdOf(rowId, colId));
  });
  if (areAllColumnsSelected(state)) {
    selectAllRows(state);
  }
};

/** Deselect a column, its cells and any selected row. */
const deselectColumnWithCells = (state: State, colId: ID) => {
  deselectColumn(state, colId);
  state.entities.rows.allIds.forEach((rowId) => {
    if (rowId in state.ui.selectedRowsIds) {
      deselectRow(state, rowId);
    }
    deselectCell(state, cellIdOf(rowId, colId));
  });
};

/** Select a row and its cells, and the columns this completes. */
const selectRowWithCells = (state: State, rowId: ID) => {
  state.ui.selectedRowsIds[rowId] = true;
  state.entities.columns.allIds.forEach((colId) => {
    selectCell(state, cellIdOf(rowId, colId));
    if (isColumnSelected(state, colId)) {
      selectColumn(state, colId);
    }
  });
};

/** Deselect a row and its cells; its columns are no longer complete. */
const deselectRowWithCells = (state: State, rowId: ID) => {
  deselectRow(state, rowId);
  state.entities.columns.allIds.forEach((colId) => {
    deselectCell(state, cellIdOf(rowId, colId));
    deselectColumn(state, colId);
  });
};

// Used by deleteSelected: only whole rows and/or columns may be selected.

export const areOnlyRowsSelected = (state: State) =>
  !isEmptyObject(state.ui.selectedRowsIds) &&
  isEmptyObject(state.ui.selectedColumnsIds);

export const areRowsColumnsSelected = (state: State) =>
  !isEmptyObject(state.ui.selectedCellIds) &&
  Object.keys(state.ui.selectedCellIds).every((cellId) => {
    const [rowId, colId] = getIdsFromCell(cellId);
    return rowId in state.ui.selectedRowsIds || colId in state.ui.selectedColumnsIds;
  });

// Plain selection: replace the current selection.

export const selectOneCell = (state: State, cellId: ID) => {
  clearSelection(state);
  state.ui.selectedCellIds = { [cellId]: true };
};

/** Selecting the selected column again deselects everything. */
export const selectOneColumn = (state: State, colId: ID) => {
  const wasSelected = !!state.ui.selectedColumnsIds[colId];
  clearSelection(state);
  if (!wasSelected) {
    selectColumnWithCells(state, colId);
  }
};

/** Like selectOneColumn, also flagging the column as a column-cells selection. */
export const selectOneColumnCell = (state: State, colId: ID) => {
  const wasSelected = !!state.ui.selectedColumnCellsIds[colId];
  clearSelection(state);
  if (!wasSelected) {
    selectColumnWithCells(state, colId);
    state.ui.selectedColumnCellsIds[colId] = true;
  }
};

/** Selecting a row deselects the rest, apart from column-cells selections. */
export const selectOneRow = (state: State, rowId: ID) => {
  state.ui.selectedRowsIds = { [rowId]: true };
  state.ui.selectedCellIds = {};
  state.ui.selectedColumnsIds = {};
  state.entities.columns.allIds.forEach((colId) => {
    selectCell(state, cellIdOf(rowId, colId));
    if (isColumnSelected(state, colId)) {
      selectColumn(state, colId);
    }
  });
};

// Multi selection: add to / remove from the current selection.

export const toggleColumnSelection = (state: State, colId: ID) => {
  if (colId in state.ui.selectedColumnsIds) {
    deselectColumnWithCells(state, colId);
  } else {
    selectColumnWithCells(state, colId);
  }
};

export const toggleColumnCellsSelection = (state: State, colId: ID) => {
  if (colId in state.ui.selectedColumnCellsIds) {
    deselectColumnWithCells(state, colId);
    state.ui.selectedColumnCellsIds = removeObject(
      state.ui.selectedColumnCellsIds,
      colId,
    );
  } else {
    selectColumnWithCells(state, colId);
    state.ui.selectedColumnCellsIds[colId] = true;
  }
};

export const toggleRowSelection = (state: State, rowId: ID) => {
  if (rowId in state.ui.selectedRowsIds) {
    deselectRowWithCells(state, rowId);
  } else {
    selectRowWithCells(state, rowId);
  }
};

/** Deselecting a cell also deselects its column and row. */
export const toggleCellSelection = (state: State, cellId: ID) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  if (cellId in state.ui.selectedCellIds) {
    deselectCell(state, cellId);
    if (colId in state.ui.selectedColumnsIds) {
      deselectColumn(state, colId);
    }
    if (rowId in state.ui.selectedRowsIds) {
      deselectRow(state, rowId);
    }
  } else {
    selectCell(state, cellId);
    if (isColumnSelected(state, colId)) {
      selectColumn(state, colId);
    }
  }
};
