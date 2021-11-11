import { Draft } from '@reduxjs/toolkit';
import { isEmptyObject } from '@services/utils/objects-utils';
import { ID } from '@store/interfaces/store';
import { TableState } from '../interfaces/table';
import { addObject, removeObject, getIdsFromCell } from './table.utils';

/**
 * Check if a column is selected.
 */
export const isColumnSelected = (state: Draft<TableState>, colId: ID) => {
  const cellsOfColumn = Object.keys(state.ui.selectedCellIds)
    .filter((id) => id.endsWith(colId));
  return cellsOfColumn.length === state.entities.rows.allIds.length;
};

/**
 * Check if all columns are selected.
 */
export const areAllColumnsSelected = (state: Draft<TableState>) => {
  return state.entities.columns.allIds
    .every((colId) => colId in state.ui.selectedColumnsIds);
};

export const areOnlyRowsSelected = (state: Draft<TableState>) => {
  return !isEmptyObject(state.ui.selectedRowsIds) && isEmptyObject(state.ui.selectedColumnsIds);
};

/**
 * Check if only rows and columns are selected.
 */
export const areRowsColumnsSelected = (state: Draft<TableState>) => {
  return !isEmptyObject(state.ui.selectedCellIds)
  && Object.keys(state.ui.selectedCellIds).every((cellId) => (
    getIdsFromCell(cellId)[0] in state.ui.selectedRowsIds
    || getIdsFromCell(cellId)[1] in state.ui.selectedColumnsIds
  ));
};

/**
 * Select one cell.
 * When a cell is selected without multi select, deselect all other things
 * and select only that cell.
 */
export const selectOneCell = (state: Draft<TableState>, cellId: ID) => {
  state.ui.selectedCellIds = addObject({}, { [cellId]: true });
  state.ui.selectedColumnsIds = {};
  state.ui.selectedColumnCellsIds = {};
  state.ui.selectedRowsIds = {};
};
/**
 * Select a cell.
 */
export const selectCell = (state: Draft<TableState>, cellId: ID) => {
  state.ui.selectedCellIds[cellId] = true;
};
/**
 * Deselect a cell.
 */
export const deselectCell = (state: Draft<TableState>, cellId: ID) => {
  state.ui.selectedCellIds = removeObject(state.ui.selectedCellIds, cellId);
};
/**
 * Select all cells.
 * This doesn't include rows or columns.
 */
export const selectAllCells = (state: Draft<TableState>) => {
  state.ui.selectedCellIds = state.entities.columns.allIds
    .reduce((acc, colId) => ({
      ...state.entities.rows.allIds.reduce((accRow, rowId) => ({
        ...accRow,
        [`${rowId}$${colId}`]: true
      }), {})
    }), {});
};

/**
 * Select a column.
 */
export const selectColumn = (state: Draft<TableState>, colId: ID) => {
  state.ui.selectedColumnsIds[colId] = true;
};
/**
 * Deselect a column.
 */
export const deselectColumn = (state: Draft<TableState>, colId: ID) => {
  state.ui.selectedColumnsIds = removeObject(state.ui.selectedColumnsIds, colId);
};
/**
 * Select all columns.
 * This doesn't include cells.
 */
export const selectAllColumns = (state: Draft<TableState>) => {
  state.ui.selectedColumnsIds = state.entities.columns.allIds.reduce((acc, colId) => ({
    ...acc,
    [colId]: true
  }), {});
};

/**
 * Select a row.
 */
export const selectRow = (state: Draft<TableState>, rowId: ID) => {
  state.ui.selectedRowsIds[rowId] = true;
};
/**
 * Deselect a row.
 */
export const deselectRow = (state: Draft<TableState>, rowId: ID) => {
  state.ui.selectedRowsIds = removeObject(state.ui.selectedRowsIds, rowId);
};
/**
 * Select all rows.
 * This doesn't include cells.
 */
export const selectAllRows = (state: Draft<TableState>) => {
  state.ui.selectedRowsIds = state.entities.rows.allIds.reduce((acc, rowId) => ({
    ...acc,
    [rowId]: true
  }), {});
};

/**
 * Select everything.
 */
export const selectAll = (state: Draft<TableState>) => {
  selectAllColumns(state);
  selectAllRows(state);
  selectAllCells(state);
};

/**
 * Select a column with its cells.
 * When selecting a column keep only cells of other selected columns.
 */
export const selectColumnWithCells = (state: Draft<TableState>, colId: ID) => {
  selectColumn(state, colId);
  state.ui.selectedRowsIds = {};
  // keep only cells in selected columns
  state.ui.selectedCellIds = Object.keys(state.ui.selectedCellIds).reduce((acc, cellId) => {
    const [_, colIdTmp] = getIdsFromCell(cellId);
    return colIdTmp in state.ui.selectedColumnsIds ? {
      ...acc,
      [cellId]: true
    } : acc;
  }, {});
  // add cells from current selected column
  state.entities.rows.allIds.forEach((rowId) => {
    state.ui.selectedCellIds[`${rowId}$${colId}`] = true;
  });

  if (areAllColumnsSelected(state)) {
    selectAllRows(state);
  }
};

