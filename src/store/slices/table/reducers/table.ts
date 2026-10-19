import { Draft } from "@reduxjs/toolkit";
import { GetSchemaResponse, GetTableResponse } from "@services/api/table";
import { ID, Payload } from "@store/interfaces/store";
import { applyRedoPatches, applyUndoPatches } from "@store/enhancers/undo";
import {
  ColumnStatus,
  CopyCellPayload,
  DeleteColumnPayload,
  DeleteRowPayload,
  DeleteSelectedPayload,
  PasteCellPayload,
  TableState,
  UpdateCellLabelPayload,
  UpdateCurrentTablePayload,
} from "../interfaces/table";
import {
  deleteOneColumn,
  deleteOneRow,
  deleteSelectedColumns,
  deleteSelectedRows,
} from "../utils/table.delete-utils";
import {
  refreshAllColumns,
  refreshColumns,
  refreshScoreBoundaries,
} from "../utils/table.reconciliation-utils";
import {
  areOnlyRowsSelected,
  areRowsColumnsSelected,
} from "../utils/table.selection-utils";
import {
  findCell,
  getCell,
  getColumn,
  getIdsFromCell,
  orderColumnIds,
  removeObject,
} from "../utils/table.utils";
import { stampModified, withHistory } from "./history";
import { TableReducer } from "./types";

type State = Draft<TableState>;

const emptyAnnotationMeta = () => ({
  annotated: false,
  match: { value: false },
  highestScore: 0,
  lowestScore: 0,
});

/** Replace the table with what the backend sent. */
export const setTableEntities = (
  state: State,
  { table, columns, rows, columnOrder }: GetTableResponse,
) => {
  state.ui.lastSaved = table.lastModifiedDate;
  state.entities = {
    tableInstance: { ...table },
    columns: {
      byId: columns,
      allIds: orderColumnIds(Object.keys(columns), columnOrder),
    },
    rows: { byId: rows, allIds: Object.keys(rows) },
  };
};

export const updateCurrentTable: TableReducer<Payload<UpdateCurrentTablePayload>> = (
  state,
  { payload },
) => {
  state.entities.tableInstance = { ...state.entities.tableInstance, ...payload };
  stampModified(state);
};

/** A table sent again by the backend (e.g. through the socket). */
export const updateTable: TableReducer<Payload<GetTableResponse>> = (
  state,
  { payload },
) => {
  setTableEntities(state, payload);
  state.ui.deletedColumnsIds = {};
};

const cleanId = (id: string) => id.replace(/^﻿/, "").trim();

/**
 * Apply the classification of the columns made by the automatic annotation.
 * Column ids and labels lose the byte-order marks the backend may add. The
 * schema of another table is ignored.
 */
export const updateSchema: TableReducer<Payload<GetSchemaResponse>> = (
  state,
  { payload: { table, result } },
) => {
  if (String(state.entities.tableInstance.id) !== String(table.id)) return;

  state.entities.tableInstance = { ...table, schemaStatus: "DONE" };

  const { columns, rows } = state.entities;
  const renamed: Record<string, string> = {};
  const updatedColumns: Record<string, any> = {};
  Object.keys(columns.byId).forEach((oldId) => {
    const column = columns.byId[oldId];
    const id = cleanId(oldId);
    renamed[oldId] = id;
    updatedColumns[id] = {
      ...column,
      id,
      label: column.label ? cleanId(column.label) : id,
      kind: result.kind_classification[id] ?? column.kind ?? "unknown",
      datatype: result.ner_classification[id] ?? column.datatype ?? "unknown",
    };
  });
  columns.byId = updatedColumns;
  columns.allIds = Object.keys(updatedColumns);

  Object.values(rows.byId).forEach((row) => {
    row.cells = Object.fromEntries(
      Object.entries(row.cells).map(([colId, cell]) => [renamed[colId], cell]),
    );
  });
};

// LABELS

export const updateCellLabel: TableReducer<Payload<UpdateCellLabelPayload>> = (
  state,
  { payload: { cellId, value, undoable = true } },
) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  const stopEditing = (draft: State) => {
    draft.ui.editableCellsIds = removeObject(draft.ui.editableCellsIds, cellId);
  };

  if (getCell(state, rowId, colId).label === value) {
    // nothing changed: just stop editing
    stopEditing(state);
    return;
  }
  return withHistory(
    state,
    undoable,
    (draft) => {
      getCell(draft, rowId, colId).label = value;
    },
    { after: stopEditing },
  );
};

