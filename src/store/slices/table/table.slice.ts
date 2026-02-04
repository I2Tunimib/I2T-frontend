//import { useAppSelector } from "@hooks/store";
import { current, PayloadAction } from "@reduxjs/toolkit";
import tableAPI, {
  GetTableResponse,
  GetSchemaResponse,
} from "@services/api/table";
//import { KG_INFO } from '@services/utils/kg-info';
import { isEmptyObject } from "@services/utils/objects-utils";
import { buildURI } from "@services/utils/uri-utils";
//import { RootState, store } from "@store";
import { createSliceWithRequests } from "@store/enhancers/requests";
import {
  applyRedoPatches,
  applyUndoPatches,
  produceWithPatch,
} from "@store/enhancers/undo";
import { ID, Payload } from "@store/interfaces/store";
import { property } from "lodash";
//import { a } from "react-spring";
//import axios from "axios";
//import {
//  selectReconciliators,
//  selectReconciliatorsAsArray,
//} from "../config/config.selectors";
import {
  AddCellMetadataPayload,
  AddColumnMetadataPayload,
  AutoMatchingPayload,
  AutomaticAnnotationPayload,
  BBox,
  ColumnStatus,
  CopyCellPayload,
  DeleteCellMetadataPayload,
  DeleteColumnMetadataPayload,
  DeleteColumnPayload,
  DeleteRowPayload,
  DeleteSelectedPayload,
  //ExtendFulfilledPayload,
  //FileFormat,
  PasteCellPayload,
  ReconciliationFulfilledPayload,
  ModifyFulfilledPayload,
  RefineMatchingPayload,
  //RowState,
  TableInstance,
  TableState,
  //TableType,
  TableUIState,
  UpdateCellEditablePayload,
  UpdateCellLabelPayload,
  UpdateCellMetadataPayload,
  UpdateColumnEditablePayload,
  UpdateColumnMetadataPayload,
  UpdateColumnTypePayload,
  AddColumnTypePayload,
  UpdateCurrentTablePayload,
  UpdateSelectedCellsPayload,
  UpdateSelectedColumnPayload,
  UpdateSelectedRowPayload,
  UpdateColumnTypeMatchesPayload,
} from "./interfaces/table";
import {
  automaticAnnotation,
  extend,
  ExtendThunkResponseProps,
  getTable,
  reconcile,
  modify,
  saveTable,
} from "./table.thunk";
import {
  deleteOneColumn,
  deleteOneRow,
  deleteSelectedColumns,
  deleteSelectedRows,
} from "./utils/table.delete-utils";
import {
  createCell,
  //getAnnotationMeta,
  getColumnAnnotationMeta,
  getColumnMetadata,
  //getMetadata,
  updateContext,
} from "./utils/table.extension-utils";
import {
  isCellReconciliated,
  getCellContext,
  getColumnStatus,
  createContext,
  incrementContextCounters,
  decrementContextCounters,
  decrementContextTotal,
  decrementContextReconciliated,
  incrementContextReconciliated,
  updateNumberOfReconciliatedCells,
  updateScoreBoundaries,
  computeCellAnnotationStats,
  computeColumnAnnotationStats,
} from "./utils/table.reconciliation-utils";
import {
  areOnlyRowsSelected,
  areRowsColumnsSelected,
  //selectColumnCell,
  selectOneCell,
  selectOneColumn,
  selectOneColumnCell,
  selectOneRow,
  toggleCellSelection,
  toggleColumnCellsSelection,
  toggleColumnSelection,
  toggleRowSelection,
} from "./utils/table.selection-utils";
import {
  getCell,
  getColumn,
  getIdsFromCell,
  //getRowCells,
  removeObject,
  toggleObject,
} from "./utils/table.utils";
//import { annotate } from "../datasets/datasets.thunk";

const initialState: TableState = {
  entities: {
    tableInstance: {},
    columns: { byId: {}, allIds: [] },
    rows: { byId: {}, allIds: [] },
  },
  ui: {
    lastSaved: "",
    search: {
      globalFilter: ["match", "pending", "miss"],
      filter: "all",
      value: "",
    },
    columnVisibility: {},
    denseView: true,
    // viewOnly: false,
    headerExpanded: false,
    openReconciliateDialog: false,
    openExtensionDialog: false,
    openModificationDialog: false,
    openMetadataDialog: false,
    openMetadataColumnDialog: false,
    metadataColumnDialogColId: null,
    openExportDialog: false,
    openAutoAnnotationDialog: false,
    openHelpDialog: false,
    openGraphTutorialDialog: false,
    helpStart: false,
    graphTutorialStart: false,
    settingsDialog: false,
    settings: {
      isViewOnly: false,
      isScoreLowerBoundEnabled: true,
      scoreLowerBound: 0.35,
    },
    view: "table",
    selectedColumnCellsIds: {},
    selectedColumnsIds: {},
    selectedRowsIds: {},
    selectedCellIds: {},
    expandedColumnsIds: {},
    expandedCellsIds: {},
    editableCellsIds: {},
    deletedColumnsIds: {},
    tmpCell: null,
    tutorialBBoxes: {},
    tutorialStep: 1,
  },
  _requests: { byId: {}, allIds: [] },
  _draft: {
    patches: [],
    inversePatches: [],
    undoPointer: -1,
    redoPointer: -1,
  },
};