/**
 * Deselect a column with its cells.
 * When deselecting a column also deselect each row (if it selected)
 */
export const deselectColumnWithCells = (state: Draft<TableState>, colId: ID) => {
  deselectColumn(state, colId);
  state.entities.rows.allIds.forEach((rowId) => {
    if (rowId in state.ui.selectedRowsIds) {
      deselectRow(state, rowId);
    }
    deselectCell(state, `${rowId}$${colId}`);
  });
};

export const selectColumnCell = (state: Draft<TableState>, colId: ID) => {
  // state.ui.selectedColumnsIds = {};
  // state.ui.selectedColumnCellsIds = {};
  // state.ui.selectedCellIds = {};
  state.ui.selectedColumnCellsIds[colId] = true;
  // state.entities.rows.allIds.forEach((rowId) => {
  //   if (rowId in state.ui.selectedRowsIds) {
  //     deselectRow(state, rowId);
  //   }
  //   deselectCell(state, `${rowId}$${colId}`);
  // });
};

export const deselectColumnCell = (state: Draft<TableState>, colId: ID) => {
  state.ui.selectedColumnCellsIds = removeObject(state.ui.selectedColumnCellsIds, colId);
  // state.entities.rows.allIds.forEach((rowId) => {
  //   if (rowId in state.ui.selectedRowsIds) {
  //     deselectRow(state, rowId);
  //   }
  //   deselectCell(state, `${rowId}$${colId}`);
  // });
};

export const selectOneColumnCell = (state: Draft<TableState>, colId: ID) => {
  state.ui.selectedColumnsIds = {};
  state.ui.selectedColumnCellsIds = {};
  state.ui.selectedCellIds = {};
  state.ui.selectedColumnCellsIds[colId] = true;
};

/**
 * Select one column.
 * When a column is selected without multi select, deselect all other things
 * and select only that column.
 */
export const selectOneColumn = (state: Draft<TableState>, colId: ID) => {
  state.ui.selectedColumnsIds = {};
  state.ui.selectedColumnCellsIds = {};
  state.ui.selectedRowsIds = {};
  selectColumnWithCells(state, colId);
};

/**
 * Select one row.
 * When selecting a single row everything else should be deselected.
 */
export const selectOneRow = (state: Draft<TableState>, rowId: ID) => {
  state.ui.selectedRowsIds = addObject({}, { [rowId]: true });
  state.ui.selectedCellIds = {};
  state.ui.selectedColumnsIds = {};
  state.entities.columns.allIds.forEach((colId) => {
    selectCell(state, `${rowId}$${colId}`);
    if (isColumnSelected(state, colId)) {
      selectColumn(state, colId);
    }
  });
};

/**
 * Select a row.
 * Select a row and its cells. When selecting check if a column should be selected.
 */
export const selectRowWithCells = (state: Draft<TableState>, rowId: ID) => {
  state.ui.selectedRowsIds[rowId] = true;
  state.entities.columns.allIds.forEach((colId) => {
    selectCell(state, `${rowId}$${colId}`);
    if (isColumnSelected(state, colId)) {
      selectColumn(state, colId);
    }
  });
};

/**
 * Deselect a row.
 * Deselect a row and its cells. When deselection a row columns should be deselected.
 */
export const deselectRowWithCells = (state: Draft<TableState>, rowId: ID) => {
  state.ui.selectedRowsIds = removeObject(state.ui.selectedRowsIds, rowId);
  state.entities.columns.allIds.forEach((colId) => {
    deselectCell(state, `${rowId}$${colId}`);
    deselectColumn(state, colId);
  });
};

/**
 * Toggle column selection.
 * On remove, remove selected column and cells.
 * On add, add column and cells
 */
export const toggleColumnSelection = (state: Draft<TableState>, colId: ID) => {
  if (colId in state.ui.selectedColumnsIds) {
    deselectColumnWithCells(state, colId);
  } else {
    selectColumnWithCells(state, colId);
  }
};
export const toggleColumnCellsSelection = (state: Draft<TableState>, colId: ID) => {
  if (colId in state.ui.selectedColumnCellsIds) {
    deselectColumnCell(state, colId);
  } else {
    selectColumnCell(state, colId);
  }
};
/**
 * Toggle row selection.
 * On remove, remove selected row and cells.
 * On add, add row and cells
 */
export const toggleRowSelection = (state: Draft<TableState>, rowId: ID) => {
  if (rowId in state.ui.selectedRowsIds) {
    deselectRowWithCells(state, rowId);
  } else {
    selectRowWithCells(state, rowId);
  }
};
/**
 * Toggle cell selection.
 * On remove, remove selected cell and column if it was selected.
 * On add, check if a column is selected.
 */
export const toggleCellSelection = (state: Draft<TableState>, cellId: ID) => {
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
