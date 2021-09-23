import { current, PayloadAction } from '@reduxjs/toolkit';
import { GetTableResponse } from '@services/api/table';
import { isEmptyObject } from '@services/utils/objects-utils';
import { createSliceWithRequests } from '@store/enhancers/requests';
import { applyRedoPatches, applyUndoPatches, produceWithPatch } from '@store/enhancers/undo';
import { Payload } from '@store/interfaces/store';
import { TableInstance } from '../tables/interfaces/tables';
import {
  AddCellMetadataPayload,
  AutoMatchingPayload,
  ColumnStatus,
  DeleteCellMetadataPayload,
  DeleteColumnPayload,
  DeleteRowPayload,
  DeleteSelectedPayload,
  FileFormat,
  ReconciliationFulfilledPayload,
  TableState,
  TableType,
  TableUIState,
  UpdateCellEditablePayload,
  UpdateCellLabelPayload,
  UpdateCellMetadataPayload,
  UpdateCurrentTablePayload,
  UpdateSelectedCellsPayload,
  UpdateSelectedColumnPayload,
  UpdateSelectedRowPayload
} from './interfaces/table';
import {
  exportTable, getTable,
  reconcile, saveTable
} from './table.thunk';
import {
  deleteOneColumn, deleteOneRow,
  deleteSelectedColumns, deleteSelectedRows
} from './utils/table.delete-utils';
import { StandardTable } from './utils/table.export-utils';
import {
  isColumnReconciliated, setMatchingMetadata,
  hasColumnMetadata, isCellReconciliated,
  decrementAllReconciliator, incrementAllReconciliator,
  isColumnPartialAnnotated, decrementReconciliated, incrementReconciliated, decrementTotal
} from './utils/table.reconciliation-utils';
import {
  areOnlyRowsSelected,
  areRowsColumnsSelected,
  selectOneCell,
  selectOneRow,
  toggleCellSelection,
  toggleColumnSelection,
  toggleRowSelection
} from './utils/table.selection-utils';
import { getCell, getColumn, getIdsFromCell } from './utils/table.utils';

const initialState: TableState = {
  entities: {
    tableInstance: { name: '' },
    columns: { byId: {}, allIds: [] },
    rows: { byId: {}, allIds: [] }
  },
  ui: {
    lastSaved: '',
    search: { filter: 'all', value: '' },
    denseView: false,
    openReconciliateDialog: false,
    openMetadataDialog: false,
    openExportDialog: false,
    selectedColumnsIds: {},
    selectedRowsIds: {},
    selectedCellIds: {}
  },
  _requests: { byId: {}, allIds: [] },
  _draft: {
    patches: [],
    inversePatches: [],
    undoPointer: -1,
    redoPointer: -1
  }
};

