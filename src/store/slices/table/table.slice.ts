import { current, PayloadAction } from '@reduxjs/toolkit';
import { GetTableResponse } from '@services/api/table';
import { KG_INFO } from '@services/utils/kg-info';
import { isEmptyObject } from '@services/utils/objects-utils';
import { createSliceWithRequests } from '@store/enhancers/requests';
import { applyRedoPatches, applyUndoPatches, produceWithPatch } from '@store/enhancers/undo';
import { ID, Payload } from '@store/interfaces/store';
import {
  AddCellMetadataPayload,
  AutoMatchingPayload,
  AutomaticAnnotationPayload,
  BBox,
  ColumnStatus,
  CopyCellPayload,
  DeleteCellMetadataPayload,
  DeleteColumnPayload,
  DeleteRowPayload,
  DeleteSelectedPayload,
  ExtendFulfilledPayload,
  FileFormat,
  PasteCellPayload,
  ReconciliationFulfilledPayload,
  RefineMatchingPayload,
  RowState,
  TableInstance,
  TableState,
  TableType,
  TableUIState,
  UpdateCellEditablePayload,
  UpdateCellLabelPayload,
  UpdateCellMetadataPayload,
  UpdateColumnMetadataPayload,
  UpdateColumnTypePayload,
  UpdateCurrentTablePayload,
  UpdateSelectedCellsPayload,
  UpdateSelectedColumnPayload,
  UpdateSelectedRowPayload
} from './interfaces/table';
import {
  automaticAnnotation,
  extend,
  ExtendThunkResponseProps,
  getTable,
  reconcile, saveTable
} from './table.thunk';
import {
  deleteOneColumn, deleteOneRow,
  deleteSelectedColumns, deleteSelectedRows
} from './utils/table.delete-utils';
import { createCell, getAnnotationMeta, getColumnAnnotationMeta, getColumnMetadata, getMetadata, updateContext } from './utils/table.extension-utils';
import {
  isCellReconciliated,
  getCellContext, getColumnStatus, createContext,
  incrementContextCounters, decrementContextCounters, decrementContextTotal,
  decrementContextReconciliated,
  incrementContextReconciliated,
  updateNumberOfReconciliatedCells,
  updateScoreBoundaries,
  computeCellAnnotationStats,
  computeColumnAnnotationStats
} from './utils/table.reconciliation-utils';
import {
  areOnlyRowsSelected,
  areRowsColumnsSelected,
  selectColumnCell,
  selectOneCell,
  selectOneColumn,
  selectOneColumnCell,
  selectOneRow,
  toggleCellSelection,
  toggleColumnCellsSelection,
  toggleColumnSelection,
  toggleRowSelection
} from './utils/table.selection-utils';
import {
  getCell, getColumn,
  getIdsFromCell, getRowCells, removeObject,
  toggleObject
} from './utils/table.utils';