export const tableSlice = createSliceWithRequests({
  name: "table",
  initialState,
  reducers: {
    restoreInitialState: (state, action: PayloadAction<void>) => {
      return { ...initialState };
    },
    /**
     * Clear the list of deleted columns (e.g., after successful save or when loading a new table).
     */
    clearDeletedColumns: (state, action: PayloadAction<void>) => {
      state.ui.deletedColumnsIds = {};
    },
    /**
     * Update current table.
     */
    updateCurrentTable: (
      state,
      action: PayloadAction<Payload<UpdateCurrentTablePayload>>,
    ) => {
      state.entities.tableInstance = {
        ...state.entities.tableInstance,
        ...action.payload,
      };
      state.entities.tableInstance.lastModifiedDate = new Date().toISOString();
    },
    updateTable: (state, action: PayloadAction<Payload<GetTableResponse>>) => {
      const { table, columns, rows, columnOrder } = action.payload;
      let tableInstance = {} as TableInstance;
      tableInstance = { ...table };
      state.ui.lastSaved = tableInstance.lastModifiedDate;
      // Clear deleted columns when loading a new table
      state.ui.deletedColumnsIds = {};

      console.log("DEBUG: updateTable called with columnOrder:", columnOrder);
      console.log("DEBUG: available columns:", Object.keys(columns));

      // Use saved column order if available, otherwise fall back to Object.keys
      let allIds: string[];
      if (columnOrder && Array.isArray(columnOrder)) {
        console.log("DEBUG: Using saved columnOrder:", columnOrder);
        // Start with the saved order, but only include columns that actually exist
        allIds = columnOrder.filter((id) => columns[id]);

        // Add any new columns that weren't in the saved order (edge case)
        const existingColumns = Object.keys(columns);
        const missingColumns = existingColumns.filter(
          (id) => !allIds.includes(id),
        );
        allIds = [...allIds, ...missingColumns];
      } else {
        console.log("DEBUG: No columnOrder found, using Object.keys fallback");
        // Fallback to Object.keys if no saved order
        allIds = Object.keys(columns);
      }

      console.log("Table load - using column order:", allIds);
      console.log(
        "Table load - available columnOrder from backend:",
        columnOrder,
      );
      console.log("Table load - available columns:", Object.keys(columns));

      state.entities = {
        tableInstance,
        columns: {
          byId: columns,
          allIds,
        },
        rows: {
          byId: rows,
          allIds: Object.keys(rows),
        },
      };
    },
    updateSchema: (
      state,
      action: PayloadAction<Payload<GetSchemaResponse>>,
    ) => {
      const { table, result } = action.payload;
      let tableInstance = {} as TableInstance;
      tableInstance = { ...table };

      console.log("[updateSchema] called", {
        tableId: table.id,
        currentTableId: tableInstance?.id,
      });

      if (
        !tableInstance ||
        tableInstance.id.toString() !== table.id.toString()
      ) {
        console.log(
          "[updateSchema] skipping: tableInstance missing or id mismatch",
        );
        return;
      }

      state.entities.tableInstance = {
        ...tableInstance,
        ...table,
        schemaStatus: "DONE",
      };

      const updatedColumns = {};
      const columnIdMap = {};

      Object.keys(state.entities.columns.byId).forEach((oldId) => {
        const cleanId = oldId.replace(/^\uFEFF/, "").trim();
        const col = state.entities.columns.byId[oldId];

        if (!col) return;

        columnIdMap[oldId] = cleanId;

        updatedColumns[cleanId] = {
          ...col,
          id: cleanId,
          label: col.label?.replace(/^\uFEFF/, "").trim() ?? cleanId,
          kind: result.kind_classification[cleanId] ?? col.kind ?? "unknown",
          nerClassification:
            result.ner_classification[cleanId] ??
            col.nerClassification ??
            "unknown",
        };
      });

      state.entities.columns.byId = updatedColumns;
      state.entities.columns.allIds = Object.keys(updatedColumns);

      const updatedRows = {};

      Object.entries(state.entities.rows.byId).forEach(([rowId, row]) => {
        const newCells = {};

        Object.entries(row.cells).forEach(([oldColId, cell]) => {
          const cleanColId = columnIdMap[oldColId] ?? oldColId;
          newCells[cleanColId] = cell;
        });

        updatedRows[rowId] = {
          ...row,
          cells: newCells,
        };
      });

      state.entities.rows.byId = updatedRows;

      console.log("[updateSchema] schema applied correctly");
    },
    /**
     *  Set selected cell as expanded.
     */
    updateSelectedCellExpanded: (state, action: PayloadAction<Payload>) => {
      const { undoable = false } = action.payload;
      const {
        selectedColumnsIds,
        expandedCellsIds,
        selectedColumnCellsIds,
        expandedColumnsIds,
        selectedCellIds,
      } = state.ui;
      const uniqueColumns = new Set<string>();

      Object.keys(selectedCellIds).forEach((cellId) => {
        const [_, colId] = cellId.split("$");
        uniqueColumns.add(colId);
      });

      Object.keys(selectedColumnsIds).forEach((colId) => {
        uniqueColumns.add(colId);
      });

      Object.keys(selectedColumnCellsIds).forEach((colId) => {
        uniqueColumns.add(colId);
      });

      uniqueColumns.forEach((colId) => {
        state.ui.expandedColumnsIds = toggleObject(
          state.ui.expandedColumnsIds,
          colId,
          true,
        );
      });
    },
    /**
     * Set cell editable.
     */
    updateColumnEditable: (
      state,
      action: PayloadAction<Payload<UpdateColumnEditablePayload>>,
    ) => {
      const { colId } = action.payload;
      state.ui.editableCellsIds = toggleObject(
        state.ui.editableCellsIds,
        colId,
        true,
      );
    },
    /**
     * Set cell editable.
     */
    updateCellEditable: (
      state,
      action: PayloadAction<Payload<UpdateCellEditablePayload>>,
    ) => {
      const { cellId } = action.payload;
      state.ui.editableCellsIds = toggleObject(
        state.ui.editableCellsIds,
        cellId,
        true,
      );
    },
    /**
     * Handle update of cell label.
     * --UNDOABLE ACTION--
     */
    updateCellLabel: (
      state,
      action: PayloadAction<Payload<UpdateCellLabelPayload>>,
    ) => {
      const { cellId, value, undoable = true } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      if (state.entities.rows.byId[rowId].cells[colId].label !== value) {
        return produceWithPatch(
          state,
          undoable,
          (draft) => {
            draft.entities.rows.byId[rowId].cells[colId].label = value;
          },
          (draft) => {
            // do not include in undo history
            draft.ui.editableCellsIds = removeObject(
              draft.ui.editableCellsIds,
              cellId,
            );
            draft.entities.tableInstance.lastModifiedDate =
              new Date().toISOString();
          },
        );
      }
      // if value is the same just stop editing cell
      state.ui.editableCellsIds = removeObject(
        state.ui.editableCellsIds,
        cellId,
      );
    },
    /**
     * Handle update of cell label of a column.
     * --UNDOABLE ACTION--
     */
    updateColumnCellsLabels: (
      state,
      action: PayloadAction<
        Payload<{ updates: { cellId: ID; value: string }[] }>
      >,
    ) => {
      const { updates, undoable = true } = action.payload;

      return produceWithPatch(
        state,
        undoable,
        (draft) => {
          updates.forEach(({ cellId, value }) => {
            const [rowId, colId] = getIdsFromCell(cellId);
            const cell = getCell(draft, rowId, colId);
            if (cell) {
              cell.label = value;
            }
          });
        },
        (draft) => {
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    addCellMetadata: (
      state,
      action: PayloadAction<Payload<AddCellMetadataPayload>>,
    ) => {
      const { cellId, prefix, value, undoable = true } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      return produceWithPatch(
        state,
        undoable,
        (draft) => {
          const { id, match, name, uri, ...rest } = value;

          const isMatching = match === "true";
          const cell = draft.entities.rows.byId[rowId].cells[colId];
          if (!cell.annotationMeta) {
            cell.annotationMeta = {
              match: { value: false, reason: "" },
              annotated: false,
            };
          }
          const existingMetadata = cell.metadata.findIndex(
            (metaItem) => metaItem.id === id,
          );
          //this replaces items id their id is already in the metadata array
          if (existingMetadata !== -1) {
            draft.entities.rows.byId[rowId].cells[colId].metadata[
              existingMetadata
            ] = {
              ...draft.entities.rows.byId[rowId].cells[colId].metadata[
                existingMetadata
              ],
              match: isMatching,
              name: {
                value: name,
                uri,
              },
            };
          } else {
            if (isMatching) {
              draft.entities.rows.byId[rowId].cells[colId].metadata =
                draft.entities.rows.byId[rowId].cells[colId].metadata.map(
                  (item) => ({ ...item, match: false }),
                );
            }
            //if (id.startsWith(prefix)) {
            //}
            const annotationMetaMatching = cell.annotationMeta.match;
            if (!annotationMetaMatching.value && isMatching) {
              draft.entities.rows.byId[rowId].cells[colId].annotationMeta = {
                ...draft.entities.rows.byId[rowId].cells[colId].annotationMeta,
                match: {
                  value: true,
                  reason: "manual",
                },
              };
            }
            console.log("annotationMetaMatching", annotationMetaMatching);
            const newMeta = {
              id,
              match: isMatching,
              name: {
                value: name,
                uri,
              },
              ...rest,
            };
            draft.entities.rows.byId[rowId].cells[colId].metadata.push(newMeta);
            draft.entities.rows.byId[rowId].cells[colId].annotationMeta = {
              ...draft.entities.rows.byId[rowId].cells[colId].annotationMeta,
              annotated: true,
            };
          }
          //draft.entities.rows.byId[rowId].cells[colId].metadata = [];
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    propagateCellDeleteMetadata: (
      state,
      action: PayloadAction<
        Payload<{ metadataIds: string[]; cellId: string; undoable?: boolean }>
      >,
    ) => {
      try {
        const { metadataIds, cellId, undoable = true } = action.payload;
        const [rowId, colId] = getIdsFromCell(cellId);
        const cell = getCell(state, rowId, colId);
        const cellLabel = cell.label;

        return produceWithPatch(
          state,
          undoable,
          (draft) => {
            // Loop through all the rows, check if the cell has the same label as the one we are deleting the metadatas
            const rowsIds = draft.entities.rows.allIds;
            const column = getColumn(draft, colId);

            for (let i = 0; i < rowsIds.length; i++) {
              const currentRowId = rowsIds[i];
              const currentCell =
                draft.entities.rows.byId[currentRowId].cells[colId];

              // Only process cells with matching labels
              if (currentCell.label === cellLabel) {
                const cellContext = getCellContext(currentCell);
                let hasMatch = false;
                let hadMatchingDeleted = false;

                // Filter out the metadata IDs that need to be deleted
                const originalMetadataLength = currentCell.metadata.length;
                currentCell.metadata = currentCell.metadata.filter((meta) => {
                  const shouldDelete = metadataIds.includes(meta.id);
                  // Track if we're deleting any matching metadata
                  if (shouldDelete && meta.match) {
                    hadMatchingDeleted = true;
                  }
                  return !shouldDelete;
                });

                // Check if any remaining metadata is matching
                if (currentCell.metadata.length > 0) {
                  hasMatch = currentCell.metadata.some((meta) => meta.match);
                }

                // Update the annotation status based on deleted metadata
                if (
                  hadMatchingDeleted ||
                  originalMetadataLength !== currentCell.metadata.length
                ) {
                  // Update column context if needed
                  if (hadMatchingDeleted && !hasMatch) {
                    if (column.context && column.context[cellContext]) {
                      column.context[cellContext] =
                        decrementContextReconciliated(
                          column.context[cellContext],
                        );
                    }
                  }

                  // Update cell annotation meta
                  currentCell.annotationMeta = {
                    ...currentCell.annotationMeta,
                    annotated: currentCell.metadata.length > 0,
                    match: {
                      value: hasMatch,
                      ...(hasMatch && { reason: "manual" }),
                    },
                  };
                }
              }
            }

            // Update column status
            column.status = getColumnStatus(draft, colId);
            updateNumberOfReconciliatedCells(draft);
          },
          (draft) => {
            // do not include in undo history
            draft.entities.tableInstance.lastModifiedDate =
              new Date().toISOString();
          },
        );
      } catch (error) {
        console.error("Error in propagateCellDeleteMetadata:", error);
      }
    },
    propagateCellMetadata: (
      state,
      action: PayloadAction<Payload<AddCellMetadataPayload>>,
    ) => {
      const { metadataId, cellId, value, undoable = true } = action.payload;
      const currentMatchVal = !!value.match;
      console.log("received propagation ids", metadataId, cellId, value);
      const [rowId, colId] = getIdsFromCell(cellId);
      const { metadata } = getCell(state, rowId, colId);
      if (metadata.length > 0) {
        return produceWithPatch(
          state,
          undoable,
          (draft) => {
            const { tableInstance, columns } = draft.entities;
            const column = getColumn(draft, colId);
            const cell = getCell(draft, rowId, colId);
            const cellLabel = cell.label;
            const cellContext = getCellContext(cell);
            const wasReconciliated = isCellReconciliated(cell);
            const currentMetadata = cell.metadata.find(
              (m) => m.id === metadataId,
            );
            console.log("currentMetadata", current(currentMetadata));
            const rowsIds = draft.entities.rows.allIds;
            if (currentMetadata) {
              //this is the metadata object to be sent to the tracking endpoint
              const metadataToTrack = {
                ...current(currentMetadata),
                id: `${currentMetadata.id}`,
                match: currentMetadata.match,
                originalValue: cellLabel,
              };
              console.log("draft entities", current(draft.entities));
              const entities = current(draft.entities);
              const { id, idDataset } = entities.tableInstance;

              tableAPI.trackTable(idDataset, id, {
                operationType: "PROPAGATE_TYPE",
                columnName: colId,
                payload: metadataToTrack,
              });
              for (let i = 0; i < rowsIds.length; i++) {
                const currentRowId = rowsIds[i];

                const currentCell =
                  draft.entities.rows.byId[currentRowId].cells[colId];
                const currentCellName = currentCell.label;
                if (currentCellName === cellLabel) {
                  const correspondingMetadataIndex =
                    currentCell.metadata.findIndex((m) => m.id === metadataId);
                  if (correspondingMetadataIndex !== -1) {
                    // Flip the matching status instead of setting it to true
                    const currentMatch =
                      draft.entities.rows.byId[currentRowId].cells[colId]
                        .metadata[correspondingMetadataIndex].match;
                    draft.entities.rows.byId[currentRowId].cells[
                      colId
                    ].metadata[correspondingMetadataIndex].match =
                      currentMatchVal;

                    // Only handle other metadata items if this one is now matched
                    if (currentMatchVal) {
                      draft.entities.rows.byId[currentRowId].cells[
                        colId
                      ].metadata.forEach((metaItem) => {
                        if (metaItem.id !== currentMetadata.id) {
                          metaItem.match = false;
                        }
                      });
                    }

                    draft.entities.rows.byId[currentRowId].cells[
                      colId
                    ].annotationMeta = {
                      ...draft.entities.rows.byId[currentRowId].cells[colId]
                        .annotationMeta,
                      annotated: true,
                      match: {
                        value: currentMatchVal,
                        reason: "manual",
                      },
                    };
                  } else {
                    draft.entities.rows.byId[currentRowId].cells[
                      colId
                    ].metadata.push({
                      ...currentMetadata,
                      id: `${currentMetadata.id}`,
                      match: currentMetadata.match,
                    });

                    //remove previous matches from metadata if meta to propagate match is true
                    if (currentMetadata.match) {
                      draft.entities.rows.byId[currentRowId].cells[
                        colId
                      ].metadata.forEach((metaItem) => {
                        if (metaItem.id !== currentMetadata.id) {
                          metaItem.match = false;
                        }
                      });
                    }
                    draft.entities.rows.byId[currentRowId].cells[
                      colId
                    ].annotationMeta = {
                      ...draft.entities.rows.byId[currentRowId].cells[colId]
                        .annotationMeta,
                      annotated: true,
                      match: {
                        value: currentMatchVal,
                        reason: "manual",
                      },
                    };
                  }
                }
              }
            }
          },
          (draft) => {
            // do not include in undo history
            draft.entities.tableInstance.lastModifiedDate =
              new Date().toISOString();
          },
        );
      }
    },
    /**
     * Handle the assignment of a metadata to a cell.
     * --UNDOABLE ACTION--
     */
    updateCellMetadata: (
      state,
      action: PayloadAction<Payload<UpdateCellMetadataPayload>>,
    ) => {
      const {
        metadataId,
        cellId,
        undoable = true,
        match = false,
      } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);
      const { metadata } = getCell(state, rowId, colId);

      if (metadata.length > 0) {
        return produceWithPatch(
          state,
          undoable,
          (draft) => {
            const { tableInstance, columns } = draft.entities;
            const column = getColumn(draft, colId);
            const cell = getCell(draft, rowId, colId);
            const cellContext = getCellContext(cell);
            const wasReconciliated = isCellReconciliated(cell);
            let matched = false;
            cell.metadata.forEach((metaItem) => {
              if (metaItem.id === metadataId) {
                metaItem.match = match || !metaItem.match;
                matched = metaItem.match;
              } else {
                metaItem.match = false;
              }
            });
            console.log("matched", matched);
            if (wasReconciliated && !isCellReconciliated(cell)) {
              if (!column.context || !column.context[cellContext]) {
                column.context[cellContext] = {
                  reconciliated: 0,
                  total: column.metadata.length,
                  uri: "",
                };
              } else {
                column.context[cellContext] = decrementContextReconciliated(
                  column.context[cellContext],
                );
              }

              cell.annotationMeta = {
                ...cell.annotationMeta,
                match: {
                  value: match || matched,
                },
              };
            } else if (!wasReconciliated && isCellReconciliated(cell)) {
              // if(!column.context){
              //   column.context[cellContext] = {

              //   }
              // }
              if (!column.context || !column.context[cellContext]) {
                column.context[cellContext] = {
                  reconciliated: 1,
                  total: column.metadata.length,
                  uri: "",
                };
              } else {
                column.context[cellContext] = incrementContextReconciliated(
                  column.context[cellContext],
                );
              }
              cell.annotationMeta = {
                ...cell.annotationMeta,
                match: {
                  value: true,
                  reason: "manual",
                },
              };
            } else if (wasReconciliated && isCellReconciliated(cell)) {
              cell.annotationMeta = {
                ...cell.annotationMeta,
                match: {
                  value: true,
                  reason: "manual",
                },
              };
            }
            column.status = getColumnStatus(draft, colId);
            updateNumberOfReconciliatedCells(draft);
          },
          (draft) => {
            // do not include in undo history
            draft.entities.tableInstance.lastModifiedDate =
              new Date().toISOString();
          },
        );
      }
    },
    /**
     * Handle the assignment of a metadata to a cell.
     * --UNDOABLE ACTION--
     */
    addColumnMetadata: (
      state,
      action: PayloadAction<Payload<AddColumnMetadataPayload>>,
    ) => {
      const { colId, type, prefix, value, undoable = true } = action.payload;

      const column = getColumn(state, colId);

      switch (type) {
        case "entity": {
          if (
            column.metadata /*.length > 0
              && column.metadata[0].entity
              && column.metadata[0].entity.length > 0*/
          ) {
            return produceWithPatch(
              state,
              undoable,
              (draft) => {
                const columnToUpdate = getColumn(draft, colId);
                const { id, match, name, uri, ...rest } = value;

                const isMatching = match === "true";

                if (
                  columnToUpdate.metadata.length > 0 &&
                  columnToUpdate.metadata[0].entity &&
                  columnToUpdate.metadata[0].entity.length > 0 &&
                  draft.entities.columns.byId[colId].metadata &&
                  draft.entities.columns.byId[colId].metadata[0].entity
                ) {
                  if (isMatching) {
                    draft.entities.columns.byId[colId].metadata[0].entity =
                      draft.entities.columns.byId[
                        colId
                      ].metadata[0].entity?.map((item) => ({
                        ...item,
                        match: false,
                      }));
                  }
                }

                const newMeta = {
                  //id: `${prefix}:${id}`,
                  id: `${id}`,
                  match: isMatching,
                  name: {
                    value: name,
                    uri,
                  },
                  ...rest,
                };

                draft.entities.columns.byId[colId].metadata = [
                  {
                    ...draft.entities.columns.byId[colId].metadata[0],
                    entity: [
                      ...(draft.entities.columns.byId[colId].metadata[0]
                        ?.entity || []),
                      newMeta,
                    ],
                  },
                ];

                //draft.entities.columns.byId[colId].metadata[0].entity?.push(newMeta);
              },
              (draft) => {
                // do not include in undo history
                draft.entities.tableInstance.lastModifiedDate =
                  new Date().toISOString();
              },
            );
          }
          break;
        }
        case "property": {
          return produceWithPatch(
            state,
            undoable,
            (draft) => {
              const columnToUpdate = getColumn(draft, colId);
              const { id, match, name, uri, obj, description, ...rest } = value;
              const isMatching = match === "true";

              for (let i = 0; i < draft.entities.columns.allIds.length; i++) {
                const currentId = draft.entities.columns.allIds[i];
                if (currentId !== colId) {
                  draft.entities.columns.byId[currentId].role = undefined;
                }
              }
              draft.entities.columns.byId[colId].role = "subject";

              if (
                columnToUpdate.metadata.length > 0 &&
                columnToUpdate.metadata[0].property &&
                columnToUpdate.metadata[0].property.length > 0 &&
                draft.entities.columns.byId[colId].metadata &&
                draft.entities.columns.byId[colId].metadata[0].property
              ) {
                if (isMatching) {
                  draft.entities.columns.byId[colId].metadata[0].property =
                    draft.entities.columns.byId[
                      colId
                    ].metadata[0].property?.map((item) => ({
                      ...item,
                      match: true,
                    }));
                }
              }

              const newMeta = {
                //id: `${prefix}:${id}`,
                id: `${id}`,
                obj: value.obj,
                match: isMatching,
                name,
                description: value.description,
                ...rest,
              };

              draft.entities.columns.byId[colId].metadata = [
                {
                  ...draft.entities.columns.byId[colId].metadata[0],
                  role: "subject",
                  property: [
                    ...(draft.entities.columns.byId[colId].metadata[0]
                      ?.property || []),
                    newMeta,
                  ],
                },
              ];

              //draft.entities.columns.byId[colId].metadata[0].property?.push(newMeta);
            },
            (draft) => {
              // do not include in undo history
              draft.entities.tableInstance.lastModifiedDate =
                new Date().toISOString();
            },
          );
          break;
        }
      }
    },
    /**
     * Handle the deletion of a metadata to a column.
     * --UNDOABLE ACTION--
     */
    deleteColumnMetadata: (
      state,
      action: PayloadAction<Payload<DeleteColumnMetadataPayload>>,
    ) => {
      const { colId, type, metadataId, undoable = true } = action.payload;

      const column = getColumn(state, colId);

      switch (type) {
        case "entity": {
          if (
            column.metadata.length > 0 &&
            column.metadata[0].entity &&
            column.metadata[0].entity.length > 0
          ) {
            return produceWithPatch(
              state,
              undoable,
              (draft) => {
                const columnToUpdate = getColumn(draft, colId);

                if (
                  columnToUpdate.metadata.length > 0 &&
                  columnToUpdate.metadata[0].entity &&
                  columnToUpdate.metadata[0].entity.length > 0 &&
                  draft.entities.columns.byId[colId].metadata &&
                  draft.entities.columns.byId[colId].metadata[0].entity
                ) {
                  draft.entities.columns.byId[colId].metadata[0].entity =
                    draft.entities.columns.byId[
                      colId
                    ].metadata[0].entity?.filter(
                      (item) => item.id !== metadataId,
                    );
                }
              },
              (draft) => {
                // do not include in undo history
                draft.entities.tableInstance.lastModifiedDate =
                  new Date().toISOString();
              },
            );
          }
          break;
        }
        case "property": {
          if (
            column.metadata.length > 0 &&
            column.metadata[0].property
            /*&& column.metadata[0].property.length > 0*/
          ) {
            return produceWithPatch(
              state,
              undoable,
              (draft) => {
                const columnToUpdate = getColumn(draft, colId);

                if (
                  columnToUpdate.metadata.length > 0 &&
                  columnToUpdate.metadata[0].property &&
                  /*&& columnToUpdate.metadata[0].property.length > 0*/
                  draft.entities.columns.byId[colId].metadata &&
                  draft.entities.columns.byId[colId].metadata[0].property
                ) {
                  draft.entities.columns.byId[colId].metadata[0].property =
                    draft.entities.columns.byId[
                      colId
                    ].metadata[0].property?.filter(
                      (item) => item.id !== metadataId,
                    );
                }
              },
              (draft) => {
                // do not include in undo history
                draft.entities.tableInstance.lastModifiedDate =
                  new Date().toISOString();
              },
            );
          }
          break;
        }
      }
    },
    updateColumnRole: (
      state,
      action: PayloadAction<Payload<{ colId: ID; role: string }>>,
    ) => {
      const { colId, role } = action.payload;
      return produceWithPatch(
        state,
        true,
        (draft) => {
          if (role !== "none") {
            for (let i = 0; i < draft.entities.columns.allIds.length; i++) {
              const currentId = draft.entities.columns.allIds[i];
              if (currentId !== colId) {
                draft.entities.columns.byId[currentId].role = undefined;
              }
            }
          }
          draft.entities.columns.byId[colId].role = role;
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    updateColumnKind: (
      state,
      action: PayloadAction<Payload<{ colId: ID; kind: string }>>,
    ) => {
      const { colId, kind } = action.payload;
      const column = getColumn(state, colId);
      return produceWithPatch(
        state,
        true,
        (draft) => {
          const columnToUpdate = getColumn(draft, colId);
          draft.entities.columns.byId[colId].kind = kind;
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    updateColumnPropertyMetadata: (
      state,
      action: PayloadAction<Payload<UpdateColumnMetadataPayload>>,
    ) => {
      const { metadataId, colId, undoable = true } = action.payload;

      const column = getColumn(state, colId);

      if (
        column.metadata.length > 0 &&
        column.metadata[0].entity &&
        column.metadata[0].entity.length > 0
      ) {
        return produceWithPatch(
          state,
          undoable,
          (draft) => {
            const columnToUpdate = getColumn(draft, colId);

            if (
              columnToUpdate.metadata.length > 0 &&
              columnToUpdate.metadata[0].property &&
              columnToUpdate.metadata[0].property.length > 0
            ) {
              columnToUpdate.metadata[0].property.forEach((metaItem) => {
                if (metaItem.id === metadataId) {
                  columnToUpdate.annotationMeta = {
                    ...columnToUpdate.annotationMeta,
                    match: {
                      value: !metaItem.match,
                      ...(!metaItem.match && {
                        reason: "manual",
                      }),
                    },
                  };
                  metaItem.match = !metaItem.match;
                }
              });
            }
          },
          (draft) => {
            // do not include in undo history
            draft.entities.tableInstance.lastModifiedDate =
              new Date().toISOString();
          },
        );
      }
    },
    updateColumnMetadata: (
      state,
      action: PayloadAction<Payload<UpdateColumnMetadataPayload>>,
    ) => {
      const { metadataId, colId, undoable = true } = action.payload;

      const column = getColumn(state, colId);

      if (
        column.metadata.length > 0 &&
        column.metadata[0].entity &&
        column.metadata[0].entity.length > 0
      ) {
        return produceWithPatch(
          state,
          undoable,
          (draft) => {
            const columnToUpdate = getColumn(draft, colId);

            if (
              columnToUpdate.metadata.length > 0 &&
              columnToUpdate.metadata[0].entity &&
              columnToUpdate.metadata[0].entity.length > 0
            ) {
              columnToUpdate.metadata[0].entity.forEach((metaItem) => {
                if (metaItem.id === metadataId) {
                  columnToUpdate.annotationMeta = {
                    ...columnToUpdate.annotationMeta,
                    match: {
                      value: !metaItem.match,
                      ...(!metaItem.match && {
                        reason: "manual",
                      }),
                    },
                  };
                  metaItem.match = !metaItem.match;
                } else {
                  metaItem.match = false;
                }
              });
            }
          },
          (draft) => {
            // do not include in undo history
            draft.entities.tableInstance.lastModifiedDate =
              new Date().toISOString();
          },
        );
      }
    },
    /**
     * Handle deletion of a metadata value.
     * --UNDOABLE ACTION--
     */
    deleteCellMetadata: (
      state,
      action: PayloadAction<Payload<DeleteCellMetadataPayload>>,
    ) => {
      console.log("deleteCellMetadata", action.payload);
      const { metadataId, cellId, undoable = true } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      return produceWithPatch(
        state,
        undoable,
        (draft) => {
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
            column.context[cellContext] = decrementContextTotal(
              column.context[cellContext],
            );
            if (wasMatch) {
              column.context[cellContext] = decrementContextReconciliated(
                column.context[cellContext],
              );
              draft.entities.rows.byId[rowId].cells[colId].annotationMeta = {
                ...draft.entities.rows.byId[rowId].cells[colId].annotationMeta,
                annotated: true,
                match: {
                  value: false,
                },
              };
            }
          } else if (wasMatch) {
            column.context[cellContext] = decrementContextReconciliated(
              column.context[cellContext],
            );
            draft.entities.rows.byId[rowId].cells[colId].annotationMeta = {
              ...draft.entities.rows.byId[rowId].cells[colId].annotationMeta,
              annotated: true,
              match: {
                value: false,
              },
            };
          }
          column.status = getColumnStatus(draft, colId);
          updateNumberOfReconciliatedCells(draft);
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    refineMatching: (
      state,
      action: PayloadAction<Payload<RefineMatchingPayload>>,
    ) => {
      const { changes, undoable = true } = action.payload;

      return produceWithPatch(
        state,
        undoable,
        (draft) => {
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
                  column.context[previousContext],
                );
              }
              cell.metadata.forEach((metaItem) => {
                if (metaItem.id === change.metaItemId) {
                  metaItem.match = true;
                } else {
                  metaItem.match = false;
                }
              });
              cell.annotationMeta.match = { value: true, reason: "refinement" };
              const currentContext = getCellContext(cell);
              column.context[currentContext] = incrementContextReconciliated(
                column.context[currentContext],
              );
            } else {
              const previousContext = getCellContext(cell);
              column.context[previousContext] = decrementContextReconciliated(
                column.context[previousContext],
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
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },

    /**
     * Handle auto matching operations.
     * It updates cell matching metadata based on threshold.
     * --UNDOABLE ACTION--
     */
    autoMatching: (
      state,
      action: PayloadAction<Payload<AutoMatchingPayload>>,
    ) => {
      const { threshold, undoable = true } = action.payload;

      return produceWithPatch(
        state,
        undoable,
        (draft) => {
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
                    column.context[cellContext],
                  );
                  cell.annotationMeta = {
                    ...cell.annotationMeta,
                    match: {
                      value: false,
                    },
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
                  column.context[cellContext],
                );
                cell.annotationMeta = {
                  ...cell.annotationMeta,
                  match: {
                    value: true,
                    reason: "refinement",
                  },
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
                            value: false,
                          },
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
                            reason: "refinement",
                          },
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
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    addColumnType: (
      state,
      action: PayloadAction<Payload<AddColumnTypePayload[]>>,
    ) => {
      const undoable = true;
      const colId =
        state.ui.metadataColumnDialogColId ||
        Object.keys(state.ui.selectedColumnCellsIds)[0];
      const nextState = produceWithPatch(
        state,
        undoable,
        (draft) => {
          const { columns } = draft.entities;
          const newTypes = action.payload.newTypes.map((type) => ({
            ...type,
            match: true,
            score: 100,
          }));

          // Ensure metadata[0] exists
          if (!columns.byId[colId].metadata[0]) {
            columns.byId[colId].metadata[0] = {
              type: newTypes,
            };
          } else {
            // Merge newTypes into the main metadata[0].type array (replace same id or append)
            const existingMainTypes =
              columns.byId[colId].metadata[0].type || [];
            const mergedMain = [...existingMainTypes];
            newTypes.forEach((newType) => {
              const idx = mergedMain.findIndex((t: any) => t.id === newType.id);
              if (idx !== -1) {
                mergedMain[idx] = { ...mergedMain[idx], ...newType };
              } else {
                mergedMain.push(newType);
              }
            });
            columns.byId[colId].metadata[0].type = mergedMain;
          }

          // Ensure additionalTypes exists and merge newTypes there as well
          if (!columns.byId[colId].metadata[0].additionalTypes) {
            columns.byId[colId].metadata[0].additionalTypes = newTypes;
          } else {
            // Check for existing types with the same ID and replace them
            const existingTypes =
              columns.byId[colId].metadata[0].additionalTypes || [];
            const mergedTypes = [...existingTypes];
            console.log("existingTypes", existingTypes);
            console.log("newTypes", newTypes);
            newTypes.forEach((newType) => {
              const existingIndex = mergedTypes.findIndex(
                (existingType) => existingType.id === newType.id,
              );
              if (existingIndex !== -1) {
                // Replace existing type with the same ID
                mergedTypes[existingIndex] = {
                  ...mergedTypes[existingIndex],
                  ...newType,
                };
              } else {
                // Add new type if ID doesn't exist
                mergedTypes.push(newType);
              }
            });

            columns.byId[colId].metadata[0].additionalTypes = mergedTypes;
          }

          // Ensure match flags are set consistently on metadata[0].type entries
          if (columns.byId[colId].metadata[0].type) {
            columns.byId[colId].metadata[0].type = columns.byId[
              colId
            ].metadata[0].type.map((t: any) => ({
              ...t,
              match: !!t.match,
            }));
          }
          // Ensure match flags are set on additionalTypes too
          if (columns.byId[colId].metadata[0].additionalTypes) {
            columns.byId[colId].metadata[0].additionalTypes = columns.byId[
              colId
            ].metadata[0].additionalTypes.map((t: any) => ({
              ...t,
              match: !!t.match,
            }));
          }
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
      return nextState;
    },
    /**
     * Handle update of the type of a column
     * -- UNDOABLE ACTION --
     */
    updateColumnType: (
      state,
      action: PayloadAction<Payload<UpdateColumnTypePayload[]>>,
    ) => {
      // const { undoable = true, ...type } = action.payload;
      const undoable = true;
      const colId =
        state.ui.metadataColumnDialogColId ||
        Object.keys(state.ui.selectedColumnCellsIds)[0];

      const nextState = produceWithPatch(
        state,
        undoable,
        (draft) => {
          const { columns } = draft.entities;
          const newTypes = action.payload.map((type) => ({
            ...type,
            match: true,
            score: 100,
          }));

          if (columns.byId[colId].metadata.length === 0) {
            (columns.byId[colId].metadata as any) = [
              {
                type: newTypes,
              },
            ];
          } else {
            (columns.byId[colId].metadata[0].type as any) = newTypes;
          }
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );

      return nextState;
    },
    /**
     * Update the match property of column types without replacing them
     * -- UNDOABLE ACTION --
     */
    updateColumnTypeMatches: (
      state,
      action: PayloadAction<Payload<UpdateColumnTypeMatchesPayload>>,
    ) => {
      const { typeIds, undoable = true } = action.payload;
      console.log("updateColumnTypeMatches", action.payload);
      const colId =
        state.ui.metadataColumnDialogColId ||
        Object.keys(state.ui.selectedColumnCellsIds)[0];

      return produceWithPatch(
        state,
        undoable,
        (draft) => {
          const { columns } = draft.entities;

          if (columns.byId[colId].metadata.length === 0) {
            return; // No metadata to update
          }

          // If there are types already, update their match property
          if (columns.byId[colId].metadata[0].type) {
            columns.byId[colId].metadata[0].type = columns.byId[
              colId
            ].metadata[0].type.map((type: any) => ({
              ...type,
              match: typeIds.includes(type.id),
            }));
          }

          // Also update additionalTypes match property if present
          if (columns.byId[colId].metadata[0].additionalTypes) {
            columns.byId[colId].metadata[0].additionalTypes = columns.byId[
              colId
            ].metadata[0].additionalTypes.map((type: any) => ({
              ...type,
              match: typeIds.includes(type.id),
            }));
          }
        },
        (draft) => {
          // do not include in undo history
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    /**
     * Handle changes to selected columns.
     */
    updateColumnSelection: (
      state,
      action: PayloadAction<UpdateSelectedColumnPayload>,
    ) => {
      const { id: colId, multi } = action.payload;
      if (multi) {
        toggleColumnSelection(state, colId);
      } else {
        selectOneColumn(state, colId);
      }
    },
    updateColumnCellsSelection: (
      state,
      action: PayloadAction<UpdateSelectedColumnPayload>,
    ) => {
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
    updateCellSelection: (
      state,
      action: PayloadAction<Payload<UpdateSelectedCellsPayload>>,
    ) => {
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
    updateRowSelection: (
      state,
      action: PayloadAction<Payload<UpdateSelectedRowPayload>>,
    ) => {
      const { id: rowId, multi } = action.payload;

      if (multi) {
        toggleRowSelection(state, rowId);
      } else {
        selectOneRow(state, rowId);
      }
    },
    setHelpStart: (
      state,
      action: PayloadAction<boolean | "tutorial" | "rec" | "ext">,
    ) => {
      state.ui.helpStart = action.payload;
    },
    setGraphTutorialStart: (
      state,
      action: PayloadAction<boolean | "tutorial">,
    ) => {
      state.ui.graphTutorialStart = action.payload;
    },
    /**
     * Merges parameters of the UI to the current state.
     */
    updateUI: (
      state,
      action: PayloadAction<Payload<Partial<TableUIState>>>,
    ) => {
      const { undoable, ...rest } = action.payload;
      state.ui = { ...state.ui, ...rest };
    },
    addTutorialBox: (
      state,
      action: PayloadAction<{ id: string; bbox: BBox }>,
    ) => {
      const { id, bbox } = action.payload;
      state.ui.tutorialBBoxes[id] = bbox;
    },
    /**
     * Delete selected columns and/or rows.
     * --UNDOABLE ACTION--
     */
    deleteSelected: (
      state,
      action: PayloadAction<Payload<DeleteSelectedPayload>>,
    ) => {
      const { undoable = true } = action.payload;
      return produceWithPatch(
        state,
        undoable,
        (draft) => {
          if (areRowsColumnsSelected(draft)) {
            if (areOnlyRowsSelected(draft)) {
              deleteSelectedRows(draft);
            } else {
              deleteSelectedColumns(draft);
              deleteSelectedRows(draft);
            }
          }
          updateNumberOfReconciliatedCells(draft);
        },
        (draft) => {
          // do not include in undo history
          draft.ui.selectedColumnsIds = {};
          draft.ui.selectedRowsIds = {};
          draft.ui.selectedCellIds = {};
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    deleteColumn: (
      state,
      action: PayloadAction<Payload<DeleteColumnPayload>>,
    ) => {
      const { undoable = true, colId } = action.payload;
      return produceWithPatch(
        state,
        undoable,
        (draft) => {
          // Track the deleted column before deleting it
          const columnToDelete = draft.entities.columns.byId[colId];
          if (columnToDelete) {
            draft.ui.deletedColumnsIds[colId] = columnToDelete.label || colId;
          }
          deleteOneColumn(draft, colId);
          // Update columns'list
          delete draft.entities.columns.byId[colId];
          draft.entities.columns.allIds = draft.entities.columns.allIds.filter(
            (id) => id !== colId,
          );
          Object.values(draft.entities.rows.byId).forEach((row) => {
            delete row.cells[colId];
          });
        },
        (draft) => {
          draft.ui.selectedColumnsIds = {};
          draft.ui.selectedCellIds = {};
        },
      );
    },
    deleteRow: (state, action: PayloadAction<Payload<DeleteRowPayload>>) => {
      const { undoable = true, rowId } = action.payload;
      return produceWithPatch(
        state,
        undoable,
        (draft) => {
          deleteOneRow(draft, rowId);
        },
        (draft) => {
          draft.ui.selectedRowsIds = {};
          draft.ui.selectedCellIds = {};
        },
      );
    },
    copyCell: (state, action: PayloadAction<CopyCellPayload>) => {
      const { cellId } = action.payload;
      const [rowId, colId] = getIdsFromCell(cellId);

      const cell = getCell(state, rowId, colId);

      state.ui.tmpCell = cell;
    },
    pasteCell: (state, action: PayloadAction<Payload<PasteCellPayload>>) => {
      const { undoable = true, cellId } = action.payload;
      return produceWithPatch(
        state,
        undoable,
        (draft) => {
          const { tmpCell } = draft.ui;
          const [rowId, colId] = getIdsFromCell(cellId);

          if (tmpCell) {
            const { id, ...rest } = tmpCell;

            draft.entities.rows.byId[rowId].cells[colId] = {
              id: `${rowId}$${colId}`,
              ...rest,
            };
          }
        },
        (draft) => {
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    /**
     * Perform an undo by applying undo patches (past patches).
     */
    undo: (state, action: PayloadAction<number>) => {
      return applyUndoPatches(
        state,
        action.payload ? action.payload : 1,
        (draft) => {
          draft.ui.selectedColumnCellsIds = {};
          draft.ui.selectedColumnsIds = {};
          draft.ui.selectedRowsIds = {};
          draft.ui.selectedCellIds = {};
          draft.entities.tableInstance.lastModifiedDate =
            new Date().toISOString();
        },
      );
    },
    /**
     * Perform a redo by applying redo patches (future patches).
     */
    redo: (state, action: PayloadAction<void>) => {
      return applyRedoPatches(state, (draft) => {
        draft.entities.tableInstance.lastModifiedDate =
          new Date().toISOString();
      });
    },
    updateColumnVisibility: (
      state,
      action: PayloadAction<{ id: string; isVisible: boolean }>,
    ) => {
      state.ui.columnVisibility[action.payload.id] = action.payload.isVisible;
    },
  },
  extraRules: (builder) =>
    builder
      .addCase(
        getTable.fulfilled,
        (state, action: PayloadAction<GetTableResponse>) => {
          const { table, columns, rows, columnOrder } = action.payload;
          let tableInstance = {} as TableInstance;
          tableInstance = { ...table };
          state.ui.lastSaved = tableInstance.lastModifiedDate;

          // Use saved column order if available, otherwise fall back to Object.keys
          let allIds: string[];
          if (columnOrder && Array.isArray(columnOrder)) {
            console.log(
              "DEBUG: getTable.fulfilled - Using saved columnOrder:",
              columnOrder,
            );
            // Start with the saved order, but only include columns that actually exist
            allIds = columnOrder.filter((id) => columns[id]);

            // Add any new columns that weren't in the saved order (edge case)
            const existingColumns = Object.keys(columns);
            const missingColumns = existingColumns.filter(
              (id) => !allIds.includes(id),
            );
            allIds = [...allIds, ...missingColumns];
          } else {
            console.log(
              "DEBUG: getTable.fulfilled - No columnOrder found, using Object.keys fallback",
            );
            // Fallback to Object.keys if no saved order
            allIds = Object.keys(columns);
          }

          state.entities = {
            tableInstance,
            columns: {
              byId: columns,
              allIds,
            },
            rows: {
              byId: rows,
              allIds: Object.keys(rows),
            },
          };
          // Set default scoreLowerBound to 0.35 if not already set
          if (state.ui.settings.scoreLowerBound === 0) {
            state.ui.settings.scoreLowerBound = 0.35;
          }
          state.entities.columns.allIds.forEach((colId) => {
            const column = getColumn(state, colId);
            if (column) {
              column.status = getColumnStatus(state, colId);
            }
          });
          // update global counters derived from contexts / metadata
          updateNumberOfReconciliatedCells(state);
          updateScoreBoundaries(state);
        },
      )
      .addCase(
        saveTable.fulfilled,
        (state, action: PayloadAction<TableInstance>) => {
          state.ui.lastSaved = action.payload.lastModifiedDate;
        },
      )
      /**
       * Set metadata on request fulfilled.
       * --UNDOABLE ACTION--
       */
      .addCase(
        reconcile.fulfilled,
        (
          state,
          action: PayloadAction<Payload<ReconciliationFulfilledPayload>>,
        ) => {
          const { data, reconciliator, undoable = true } = action.payload;
          console.log("reconcile data", data);

          //if inTableLinker, use the reconciliator with the corresponding selected prefix
          const effectiveReconciliator =
            (data as any).reconciliator && reconciliator.id === "inTableLinker"
              ? (data as any).reconciliator
              : reconciliator;

          const { id: reconcilerId, prefix, uri } = effectiveReconciliator;
          console.log("*** recon Id used", reconcilerId);
          return produceWithPatch(
            state,
            undoable,
            (draft) => {
              console.log("*** reconciliation data ***", action.payload);
              const rawArray = Array.isArray(data) ? data : Object.values(data);
              const dataArray = rawArray.filter((item) => item != null) as {
                id: string;
                metadata: any[];
              }[];

              const colIds = new Set<string>();

              dataArray.forEach(({ id }) => {
                if (id.includes("$")) {
                  const [, colId] = getIdsFromCell(id);
                  colIds.add(colId);
                } else {
                  colIds.add(id);
                }
              });

              colIds.forEach((colId) => {
                const column = getColumn(draft, colId);
                if (column && column.kind !== "entity") {
                  column.kind = "entity";
                }
              });

              dataArray.forEach(({ id: cellId, metadata }) => {
                if (cellId.includes("$")) {
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
                      cell,
                    );
                  }
                  // assign new reconciliator and metadata
                  // cell.metadata.reconciliator.id = reconciliator.id;
                  console.log(
                    "debug effective reconciliator object",
                    effectiveReconciliator,
                  );
                  cell.metadata = metadata.map(({ id, name, ...rest }) => {
                    const [_, metaId] = id.split(":");
                    console.log("rest of the item", rest);
                    return {
                      id,
                      name: {
                        value: name as unknown as string,
                        //uri: `${KG_INFO[prefix as keyof typeof KG_INFO].uri}${metaId}`
                        uri: buildURI(
                          effectiveReconciliator.uri || rest.uri,
                          metaId,
                        ),
                      },
                      ...rest,
                    };
                  });
                  cell.annotationMeta = {
                    annotated: true,
                    ...computeCellAnnotationStats(cell),
                  };
                  cell.reconciler = reconcilerId;
                  // increment current
                  if (
                    !column.context[prefix] ||
                    isEmptyObject(column.context[prefix])
                  ) {
                    // create context if doesn't exist
                    column.context[prefix] = createContext({ uri });
                  }
                  column.context[prefix] = incrementContextCounters(
                    column.context[prefix],
                    cell,
                  );
                  // update column status after changes
                  column.status = getColumnStatus(draft, colId);
                } else {
                  // get column
                  const column = getColumn(draft, cellId);

                  if (
                    column &&
                    Array.isArray(column.metadata) &&
                    column.metadata.length > 0
                  ) {
                    column.metadata[0].entity = metadata.map(
                      ({ id, name, ...rest }) => {
                        const [_, metaId] = id.split(":");
                        return {
                          id,
                          name: {
                            value: name as unknown as string,
                            //uri: `${KG_INFO[prefix as keyof typeof KG_INFO].uri}${metaId}`
                            uri: buildURI(
                              effectiveReconciliator.uri || rest.uri,
                              metaId,
                            ),
                          },
                          ...rest,
                        };
                      },
                    );
                    console.log("current meta", metadata);
                    if (
                      metadata.length > 0 &&
                      metadata.some((m) => m.property)
                    ) {
                      console.log("found property", metadata);
                      const newProps = metadata.flatMap((metas) => {
                        if (metas.property) {
                          return metas.property.map((property) => ({
                            ...property,
                            match: true,
                          }));
                        }
                        return [];
                      });

                      column.metadata[0].property = [
                        ...(column.metadata[0].property || []),
                        ...newProps,
                      ];
                    }
                    if (column.metadata[0].type) {
                      column.metadata[0].type = metadata.flatMap((metas) => {
                        if (metas.type) {
                          return metas.type.map((type) => ({
                            ...type,
                          }));
                        }
                        return [];
                      });
                    }
                  } else if (column && Array.isArray(column.metadata)) {
                    column.metadata[0] = {
                      id: "None:",
                      match: true,
                      score: 0,
                      name: { value: "", uri: "" },
                      type: metadata.flatMap((metas) => {
                        if (metas.type) {
                          return metas.type.map((type) => ({
                            ...type,
                          }));
                        }
                        return [];
                      }),
                      property: metadata.flatMap((metas) => {
                        if (metas.property) {
                          return metas.property.map((property) => ({
                            ...property,
                            match: true,
                          }));
                        }
                        return [];
                      }),
                      entity: metadata.map(({ id, name, ...rest }) => {
                        const [_, metaId] = id.split(":");
                        return {
                          id,
                          name: {
                            value: name as unknown as string,
                            //uri: `${KG_INFO[prefix as keyof typeof KG_INFO].uri}${metaId}`
                            uri: buildURI(
                              effectiveReconciliator.uri || rest.uri,
                              metaId,
                            ),
                          },
                          ...rest,
                        };
                      }),
                    };

                    column.annotationMeta = {
                      annotated: true,
                      ...computeColumnAnnotationStats(column),
                    };
                    //set reconciler id used
                    column.reconciler = reconcilerId;
                  }
                }
              });
              updateNumberOfReconciliatedCells(draft);
              updateScoreBoundaries(draft);
            },
            (draft) => {
              draft.entities.tableInstance.lastModifiedDate =
                new Date().toISOString();
            },
          );
        },
      )
      .addCase(
        automaticAnnotation.fulfilled,
        (state, action: PayloadAction<Payload<AutomaticAnnotationPayload>>) => {
          const { datasetId, tableId, mantisStatus, schemaStatus } =
            action.payload;
          console.log("[automaticAnnotation.fulfilled]", action.payload);
          if (mantisStatus) {
            state.entities.tableInstance.mantisStatus = mantisStatus;
          }
          if (schemaStatus) {
            state.entities.tableInstance.schemaStatus = schemaStatus;
          }
          state.ui.settings.isViewOnly = true;
        },
      )
      .addCase(
        extend.fulfilled,
        (state, action: PayloadAction<Payload<ExtendThunkResponseProps>>) => {
          const {
            data,
            extender,
            selectedColumnId,
            undoable = true,
          } = action.payload;

          const { columns, meta, originalColMeta } = data;
          const newColumnsIds = Object.keys(columns);
          return produceWithPatch(
            state,
            undoable,
            (draft) => {
              // Find the index of the selected column that was extended
              const selectedColumnIndex =
                draft.entities.columns.allIds.findIndex(
                  (colId) => colId === selectedColumnId,
                );

              newColumnsIds.forEach((newColId, newColIndex) => {
                const {
                  metadata: columnMetadata,
                  cells,
                  label,
                  ...rest
                } = columns[newColId];

                // add new column
                draft.entities.columns.byId[newColId] = {
                  id: newColId,
                  label,
                  metadata: getColumnMetadata(columnMetadata),
                  status: ColumnStatus.EMPTY,
                  context: {},
                  ...getColumnAnnotationMeta(columnMetadata),
                  ...rest,
                };

                // add rows

                draft.entities.rows.allIds.forEach((rowId) => {
                  const newCell = createCell(rowId, newColId, cells[rowId]);
                  if (newCell.metadata.length === 0) {
                    newCell.annotationMeta = {
                      annotated: false,
                      match: {
                        value: false,
                      },
                    };
                  }
                  draft.entities.rows.byId[rowId].cells[newColId] = newCell;
                  if (newCell.metadata.length > 0) {
                    updateContext(draft, newCell);
                  }
                });

                draft.entities.columns.byId[newColId].status = getColumnStatus(
                  draft,
                  newColId,
                );

                // Insert the new column right after the selected column
                if (!draft.entities.columns.allIds.includes(newColId)) {
                  // Calculate insert position: right after the selected column + existing extended columns
                  const insertIndex = selectedColumnIndex + 1 + newColIndex;

                  draft.entities.columns.allIds.splice(
                    insertIndex,
                    0,
                    newColId,
                  );
                }
              });
              updateNumberOfReconciliatedCells(draft);
              //add additional meta if needed (up to now only properties)
              if (originalColMeta && originalColMeta.originalColName) {
                if (
                  draft.entities.columns.byId[originalColMeta.originalColName]
                    .metadata[0].property
                ) {
                  draft.entities.columns.byId[
                    originalColMeta.originalColName
                  ].metadata[0].property = [
                    ...draft.entities.columns.byId[
                      originalColMeta.originalColName
                    ].metadata[0].property,
                    ...originalColMeta.properties,
                  ];
                } else {
                  draft.entities.columns.byId[
                    originalColMeta.originalColName
                  ].metadata[0].property = originalColMeta.properties;
                }
              }
            },
            (draft) => {
              draft.entities.tableInstance.lastModifiedDate =
                new Date().toISOString();
            },
          );

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
        },
      )
      .addCase(
        modify.fulfilled,
        (state, action: PayloadAction<Payload<ModifyFulfilledPayload>>) => {
          const {
            data,
            modifier,
            selectedColumnId,
            undoable = true,
          } = action.payload;

          if (data.rows) {
            return produceWithPatch(
              state,
              undoable,
              (draft) => {
                const allColumnIds = draft.entities.columns.allIds;

                draft.entities.rows.allIds = [];
                draft.entities.rows.byId = {};

                Object.entries(data.rows).forEach(([rowId, rowData]) => {
                  draft.entities.rows.allIds.push(rowId);
                  draft.entities.rows.byId[rowId] = {
                    id: rowId,
                    cells: {},
                  };

                  allColumnIds.forEach((colId) => {
                    const cellData = rowData.cells[colId] ?? {
                      label: "",
                      metadata: [],
                    };

                    draft.entities.rows.byId[rowId].cells[colId] = createCell(
                      rowId,
                      colId,
                      cellData,
                    );
                  });
                });
              },
              (draft) => {
                if (
                  selectedColumnId &&
                  draft.entities.columns.byId[selectedColumnId]
                ) {
                  draft.ui.selectedColumnsIds = { [selectedColumnId]: true };
                  draft.ui.selectedColumnCellsIds = {};
                  draft.ui.selectedCellIds = {};

                  draft.entities.rows.allIds.forEach((rowId) => {
                    const cell =
                      draft.entities.rows.byId[rowId]?.cells[selectedColumnId];
                    if (cell) {
                      draft.ui.selectedCellIds[cell.id] = true;
                      draft.ui.selectedColumnCellsIds[cell.id] = true;
                    }
                  });
                }
                draft.entities.tableInstance.lastModifiedDate =
                  new Date().toISOString();
              },
            );
          } else {
            const { columns, meta, originalColMeta } = data;
            const newColumnsIds = Object.keys(columns);
            return produceWithPatch(
              state,
              undoable,
              (draft) => {
                // Find the index of the selected column that was modified
                const selectedColumnIndex =
                  draft.entities.columns.allIds.findIndex(
                    (colId) => colId === selectedColumnId,
                  );

                newColumnsIds.forEach((newColId, newColIndex) => {
                  const {
                    metadata: columnMetadata,
                    cells,
                    label,
                    ...rest
                  } = columns[newColId];

                  // add new column
                  draft.entities.columns.byId[newColId] = {
                    id: newColId,
                    label,
                    metadata: getColumnMetadata(columnMetadata),
                    status: ColumnStatus.EMPTY,
                    context: {},
                    ...getColumnAnnotationMeta(columnMetadata),
                    ...rest,
                  };

                  // add rows

                  draft.entities.rows.allIds.forEach((rowId) => {
                    const newCell = createCell(rowId, newColId, cells[rowId]);
                    if (newCell.metadata.length === 0) {
                      newCell.annotationMeta = {
                        annotated: false,
                        match: {
                          value: false,
                        },
                      };
                    }
                    draft.entities.rows.byId[rowId].cells[newColId] = newCell;
                    if (newCell.metadata.length > 0) {
                      updateContext(draft, newCell);
                    }
                  });

                  draft.entities.columns.byId[newColId].status =
                    getColumnStatus(draft, newColId);

                  // Insert the new column right after the selected column
                  if (!draft.entities.columns.allIds.includes(newColId)) {
                    draft.entities.columns.allIds.push(newColId);
                  }
                });
                updateNumberOfReconciliatedCells(draft);
                //add additional meta if needed (up to now only properties)
                if (originalColMeta && originalColMeta.originalColName) {
                  if (
                    draft.entities.columns.byId[originalColMeta.originalColName]
                      .metadata[0].property
                  ) {
                    draft.entities.columns.byId[
                      originalColMeta.originalColName
                    ].metadata[0].property = [
                      ...draft.entities.columns.byId[
                        originalColMeta.originalColName
                      ].metadata[0].property,
                      ...originalColMeta.properties,
                    ];
                  } else {
                    draft.entities.columns.byId[
                      originalColMeta.originalColName
                    ].metadata[0].property = originalColMeta.properties;
                  }
                }
              },
              (draft) => {
                draft.entities.tableInstance.lastModifiedDate =
                  new Date().toISOString();
              },
            );
          }
        },
      ),
});

export const {
  restoreInitialState,
  clearDeletedColumns,
  updateCurrentTable,
  updateColumnCellsSelection,
  updateSelectedCellExpanded,
  updateColumnEditable,
  updateCellEditable,
  updateCellLabel,
  updateColumnCellsLabels,
  addColumnMetadata,
  deleteColumnMetadata,
  addCellMetadata,
  propagateCellMetadata,
  propagateCellDeleteMetadata,
  updateColumnMetadata,
  updateColumnPropertyMetadata,
  updateCellMetadata,
  deleteCellMetadata,
  autoMatching,
  refineMatching,
  updateColumnKind,
  updateColumnRole,
  updateColumnSelection,
  updateRowSelection,
  updateCellSelection,
  updateColumnType,
  updateColumnTypeMatches,
  addColumnType,
  setHelpStart,
  setGraphTutorialStart,
  updateUI,
  addTutorialBox,
  deleteColumn,
  deleteRow,
  deleteSelected,
  updateTable,
  copyCell,
  pasteCell,
  undo,
  redo,
  updateColumnVisibility,
  updateSchema,
} = tableSlice.actions;

export default tableSlice.reducer;