export const tableSlice = createSliceWithRequests({
  name: 'table',
  initialState,
  reducers: {
    restoreInitialState: (state, action: PayloadAction<void>) => {
      return { ...initialState };
    },
    /**
     * Update current table.
     */
    updateCurrentTable: (state, action: PayloadAction<Payload<UpdateCurrentTablePayload>>) => {
      state.entities.tableInstance = {
        ...state.entities.tableInstance,
        ...action.payload
      };
      state.entities.tableInstance.lastModifiedDate = new Date().toISOString();
    },
    /**
     *  Set selected cell as expanded.
     */
    updateSelectedCellExpanded: (state, action: PayloadAction<Payload>) => {
      const { undoable = false } = action.payload;
      Object.keys(state.ui.selectedCellIds).forEach((cellId) => {
        const [rowId, colId] = getIdsFromCell(cellId);
        state.entities.rows.byId[rowId].cells[colId].expanded = !state.entities.rows
          .byId[rowId].cells[colId].expanded;
      });
    },
    /**
     * Set cell editable.
     */
    updateCellEditable: (state, action: PayloadAction<Payload<UpdateCellEditablePayload>>) => {
      const { cellId } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);
      state.entities.rows.byId[rowId].cells[colId].editable = true;
    },
    /**
     * Handle update of cell label.
     * --UNDOABLE ACTION--
     */
    updateCellLabel: (state, action: PayloadAction<Payload<UpdateCellLabelPayload>>) => {
      const { cellId, value, undoable = true } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      if (state.entities.rows.byId[rowId].cells[colId].label !== value) {
        return produceWithPatch(state, undoable, (draft) => {
          draft.entities.rows.byId[rowId].cells[colId].label = value;
        }, (draft) => {
          // do not include in undo history
          draft.entities.rows.byId[rowId].cells[colId].editable = false;
          draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        });
      }
      // if value is the same just stop editing cell
      state.entities.rows.byId[rowId].cells[colId].editable = false;
    },
    addCellMetadata: (state, action: PayloadAction<Payload<AddCellMetadataPayload>>) => {
      const { cellId, value, undoable = true } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      return produceWithPatch(state, undoable, (draft) => {
        const newMeta = {
          ...value,
          match: false,
          score: 0
        };
        draft.entities.rows.byId[rowId].cells[colId].metadata.values.unshift(newMeta);
      }, (draft) => {
        // do not include in undo history
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    /**
     * Handle the assignment of a metadata to a cell.
     * --UNDOABLE ACTION--
     */
    updateCellMetadata: (state, action: PayloadAction<Payload<UpdateCellMetadataPayload>>) => {
      const { metadataId, cellId, undoable = true } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);
      const { metadata } = getCell(state, rowId, colId);
      if (metadata.values.length > 0) {
        return produceWithPatch(state, undoable, (draft) => {
          const column = getColumn(draft, colId);
          const cell = getCell(draft, rowId, colId);
          const { reconciliator } = cell.metadata;
          const wasReconciliated = isCellReconciliated(cell);
          cell.metadata.values.forEach((metaItem) => {
            if (metaItem.id === metadataId) {
              metaItem.match = !metaItem.match;
            } else {
              metaItem.match = false;
            }
          });
          if (wasReconciliated && !isCellReconciliated(cell)) {
            column.reconciliators[reconciliator.id] = {
              ...decrementReconciliated(column.reconciliators[reconciliator.id])
            };
          } else if (!wasReconciliated && isCellReconciliated(cell)) {
            column.reconciliators[reconciliator.id] = {
              ...incrementReconciliated(column.reconciliators[reconciliator.id])
            };
          }
          if (isColumnReconciliated(draft, colId)) {
            column.status = ColumnStatus.RECONCILIATED;
          } else {
            column.status = ColumnStatus.PENDING;
          }
        }, (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        });
      }
    },
    /**
     * Handle deletion of a metadata value.
     * --UNDOABLE ACTION--
     */
    deleteCellMetadata: (state, action: PayloadAction<Payload<DeleteCellMetadataPayload>>) => {
      const { metadataId, cellId, undoable = true } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      return produceWithPatch(state, undoable, (draft) => {
        const column = getColumn(draft, colId);
        const cell = getCell(draft, rowId, colId);
        const { reconciliator, values } = cell.metadata;
        let wasMatch = false;
        cell.metadata.values = values.filter((item) => {
          if (item.id === metadataId) {
            wasMatch = item.match;
          }
          return item.id !== metadataId;
        });
        if (cell.metadata.values.length === 0) {
          cell.metadata.reconciliator = { id: '' };
          column.status = ColumnStatus.EMPTY;

          if (wasMatch) {
            column.reconciliators[reconciliator.id] = {
              ...decrementAllReconciliator(cell, column.reconciliators[reconciliator.id])
            };
          } else {
            column.reconciliators[reconciliator.id] = {
              ...decrementTotal(column.reconciliators[reconciliator.id])
            };
          }
        } else if (wasMatch) {
          column.reconciliators[reconciliator.id] = {
            ...decrementReconciliated(column.reconciliators[reconciliator.id])
          };
          column.status = ColumnStatus.PENDING;
        }
      }, (draft) => {
        // do not include in undo history
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    /**
     * Handle auto matching operations.
     * It updates cell matching metadata based on threshold.
     * --UNDOABLE ACTION--
     */
    autoMatching: (state, action: PayloadAction<Payload<AutoMatchingPayload>>) => {
      const { threshold, undoable = true } = action.payload;

      return produceWithPatch(state, undoable, (draft) => {
        const { rows } = draft.entities;
        const { selectedCellIds } = draft.ui;
        Object.keys(selectedCellIds).forEach((cellId) => {
          const [rowId, colId] = getIdsFromCell(cellId);
          const column = getColumn(draft, colId);
          const cell = getCell(draft, rowId, colId);
          const { reconciliator } = cell.metadata;

          let maxIndex = { index: -1, max: -1 };
          cell.metadata.values.forEach((item, i) => {
            // find matching element
            if (item.score > threshold && item.score > maxIndex.max) {
              maxIndex = { index: i, max: item.score };
            } else {
              if (item.match) {
                // assign match
                cell.metadata.values[i].match = false;
                // decrement number of reconciliated cells
                column.reconciliators[reconciliator.id] = {
                  ...decrementReconciliated(column.reconciliators[reconciliator.id])
                };
              }
            }
          });
          if (maxIndex.index !== -1) {
            if (!cell.metadata.values[maxIndex.index].match) {
              // assign match
              cell.metadata.values[maxIndex.index].match = true;
              // increment number of reconciliated cells
              column.reconciliators[reconciliator.id] = {
                ...incrementReconciliated(column.reconciliators[reconciliator.id])
              };
            }
          }

          if (isColumnReconciliated(draft, colId)) {
            column.status = ColumnStatus.RECONCILIATED;
          } else {
            column.status = ColumnStatus.PENDING;
          }
        });
      }, (draft) => {
        // do not include in undo history
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    /**
     * Handle changes to selected columns.
     */
    updateColumnSelection: (state, action: PayloadAction<UpdateSelectedColumnPayload>) => {
      const { id: colId, multi } = action.payload;
      toggleColumnSelection(state, colId);
    },
    /**
     * Handle changes to selected cells.
     */
    updateCellSelection: (state, action: PayloadAction<Payload<UpdateSelectedCellsPayload>>) => {
      const { id: cellId, multi } = action.payload;

      if (multi) {
        toggleCellSelection(state, cellId);
      } else {
        selectOneCell(state, cellId);
      }
    },
    /**
     * Handle changes to selected rows.
     */
    updateRowSelection: (state, action: PayloadAction<Payload<UpdateSelectedRowPayload>>) => {
      const { id: rowId, multi } = action.payload;

      if (multi) {
        toggleRowSelection(state, rowId);
      } else {
        selectOneRow(state, rowId);
      }
    },
    /**
     * Merges parameters of the UI to the current state.
     */
    updateUI: (state, action: PayloadAction<Payload<Partial<TableUIState>>>) => {
      const { undoable, ...rest } = action.payload;
      state.ui = { ...state.ui, ...rest };
    },
    /**
     * Delete selected columns and/or rows.
     * --UNDOABLE ACTION--
     */
    deleteSelected: (state, action: PayloadAction<Payload<DeleteSelectedPayload>>) => {
      const { undoable = true } = action.payload;
      return produceWithPatch(state, undoable, (draft) => {
        if (areRowsColumnsSelected(draft)) {
          if (areOnlyRowsSelected(draft)) {
            deleteSelectedRows(draft);
          } else {
            deleteSelectedColumns(draft);
            deleteSelectedRows(draft);
          }
        }
      }, (draft) => {
        // do not include in undo history
        draft.ui.selectedColumnsIds = {};
        draft.ui.selectedRowsIds = {};
        draft.ui.selectedCellIds = {};
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    deleteColumn: (state, action: PayloadAction<Payload<DeleteColumnPayload>>) => {
      const { undoable = true, colId } = action.payload;
      return produceWithPatch(state, undoable, (draft) => {
        deleteOneColumn(draft, colId);
      }, (draft) => {
        draft.ui.selectedColumnsIds = {};
        draft.ui.selectedCellIds = {};
      });
    },
    deleteRow: (state, action: PayloadAction<Payload<DeleteRowPayload>>) => {
      const { undoable = true, rowId } = action.payload;
      return produceWithPatch(state, undoable, (draft) => {
        deleteOneRow(draft, rowId);
      }, (draft) => {
        draft.ui.selectedRowsIds = {};
        draft.ui.selectedCellIds = {};
      });
    },
    /**
     * Perform an undo by applying undo patches (past patches).
     */
    undo: (state, action: PayloadAction<void>) => {
      return applyUndoPatches(state, (draft) => {
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    /**
     * Perform a redo by applying redo patches (future patches).
     */
    redo: (state, action: PayloadAction<void>) => {
      return applyRedoPatches(state, (draft) => {
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    }
  },
  extraRules: (builder) => (
    builder
      .addCase(getTable.fulfilled, (state, action: PayloadAction<GetTableResponse>) => {
        const { table, columns, rows } = action.payload;
        let tableInstance = {} as TableInstance;
        if (table.type === TableType.RAW) {
          tableInstance.name = 'Table name';
          tableInstance.format = FileFormat.JSON;
          tableInstance.type = TableType.ANNOTATED;
          tableInstance.lastModifiedDate = new Date().toISOString();
        } else {
          tableInstance = { ...table };
          state.ui.lastSaved = tableInstance.lastModifiedDate;
        }
        state.entities = {
          tableInstance,
          columns,
          rows
        };
      })
      .addCase(saveTable.fulfilled, (state, action: PayloadAction<TableInstance>) => {
        state.ui.lastSaved = action.payload.lastModifiedDate;
      })
      /**
       * Set metadata on request fulfilled.
       * --UNDOABLE ACTION--
       */
      .addCase(reconcile.fulfilled, (
        state, action: PayloadAction<Payload<ReconciliationFulfilledPayload>>
      ) => {
        const { data, reconciliator, undoable = true } = action.payload;

        return produceWithPatch(state, undoable, (draft) => {
          data.forEach(({ id, metadata }) => {
            const [rowId, colId] = getIdsFromCell(id);
            // get column
            const column = getColumn(draft, colId);
            // get cell and previous reconciliator
            const cell = getCell(draft, rowId, colId);
            const prevRecon = cell.metadata.reconciliator.id;

            if (prevRecon) {
              // decrement previous
              column.reconciliators[prevRecon] = {
                ...decrementAllReconciliator(cell, column.reconciliators[prevRecon])
              };
            }
            // assign new reconciliator and metadata
            cell.metadata.reconciliator.id = reconciliator.id;
            cell.metadata.values = metadata;
            // increment current
            column.reconciliators[reconciliator.id] = {
              ...incrementAllReconciliator(cell, column.reconciliators[reconciliator.id])
            };

            if (isColumnReconciliated(draft, colId)) {
              column.status = ColumnStatus.RECONCILIATED;
            } else if (isColumnPartialAnnotated(draft, colId)) {
              column.status = ColumnStatus.PENDING;
            }
          });
        }, (draft) => {
          draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        });
      })
  )
});

export const {
  restoreInitialState,
  updateCurrentTable,
  updateSelectedCellExpanded,
  updateCellEditable,
  updateCellLabel,
  addCellMetadata,
  updateCellMetadata,
  deleteCellMetadata,
  autoMatching,
  updateColumnSelection,
  updateRowSelection,
  updateCellSelection,
  updateUI,
  deleteColumn,
  deleteRow,
  deleteSelected,
  undo,
  redo
} = tableSlice.actions;

export default tableSlice.reducer;