const initialState: TableState = {
  entities: {
    tableInstance: {},
    columns: { byId: {}, allIds: [] },
    rows: { byId: {}, allIds: [] }
  },
  ui: {
    lastSaved: '',
    search: { globalFilter: ['match', 'pending', 'miss'], filter: 'all', value: '' },
    denseView: false,
    // viewOnly: false,
    headerExpanded: false,
    openReconciliateDialog: false,
    openExtensionDialog: false,
    openMetadataDialog: false,
    openMetadataColumnDialog: false,
    openExportDialog: false,
    openHelpDialog: false,
    settingsDialog: false,
    settings: {
      isViewOnly: false,
      isScoreLowerBoundEnabled: true,
      scoreLowerBound: 0
    },
    view: 'table',
    selectedColumnCellsIds: {},
    selectedColumnsIds: {},
    selectedRowsIds: {},
    selectedCellIds: {},
    expandedColumnsIds: {},
    expandedCellsIds: {},
    editableCellsIds: {},
    tmpCell: null,
    tutorialBBoxes: {}
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
    updateTable: (state, action: PayloadAction<Payload<GetTableResponse>>) => {
      const { table, columns, rows } = action.payload;
      let tableInstance = {} as TableInstance;
      tableInstance = { ...table };
      state.ui.lastSaved = tableInstance.lastModifiedDate;
      state.entities = {
        tableInstance,
        columns: {
          byId: columns,
          allIds: Object.keys(columns)
        },
        rows: {
          byId: rows,
          allIds: Object.keys(rows)
        }
      };
    },
    /**
     *  Set selected cell as expanded.
     */
    updateSelectedCellExpanded: (state, action: PayloadAction<Payload>) => {
      const { undoable = false } = action.payload;
      const {
        selectedColumnsIds, expandedCellsIds,
        selectedColumnCellsIds,
        expandedColumnsIds, selectedCellIds
      } = state.ui;
      const uniqueColumns = new Set<string>();

      Object.keys(selectedCellIds).forEach((cellId) => {
        const [_, colId] = cellId.split('$');
        uniqueColumns.add(colId);
      });

      Object.keys(selectedColumnsIds).forEach((colId) => {
        uniqueColumns.add(colId);
      });

      Object.keys(selectedColumnCellsIds).forEach((colId) => {
        uniqueColumns.add(colId);
      });

      uniqueColumns.forEach((colId) => {
        state.ui.expandedColumnsIds = toggleObject(state.ui.expandedColumnsIds, colId, true);
      });
    },
    /**
     * Set cell editable.
     */
    updateCellEditable: (state, action: PayloadAction<Payload<UpdateCellEditablePayload>>) => {
      const { cellId } = action.payload;
      state.ui.editableCellsIds = toggleObject(state.ui.editableCellsIds, cellId, true);
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
          draft.ui.editableCellsIds = removeObject(draft.ui.editableCellsIds, cellId);
          draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        });
      }
      // if value is the same just stop editing cell
      state.ui.editableCellsIds = removeObject(state.ui.editableCellsIds, cellId);
    },
    addCellMetadata: (state, action: PayloadAction<Payload<AddCellMetadataPayload>>) => {
      const {
        cellId, prefix,
        value, undoable = true
      } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      return produceWithPatch(state, undoable, (draft) => {
        const {
          id, match,
          name, ...rest
        } = value;

        const isMatching = match === 'true';

        if (isMatching) {
          draft.entities.rows.byId[rowId].cells[colId].metadata = draft.entities.rows
            .byId[rowId].cells[colId].metadata.map((item) => ({ ...item, match: false }));
        }

        const newMeta = {
          id: `${prefix}:${id}`,
          match: isMatching,
          name: {
            value: name,
            uri: 'prova'
          },
          ...rest
        };
        draft.entities.rows.byId[rowId].cells[colId].metadata.push(newMeta);
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
      if (metadata.length > 0) {
        return produceWithPatch(state, undoable, (draft) => {
          const { tableInstance, columns } = draft.entities;
          const column = getColumn(draft, colId);
          const cell = getCell(draft, rowId, colId);
          const cellContext = getCellContext(cell);
          const wasReconciliated = isCellReconciliated(cell);

          cell.metadata.forEach((metaItem) => {
            if (metaItem.id === metadataId) {
              metaItem.match = !metaItem.match;
            } else {
              metaItem.match = false;
            }
          });
          if (wasReconciliated && !isCellReconciliated(cell)) {
            column.context[cellContext] = decrementContextReconciliated(
              column.context[cellContext]
            );
            cell.annotationMeta = {
              ...cell.annotationMeta,
              match: {
                value: false
              }
            };
          } else if (!wasReconciliated && isCellReconciliated(cell)) {
            column.context[cellContext] = incrementContextReconciliated(
              column.context[cellContext]
            );
            cell.annotationMeta = {
              ...cell.annotationMeta,
              match: {
                value: true,
                reason: 'manual'
              }
            };
          } else if (wasReconciliated && isCellReconciliated(cell)) {
            cell.annotationMeta = {
              ...cell.annotationMeta,
              match: {
                value: true,
                reason: 'manual'
              }
            };
          }
          column.status = getColumnStatus(draft, colId);
          updateNumberOfReconciliatedCells(draft);
        }, (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        });
      }
    },
    /**
     * Handle the assignment of a metadata to a cell.
     * --UNDOABLE ACTION--
     */
    updateColumnMetadata: (state, action: PayloadAction<Payload<UpdateColumnMetadataPayload>>) => {
      const { metadataId, colId, undoable = true } = action.payload;

      const column = getColumn(state, colId);

      if (column.metadata.length > 0
        && column.metadata[0].entity
        && column.metadata[0].entity.length > 0) {
        return produceWithPatch(state, undoable, (draft) => {
          const columnToUpdate = getColumn(draft, colId);

          if (columnToUpdate.metadata.length > 0
            && columnToUpdate.metadata[0].entity
            && columnToUpdate.metadata[0].entity.length > 0) {
            columnToUpdate.metadata[0].entity.forEach((metaItem) => {
              if (metaItem.id === metadataId) {
                columnToUpdate.annotationMeta = {
                  ...columnToUpdate.annotationMeta,
                  match: {
                    value: !metaItem.match,
                    ...(!metaItem.match && {
                      reason: 'manual'
                    })
                  }
                };
                metaItem.match = !metaItem.match;
              } else {
                metaItem.match = false;
              }
            });
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
        const cellContext = getCellContext(cell);
        let wasMatch = false;

        cell.metadata = cell.metadata.filter((item) => {
          if (item.id === metadataId) {
            wasMatch = !!item.match;
          }
          return item.id !== metadataId;
        });
        if (cell.metadata.length === 0) {
          column.context[cellContext] = decrementContextTotal(column.context[cellContext]);
          if (wasMatch) {
            column.context[cellContext] = decrementContextReconciliated(
              column.context[cellContext]
            );
          }
        } else if (wasMatch) {
          column.context[cellContext] = decrementContextReconciliated(
            column.context[cellContext]
          );
        }
        column.status = getColumnStatus(draft, colId);
        updateNumberOfReconciliatedCells(draft);
      }, (draft) => {
        // do not include in undo history
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    refineMatching: (state, action: PayloadAction<Payload<RefineMatchingPayload>>) => {
      const { changes, undoable = true } = action.payload;

      return produceWithPatch(state, undoable, (draft) => {
        const columnsToUpdate = new Set<string>();

        changes.forEach((change) => {
          const [rowId, colId] = getIdsFromCell(change.cellId);
          const column = getColumn(draft, colId);
          const cell = getCell(draft, rowId, colId);

          columnsToUpdate.add(colId);

          if (change.metaItemId) {
            // set to true
            if (cell.annotationMeta.match.value) {
              const previousContext = getCellContext(cell);
              column.context[previousContext] = decrementContextReconciliated(
                column.context[previousContext]
              );
            }
            cell.metadata.forEach((metaItem) => {
              if (metaItem.id === change.metaItemId) {
                metaItem.match = true;
              } else {
                metaItem.match = false;
              }
            });
            cell.annotationMeta.match = { value: true, reason: 'refinement' };
            const currentContext = getCellContext(cell);
            column.context[currentContext] = incrementContextReconciliated(
              column.context[currentContext]
            );
          } else {
            const previousContext = getCellContext(cell);
            column.context[previousContext] = decrementContextReconciliated(
              column.context[previousContext]
            );
            // set to false
            cell.metadata.forEach((metaItem) => {
              metaItem.match = false;
            });
            cell.annotationMeta.match = { value: false };
          }
        });
        Array.from(columnsToUpdate).forEach((colId) => {
          const column = getColumn(draft, colId);
          column.status = getColumnStatus(draft, colId);
        });
        updateNumberOfReconciliatedCells(draft);
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
        const { selectedCellIds } = draft.ui;
        const { selectedColumnsIds } = draft.ui;
        const updatedColumns = new Set<ID>();
        Object.keys(selectedCellIds).forEach((cellId) => {
          const [rowId, colId] = getIdsFromCell(cellId);
          const column = getColumn(draft, colId);
          const cell = getCell(draft, rowId, colId);
          const cellContext = getCellContext(cell);
          // keep track of all columns uniquely with a set
          updatedColumns.add(colId);

          let maxIndex = { index: -1, max: -1 };
          cell.metadata.forEach(({ score = 0, match }, i) => {
            // find matching element
            if (score >= threshold && score > maxIndex.max) {
              maxIndex = { index: i, max: score };
            } else {
              if (match) {
                // assign match
                cell.metadata[i].match = false;
                // decrement number of reconciliated cells
                column.context[cellContext] = decrementContextReconciliated(
                  column.context[cellContext]
                );
                cell.annotationMeta = {
                  ...cell.annotationMeta,
                  match: {
                    value: false
                  }
                };
              }
            }
          });
          if (maxIndex.index !== -1) {
            if (!cell.metadata[maxIndex.index].match) {
              // assign match
              cell.metadata[maxIndex.index].match = true;
              // increment number of reconciliated cells
              column.context[cellContext] = incrementContextReconciliated(
                column.context[cellContext]
              );
              cell.annotationMeta = {
                ...cell.annotationMeta,
                match: {
                  value: true,
                  reason: 'refinement'
                }
              };
            }
          }
        });
        Object.keys(selectedColumnsIds).forEach((colId) => {
          const column = getColumn(draft, colId);

          if (column.metadata && column.metadata.length > 0) {
            if (column.metadata[0].entity) {
              let maxIndex = { index: -1, max: -1 };

              column.metadata[0].entity.forEach(({ score = 0, match }, i) => {
                // find matching element
                if (score > threshold && score > maxIndex.max) {
                  maxIndex = { index: i, max: score };
                } else {
                  if (match) {
                    if (column.metadata[0].entity) {
                      column.metadata[0].entity[i].match = false;
                      column.annotationMeta = {
                        ...column.annotationMeta,
                        match: {
                          value: false
                        }
                      };
                    }
                  }
                }
                if (maxIndex.index !== -1) {
                  if (column.metadata[0].entity) {
                    if (!column.metadata[0].entity[maxIndex.index].match) {
                      // assign match
                      column.metadata[0].entity[maxIndex.index].match = true;
                      column.annotationMeta = {
                        ...column.annotationMeta,
                        match: {
                          value: true,
                          reason: 'refinement'
                        }
                      };
                    }
                  }
                }
              });
            }
          }
        });
        // update columns status for 'touched' columns
        updatedColumns.forEach((colId) => {
          const column = getColumn(draft, colId);
          column.status = getColumnStatus(draft, colId);
        });
        updateNumberOfReconciliatedCells(draft);
      }, (draft) => {
        // do not include in undo history
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    /**
     * Handle update of the type of a column
     * -- UNDOABLE ACTION --
     */
    updateColumnType: (state, action: PayloadAction<Payload<UpdateColumnTypePayload>>) => {
      const { undoable = true, ...type } = action.payload;
      const { selectedColumnCellsIds } = state.ui;

      const colId = Object.keys(selectedColumnCellsIds)[0];

      return produceWithPatch(state, undoable, (draft) => {
        const { columns } = draft.entities;

        const newType = [{
          ...type,
          match: true,
          score: 100
        }];

        if (columns.byId[colId].metadata.length === 0) {
          (columns.byId[colId].metadata as any) = [{
            type: newType
          }];
        } else {
          (columns.byId[colId].metadata[0].type as any) = newType;
        }
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
      if (multi) {
        toggleColumnSelection(state, colId);
      } else {
        selectOneColumn(state, colId);
      }
    },
    updateColumnCellsSelection: (state, action: PayloadAction<UpdateSelectedColumnPayload>) => {
      const { id: colId, multi } = action.payload;
      if (multi) {
        toggleColumnCellsSelection(state, colId);
      } else {
        selectOneColumnCell(state, colId);
      }
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
    addTutorialBox: (state, action: PayloadAction<{ id: string; bbox: BBox }>) => {
      const { id, bbox } = action.payload;
      state.ui.tutorialBBoxes[id] = bbox;
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
        updateNumberOfReconciliatedCells(draft);
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
    copyCell: (state, action: PayloadAction<CopyCellPayload>) => {
      const { cellId } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      const cell = getCell(state, rowId, colId);

      state.ui.tmpCell = cell;
    },
    pasteCell: (state, action: PayloadAction<Payload<PasteCellPayload>>) => {
      const { undoable = true, cellId } = action.payload;
      return produceWithPatch(state, undoable, (draft) => {
        const { tmpCell } = draft.ui;
        const [rowId, colId] = getIdsFromCell(cellId);

        if (tmpCell) {
          const { id, ...rest } = tmpCell;

          draft.entities.rows.byId[rowId].cells[colId] = {
            id: `${rowId}$${colId}`,
            ...rest
          };
        }
      }, (draft) => {
        draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
      });
    },
    /**
     * Perform an undo by applying undo patches (past patches).
     */
    undo: (state, action: PayloadAction<void>) => {
      return applyUndoPatches(state, (draft) => {
        draft.ui.selectedColumnCellsIds = {};
        draft.ui.selectedColumnsIds = {};
        draft.ui.selectedRowsIds = {};
        draft.ui.selectedCellIds = {};
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
        tableInstance = { ...table };
        state.ui.lastSaved = tableInstance.lastModifiedDate;
        state.entities = {
          tableInstance,
          columns: {
            byId: columns,
            allIds: Object.keys(columns)
          },
          rows: {
            byId: rows,
            allIds: Object.keys(rows)
          }
        };
        if (table.maxMetaScore != null && table.minMetaScore != null) {
          state.ui.settings.scoreLowerBound = (table.maxMetaScore - table.minMetaScore) / 3;
        }
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
        const { prefix, uri } = reconciliator;

        return produceWithPatch(state, undoable, (draft) => {
          data.forEach(({ id: cellId, metadata }) => {
            if (cellId.includes('$')) {
              const [rowId, colId] = getIdsFromCell(cellId);
              // get column
              const column = getColumn(draft, colId);
              // get cell and previous reconciliator
              const cell = getCell(draft, rowId, colId);

              const previousContext = getCellContext(cell);

              if (previousContext) {
                // decrement previous
                column.context[previousContext] = decrementContextCounters(
                  column.context[previousContext],
                  cell
                );
              }
              // assign new reconciliator and metadata
              // cell.metadata.reconciliator.id = reconciliator.id;
              cell.metadata = metadata.map(({ id, name, ...rest }) => {
                const [_, metaId] = id.split(':');
                return {
                  id,
                  name: {
                    value: name as unknown as string,
                    uri: `${KG_INFO[prefix as keyof typeof KG_INFO].uri}${metaId}`
                  },
                  ...rest
                };
              });
              cell.annotationMeta = {
                annotated: true,
                ...computeCellAnnotationStats(cell)
              };
              // increment current
              if (!column.context[prefix] || isEmptyObject(column.context[prefix])) {
                // create context if doesn't exist
                column.context[prefix] = createContext({ uri });
              }
              column.context[prefix] = incrementContextCounters(column.context[prefix], cell);
              // update column status after changes
              column.status = getColumnStatus(draft, colId);
            } else {
              // get column
              const column = getColumn(draft, cellId);

              if (column.metadata.length > 0) {
                column.metadata[0].entity = metadata.map(({ id, name, ...rest }) => {
                  const [_, metaId] = id.split(':');
                  return {
                    id,
                    name: {
                      value: name as unknown as string,
                      uri: `${KG_INFO[prefix as keyof typeof KG_INFO].uri}${metaId}`
                    },
                    ...rest
                  };
                });
              } else {
                column.metadata[0] = {
                  id: 'None:',
                  match: true,
                  score: 0,
                  name: { value: '', uri: '' },
                  entity: metadata.map(({ id, name, ...rest }) => {
                    const [_, metaId] = id.split(':');
                    return {
                      id,
                      name: {
                        value: name as unknown as string,
                        uri: `${KG_INFO[prefix as keyof typeof KG_INFO].uri}${metaId}`
                      },
                      ...rest
                    };
                  })
                };
              }

              column.annotationMeta = {
                annotated: true,
                ...computeColumnAnnotationStats(column)
              };
            }
          });
          updateNumberOfReconciliatedCells(draft);
          updateScoreBoundaries(draft);
        }, (draft) => {
          draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        });
      })
      .addCase(automaticAnnotation.fulfilled, (
        state, action: PayloadAction<Payload<AutomaticAnnotationPayload>>
      ) => {
        const { datasetId, tableId, mantisStatus } = action.payload;
        state.entities.tableInstance.mantisStatus = mantisStatus;
        state.ui.settings.isViewOnly = true;
      })
      .addCase(extend.fulfilled, (
        state, action: PayloadAction<Payload<ExtendThunkResponseProps>>
      ) => {
        const { data, extender, undoable = true } = action.payload;

        const { columns, meta } = data;

        const newColumnsIds = Object.keys(columns);

        return produceWithPatch(state, undoable, (draft) => {
          newColumnsIds.forEach((newColId) => {
            const { metadata: columnMetadata, cells, label, ...rest } = columns[newColId];

            // add new column
            draft.entities.columns.byId[newColId] = {
              id: newColId,
              label,
              metadata: getColumnMetadata(columnMetadata),
              status: ColumnStatus.EMPTY,
              context: {},
              ...getColumnAnnotationMeta(columnMetadata),
              ...rest
            };

            // add rows

            draft.entities.rows.allIds.forEach((rowId) => {
              const newCell = createCell(rowId, newColId, cells[rowId]);

              draft.entities.rows
                .byId[rowId].cells[newColId] = newCell;
              updateContext(draft, newCell);
            });

            draft.entities.columns.byId[newColId].status = getColumnStatus(draft, newColId);

            if (!draft.entities.columns.allIds.includes(newColId)) {
              const index = draft.entities.columns.allIds
                .findIndex((originalColId) => originalColId === meta[newColId]);

              if (index !== -1) {
                draft.entities.columns.allIds.splice(index + 1, 0, newColId);
              } else {
                draft.entities.columns.allIds.push(newColId);
              }
            }
          });
          updateNumberOfReconciliatedCells(draft);
        }, (draft) => {
          draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        });

        // return produceWithPatch(state, undoable, (draft) => {
        //   const newColIds = Object.keys(columns);
        //   draft.entities.columns.byId = {
        //     ...draft.entities.columns.byId,
        //     ...columns
        //   };

        //   newColIds.forEach((colId) => {
        //     draft.entities.rows.allIds.forEach((rowId) => {
        //       if (rows[rowId]) {
        //         draft.entities.rows.byId[rowId].cells[colId] = {
        //           ...rows[rowId].cells[colId],
        //           ...(rows[rowId].cells[colId].metadata.length > 0 && {
        //             annotated: true
        //           })
        //         };
        //       } else {
        //         draft.entities.rows.byId[rowId].cells[colId] = {
        //           id: `${rowId}$${colId}`,
        //           label: 'null',
        //           metadata: []
        //         } as any;
        //       }
        //     });

        //     if (!draft.entities.columns.allIds.includes(colId)) {
        //       const index = draft.entities.columns.allIds
        //         .findIndex((originalColId) => originalColId === meta[colId]);

        //       if (index !== -1) {
        //         draft.entities.columns.allIds.splice(index + 1, 0, colId);
        //       } else {
        //         draft.entities.columns.allIds.push(colId);
        //       }
        //     }
        //   });

        //   updateNumberOfReconciliatedCells(draft);
        // }, (draft) => {
        //   draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
        // });
      })
  )
});

export const {
  restoreInitialState,
  updateCurrentTable,
  updateColumnCellsSelection,
  updateSelectedCellExpanded,
  updateCellEditable,
  updateCellLabel,
  addCellMetadata,
  updateColumnMetadata,
  updateCellMetadata,
  deleteCellMetadata,
  autoMatching,
  refineMatching,
  updateColumnSelection,
  updateRowSelection,
  updateCellSelection,
  updateColumnType,
  updateUI,
  addTutorialBox,
  deleteColumn,
  deleteRow,
  deleteSelected,
  updateTable,
  copyCell,
  pasteCell,
  undo,
  redo
} = tableSlice.actions;

export default tableSlice.reducer;