export const updateColumnCellsLabels: TableReducer<
  Payload<{ updates: { cellId: ID; value: string }[] }>
> = (state, { payload: { updates, undoable = true } }) =>
  withHistory(state, undoable, (draft) => {
    updates.forEach(({ cellId, value }) => {
      const [rowId, colId] = getIdsFromCell(cellId);
      const cell = findCell(draft, rowId, colId);
      if (cell) cell.label = value;
    });
  });

// COPY AND PASTE

export const copyCell: TableReducer<CopyCellPayload> = (
  state,
  { payload: { cellId } },
) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  state.ui.tmpCell = getCell(state, rowId, colId);
};

export const pasteCell: TableReducer<Payload<PasteCellPayload>> = (
  state,
  { payload: { cellId, undoable = true } },
) =>
  withHistory(state, undoable, (draft) => {
    const { tmpCell } = draft.ui;
    if (!tmpCell) return;
    const [rowId, colId] = getIdsFromCell(cellId);
    const { id, ...copied } = tmpCell;
    draft.entities.rows.byId[rowId].cells[colId] = { id: cellId, ...copied };
    refreshColumns(draft, [colId]);
  });

// DELETION

const clearSelection = (columnsAndCells: (keyof State["ui"])[]) =>
  (draft: State) => {
    columnsAndCells.forEach((key) => {
      (draft.ui[key] as Record<string, boolean>) = {};
    });
  };

export const deleteSelected: TableReducer<Payload<DeleteSelectedPayload>> = (
  state,
  { payload: { undoable = true } },
) =>
  withHistory(
    state,
    undoable,
    (draft) => {
      if (areRowsColumnsSelected(draft)) {
        if (!areOnlyRowsSelected(draft)) {
          deleteSelectedColumns(draft);
        }
        deleteSelectedRows(draft);
      }
      refreshAllColumns(draft);
    },
    {
      after: clearSelection(["selectedColumnsIds", "selectedRowsIds", "selectedCellIds"]),
    },
  );

export const deleteColumn: TableReducer<Payload<DeleteColumnPayload>> = (
  state,
  { payload: { colId, undoable = true } },
) =>
  withHistory(
    state,
    undoable,
    (draft) => {
      deleteOneColumn(draft, colId);
      refreshAllColumns(draft);
    },
    { after: clearSelection(["selectedColumnsIds", "selectedCellIds"]) },
  );

export const deleteRow: TableReducer<Payload<DeleteRowPayload>> = (
  state,
  { payload: { rowId, undoable = true } },
) =>
  withHistory(
    state,
    undoable,
    (draft) => {
      deleteOneRow(draft, rowId);
      refreshAllColumns(draft);
    },
    { after: clearSelection(["selectedRowsIds", "selectedCellIds"]) },
  );

/** Forget everything a reconciliation said about a column. Not undoable. */
export const clearColumnReconciliation: TableReducer<{ colId: ID }> = (
  state,
  { payload: { colId } },
) => {
  const column = getColumn(state, colId);
  if (!column) return;
  column.context = {};
  column.annotationMeta = emptyAnnotationMeta();
  delete column.reconciler;
  state.entities.rows.allIds.forEach((rowId) => {
    const cell = findCell(state, rowId, colId);
    if (cell) {
      cell.metadata = [];
      cell.annotationMeta = emptyAnnotationMeta();
    }
  });
  refreshColumns(state, [colId]);
  refreshScoreBoundaries(state);
};

// HISTORY

const afterUndoRedo = (draft: State) => {
  stampModified(draft);
};

export const undo: TableReducer<number> = (state, { payload }) =>
  applyUndoPatches(state, payload || 1, (draft) => {
    draft.ui.selectedColumnCellsIds = {};
    draft.ui.selectedColumnsIds = {};
    draft.ui.selectedRowsIds = {};
    draft.ui.selectedCellIds = {};
    afterUndoRedo(draft);
  });

export const redo: TableReducer = (state) =>
  applyRedoPatches(state, afterUndoRedo);

export { ColumnStatus };
