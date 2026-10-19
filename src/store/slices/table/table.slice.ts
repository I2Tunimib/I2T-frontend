import { createSlice } from "@reduxjs/toolkit";
import { initialState } from "./reducers/initial-state";
import { TableState } from "./interfaces/table";

// Entity / structure reducers
import * as tableReducers from "./reducers/table";
// UI reducers
import * as uiReducers from "./reducers/ui";
// Selection reducers
import * as selectionReducers from "./reducers/selection";
// Cell metadata reducers
import * as cellMetadataReducers from "./reducers/cell-metadata";
// Column metadata reducers
import * as columnMetadataReducers from "./reducers/column-metadata";
// Matching reducers
import * as matchingReducers from "./reducers/matching";
// Extra-reducer handlers
import { getTableFulfilled } from "./reducers/extra/getTable";
import {
  automaticAnnotationPending,
  automaticAnnotationFulfilled,
  saveTableFulfilled,
  tableCompliancePending,
  tableComplianceFulfilled,
  tableComplianceRejected,
  getDependenciesFulfilled,
} from "./reducers/extra/loading";
import { reconcileFulfilled } from "./reducers/extra/reconcile";
import { extendFulfilled } from "./reducers/extra/extend";
import { modifyFulfilled } from "./reducers/extra/modify";
import { getTable, saveTable, automaticAnnotation, tableCompliance, getDependencies, reconcile, extend, modify } from "./table.thunk";

export const tableSlice = createSlice({
  name: "table",
  initialState: initialState as TableState,
  reducers: {
    // Entity / structure
    updateCurrentTable: tableReducers.updateCurrentTable,
    updateTable: tableReducers.updateTable,
    updateSchema: tableReducers.updateSchema,
    updateCellLabel: tableReducers.updateCellLabel,
    updateColumnCellsLabels: tableReducers.updateColumnCellsLabels,
    copyCell: tableReducers.copyCell,
    pasteCell: tableReducers.pasteCell,
    deleteSelected: tableReducers.deleteSelected,
    deleteColumn: tableReducers.deleteColumn,
    deleteRow: tableReducers.deleteRow,
    clearColumnReconciliation: tableReducers.clearColumnReconciliation,
    undo: tableReducers.undo,
    redo: tableReducers.redo,
    updateColumnVisibility: uiReducers.updateColumnVisibility,
    updateDependencies: uiReducers.updateDependencies,
    // UI
    restoreInitialState: uiReducers.restoreInitialState,
    clearDeletedColumns: uiReducers.clearDeletedColumns,
    updateUI: uiReducers.updateUI,
    setHelpStart: uiReducers.setHelpStart,
    setGraphTutorialStart: uiReducers.setGraphTutorialStart,
    addTutorialBox: uiReducers.addTutorialBox,
    updateColumnEditable: uiReducers.updateColumnEditable,
    updateCellEditable: uiReducers.updateCellEditable,
    updateSelectedCellExpanded: uiReducers.updateSelectedCellExpanded,
    // Selection
    updateColumnSelection: selectionReducers.updateColumnSelection,
    updateColumnCellsSelection: selectionReducers.updateColumnCellsSelection,
    updateCellSelection: selectionReducers.updateCellSelection,
    updateRowSelection: selectionReducers.updateRowSelection,
    // Cell metadata
    addCellMetadata: cellMetadataReducers.addCellMetadata,
    deleteCellMetadata: cellMetadataReducers.deleteCellMetadata,
    propagateCellMetadata: cellMetadataReducers.propagateCellMetadata,
    propagateCellDeleteMetadata: cellMetadataReducers.propagateCellDeleteMetadata,
    updateCellMetadata: cellMetadataReducers.updateCellMetadata,
    // Column metadata
    addColumnMetadata: columnMetadataReducers.addColumnMetadata,
    deleteColumnMetadata: columnMetadataReducers.deleteColumnMetadata,
    updateColumnMetadata: columnMetadataReducers.updateColumnMetadata,
    updateColumnPropertyMetadata: columnMetadataReducers.updateColumnPropertyMetadata,
    updateColumnRole: columnMetadataReducers.updateColumnRole,
    updateColumnKind: columnMetadataReducers.updateColumnKind,
    updateColumnDatatype: columnMetadataReducers.updateColumnDatatype,
    addColumnType: columnMetadataReducers.addColumnType,
    updateColumnTypeMatches: columnMetadataReducers.updateColumnTypeMatches,
    // Matching
    autoMatching: matchingReducers.autoMatching,
    refineMatching: matchingReducers.refineMatching,
  },
  extraReducers: (builder) =>
    builder
      .addCase(getTable.fulfilled, getTableFulfilled as any)
      .addCase(saveTable.fulfilled, saveTableFulfilled as any)
      .addCase(automaticAnnotation.pending, automaticAnnotationPending as any)
      .addCase(automaticAnnotation.fulfilled, automaticAnnotationFulfilled as any)
      .addCase(tableCompliance.pending, tableCompliancePending as any)
      .addCase(tableCompliance.fulfilled, tableComplianceFulfilled as any)
      .addCase(tableCompliance.rejected, tableComplianceRejected as any)
      .addCase(getDependencies.fulfilled, getDependenciesFulfilled as any)
      .addCase(reconcile.fulfilled, reconcileFulfilled as any)
      .addCase(extend.fulfilled, extendFulfilled as any)
      .addCase(modify.fulfilled, modifyFulfilled as any),
});

export const {
  restoreInitialState,
  clearDeletedColumns,
  updateCurrentTable,
  updateTable,
  updateSchema,
  updateCellLabel,
  updateColumnCellsLabels,
  copyCell,
  pasteCell,
  deleteSelected,
  deleteColumn,
  deleteRow,
  clearColumnReconciliation,
  undo,
  redo,
  updateColumnVisibility,
  updateDependencies,
  updateUI,
  setHelpStart,
  setGraphTutorialStart,
  addTutorialBox,
  updateColumnEditable,
  updateCellEditable,
  updateSelectedCellExpanded,
  updateColumnSelection,
  updateColumnCellsSelection,
  updateCellSelection,
  updateRowSelection,
  addCellMetadata,
  deleteCellMetadata,
  propagateCellMetadata,
  propagateCellDeleteMetadata,
  updateCellMetadata,
  addColumnMetadata,
  deleteColumnMetadata,
  updateColumnMetadata,
  updateColumnPropertyMetadata,
  updateColumnRole,
  updateColumnKind,
  updateColumnDatatype,
  addColumnType,
  updateColumnTypeMatches,
  autoMatching,
  refineMatching,
} = tableSlice.actions;

export default tableSlice.reducer;
