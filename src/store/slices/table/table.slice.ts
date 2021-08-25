import { ISimpleColumn, ISimpleRow } from '@components/kit/SimpleTable';
import {
  createSelector,
  PayloadAction
} from '@reduxjs/toolkit';
import { convertFromCSV } from '@services/converters/csv-converter';
import { isEmptyObject } from '@services/utils/is-object';
import { RootState } from '@store';
import { createSliceWithRequests, getRequestStatus } from '@store/enhancers/requests';
import { applyRedoPatches, applyUndoPatches, produceWithPatch } from '@store/enhancers/undo';
import { Payload } from '@store/interfaces/store';
import {
  ColumnState,
  ID,
  ReconciliationFulfilledPayload,
  RowState,
  SetDataPayload,
  TableState,
  TableUIState,
  UpdateCellEditablePayload,
  UpdateCellLabelPayload,
  UpdateCellMetadataPayload,
  UpdateSelectedCellsPayload
} from './interfaces/table';
import { getTable, reconcile, TableEndpoints } from './table.thunk';

const initialState: TableState = {
  entities: {
    columns: { byId: {}, allIds: [] },
    rows: { byId: {}, allIds: [] }
  },
  ui: {
    openReconciliateDialog: false,
    openMetadataDialog: false,
    selectedColumnsIds: {},
    selectedRowsIds: {},
    selectedCellIds: {},
    selectedCellMetadataId: {}
  },
  _requests: { byId: {}, allIds: [] },
  _draft: {
    past: [],
    present: [],
    future: []
  }
};

/**
 * Add a property to another object given old and new object.
 */
const addObject = <T, K>(oldObject: T, newObject: T): T => ({
  ...oldObject,
  ...newObject
});

/**
 * Remove property of an object given the property
 */
const removeObject = <T, K extends keyof T>(object: T, property: K): Omit<T, K> => {
  const { [property]: omit, ...rest } = object;
  return rest;
};

const deleteOneColumn = (columns: ColumnState, rows: RowState, id: ID) => {
  const newColumns: ColumnState = {
    byId: removeObject(columns.byId, id),
    allIds: columns.allIds.filter((colId) => colId !== id)
  };
  const newRows: RowState = {
    byId: rows.allIds.reduce((acc, rowId) => {
      return {
        ...acc,
        [rowId]: {
          ...rows.byId[rowId],
          cells: removeObject(rows.byId[rowId].cells, id)
        }
      };
    }, {}),
    allIds: [...rows.allIds]
  };
  return { newColumns, newRows };
};

/**
 * Toggle object by ID.
 */
const toggleObject = <T>(oldObject: Record<ID, T>, id: ID, value: T) => {
  if (oldObject[id]) {
    return removeObject(oldObject, id);
  }
  const newObject = { [id]: value };
  return addObject(oldObject, newObject);
};

export const tableSlice = createSliceWithRequests({
  name: 'table',
  initialState,
  reducers: {
    /**
     * Set cell editable.
     */
    updateCellEditable: (state, action: PayloadAction<Payload<UpdateCellEditablePayload>>) => {
      const { cellId } = action.payload;
      const [rowId, colId] = cellId.split('$');
      state.entities.rows.byId[rowId].cells[colId].editable = true;
    },
    /**
     * Handle update of cell label.
     * --UNDOABLE ACTION--
     */
    updateCellLabel: (state, action: PayloadAction<Payload<UpdateCellLabelPayload>>) => {
      const { cellId, value, undoable = true } = action.payload;
      const [rowId, colId] = cellId.split('$');
      if (state.entities.rows.byId[rowId].cells[colId].label !== value) {
        return produceWithPatch(state, undoable, (draft) => {
          draft.entities.rows.byId[rowId].cells[colId].label = value;
        }, (draft) => {
          // do not include in undo history
          draft.entities.rows.byId[rowId].cells[colId].editable = false;
        });
      }
      // if value is the same just stop editing cell
      state.entities.rows.byId[rowId].cells[colId].editable = false;
    },
    /**
     * Handle the assignment of a metadata to a cell.
     * --UNDOABLE ACTION--
     */
    updateCellMetadata: (state, action: PayloadAction<Payload<UpdateCellMetadataPayload>>) => {
      const { metadataId, cellId, undoable = true } = action.payload;
      return produceWithPatch(state, undoable, (draft) => {
        draft.ui.selectedCellMetadataId[cellId] = metadataId;
      });
    },
    /**
     * Handle changes to selected columns.
     * It toggles the selection of column given the ID.
     */
    updateColumnSelection: (state, action: PayloadAction<ID>) => {
      const id = action.payload;
      state.ui.selectedCellIds = {};
      state.ui.selectedColumnsIds = toggleObject(state.ui.selectedColumnsIds, id, true);
    },
    /**
     *
     * Handle changes to selected cells.
     */
    updateCellSelection: (state, action: PayloadAction<Payload<UpdateSelectedCellsPayload>>) => {
      const { id, multi } = action.payload;
      if (multi) {
        state.ui.selectedCellIds = toggleObject(state.ui.selectedCellIds, id, true);
      } else if (!state.ui.selectedCellIds[id]) {
        state.ui.selectedColumnsIds = {};
        state.ui.selectedCellIds = addObject({}, { [id]: true });
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
     * Delete selected columns.
     * --UNDOABLE ACTION--
     */
    deleteColumn: (state, action: PayloadAction<Payload>) => {
      const { undoable } = action.payload;
      const { selectedColumnsIds } = state.ui;
      let { columns, rows } = state.entities;

      return produceWithPatch(state, !!undoable, (draft) => {
        Object.keys(selectedColumnsIds).forEach((colId) => {
          const { newColumns, newRows } = deleteOneColumn(columns, rows, colId);
          columns = newColumns;
          rows = newRows;
        });
        draft.entities.columns = columns;
        draft.entities.rows = rows;
      }, (draft) => {
        // also remove selection from deleted columns without generating patches
        draft.ui.selectedColumnsIds = {};
      });
    },
    /**
     * Perform an undo by applying undo patches (past patches).
     */
    undo: (state, action: PayloadAction<void>) => {
      return applyUndoPatches(state);
    },
    /**
     * Perform a redo by applying redo patches (future patches).
     */
    redo: (state, action: PayloadAction<void>) => {
      return applyRedoPatches(state);
    }
  },
  extraRules: (builder) => (
    builder
      // set table on request fulfilled
      .addCase(getTable.fulfilled, (state, { payload }: PayloadAction<Payload<SetDataPayload>>) => {
        const { data, format } = payload;
        if (format === 'csv') {
          const entities = convertFromCSV(data);
          state.entities = entities;
        }
        return state;
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
          // add metadata to cells
          data.forEach((item) => {
            const [rowId, colId] = item.id.split('$');
            draft.entities.rows.byId[rowId].cells[colId].metadata = item.metadata;
            // update column reconciliator
            if (draft.entities.columns.byId[colId].reconciliator !== reconciliator) {
              draft.entities.columns.byId[colId].reconciliator = reconciliator;
            }
          });
        });
      })
  )
});

export const {
  updateCellEditable,
  updateCellLabel,
  updateCellMetadata,
  updateColumnSelection,
  updateCellSelection,
  updateUI,
  deleteColumn,
  undo,
  redo
} = tableSlice.actions;

// Input selectors
const selectTableState = (state: RootState) => state.table;
const selectEntitiesState = (state: RootState) => state.table.entities;
const selectColumnsState = (state: RootState) => state.table.entities.columns;
const selectRowsState = (state: RootState) => state.table.entities.rows;
const selectUIState = (state: RootState) => state.table.ui;
const selectSelectedColumnsIds = (state: RootState) => state.table.ui.selectedColumnsIds;
const selectSelectedCellIds = (state: RootState) => state.table.ui.selectedCellIds;
const selecteSelectedCellMetadataId = (state: RootState) => state.table.ui.selectedCellMetadataId;
const selectRequests = (state: RootState) => state.table._requests;
const selectDraftState = (state: RootState) => state.table._draft;

/**
 * All selectors
 */

// Loading selectors
export const selectReconcileRequestStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableEndpoints.RECONCILE)
);
export const selectGetTableRequestStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableEndpoints.GET_TABLE)
);

// Undo selectors
export const selectCanUndo = createSelector(
  selectDraftState,
  (draft) => draft.past.length > 0
);
export const selectCanRedo = createSelector(
  selectDraftState,
  (draft) => draft.future.length > 0
);

/**
 * Get selected columns
 */
export const selectSelectedColumns = createSelector(
  selectUIState,
  (ui) => ui.selectedColumnsIds
);

export const selectCanDelete = createSelector(
  selectSelectedColumns,
  (ids) => Object.keys(ids).length > 0
);

/**
 * Get selected cells
 */
export const selectSelectedCells = createSelector(
  selectUIState,
  (ui) => ui.selectedCellIds
);

/**
 * Get cell metadata ids
 */
export const selectCellMetadata = createSelector(
  selectUIState,
  (ui) => ui.selectedCellMetadataId
);

export const selectReconcileDialogStatus = createSelector(
  selectTableState,
  ({ ui }) => ui.openReconciliateDialog
);

export const selectMetadataDialogStatus = createSelector(
  selectTableState,
  ({ ui }) => ui.openMetadataDialog
);

export const selectIsCellSelected = createSelector(
  selectSelectedColumnsIds,
  selectSelectedCellIds,
  (colIds, cellIds) => !isEmptyObject(colIds) || !isEmptyObject(cellIds)
);

export const selectIsMetadataButtonEnabled = createSelector(
  selectSelectedColumnsIds,
  selectSelectedCellIds,
  (colIds, cellIds) => isEmptyObject(colIds) && Object.keys(cellIds).length === 1
);

export const selectDataTableFormat = createSelector(
  selectEntitiesState,
  (entities) => {
    const columns = entities.columns.allIds.map((colId) => ({
      Header: entities.columns.byId[colId].label,
      accessor: colId,
      reconciliator: entities.columns.byId[colId].reconciliator,
      extension: entities.columns.byId[colId].extension
    }));
    const rows = entities.rows.allIds.map((rowId) => (
      Object.keys(entities.rows.byId[rowId].cells).reduce((acc, cellId) => ({
        ...acc,
        [cellId]: {
          ...entities.rows.byId[rowId].cells[cellId],
          rowId
        }
      }), {})
    ));
    return { columns, rows };
  }
);

export const selectAllSelectedCellForReconciliation = createSelector(
  selectSelectedColumnsIds,
  selectSelectedCellIds,
  selectRowsState,
  (colIds, cellIds, rows) => {
    const selectedFromCells = Object.keys(cellIds).map((cellId) => {
      const [rowId, colId] = cellId.split('$');
      return {
        id: cellId,
        label: rows.byId[rowId].cells[colId].label
      };
    });
    const selectedFromColumns = Object.keys(colIds).reduce((acc, colId) => (
      [
        ...acc,
        ...rows.allIds.map((rowId) => ({
          id: `${rowId}$${colId}`,
          label: rows.byId[rowId].cells[colId].label
        }))
      ]
    ), [] as any[]);
    return selectedFromCells.concat(selectedFromColumns);
  }
);

export const selectCellIfOne = createSelector(
  selectIsMetadataButtonEnabled,
  selectSelectedCellIds,
  selectRowsState,
  (isMetadataButtonEnabled, selectedCells, rows) => {
    if (!isMetadataButtonEnabled) {
      return '';
    }
    const selectedCellId = Object.keys(selectedCells)[0];
    return selectedCellId;
  }
);

export const selectMetdataCellId = createSelector(
  selectCellIfOne,
  selecteSelectedCellMetadataId,
  (cellId, metadataCell) => metadataCell[cellId]
);

export const selectSelectedCellMetadataTableFormat = createSelector(
  selectCellIfOne,
  selectRowsState,
  (cellId, rows): {
    columns: ISimpleColumn[], rows: ISimpleRow[], selectedCellId: string
  } => {
    if (!cellId) {
      return { columns: [] as ISimpleColumn[], rows: [] as ISimpleRow[], selectedCellId: '' };
    }
    const [rowId, colId] = cellId.split('$');
    const { metadata } = rows.byId[rowId].cells[colId];

    if (metadata.length > 0) {
      const formattedCols = Object.keys(metadata[0]).map((key) => ({
        id: key
      }));
      const formattedRows = rows.byId[rowId].cells[colId].metadata
        .map((metadataItem) => ({
          id: metadataItem.id,
          cells: formattedCols.map((col) => (col.id === 'type'
            ? metadataItem.type[0].name
            : metadataItem[col.id] as string))
        }));
      return { columns: formattedCols, rows: formattedRows, selectedCellId: cellId };
    }
    return { columns: [] as ISimpleColumn[], rows: [] as ISimpleRow[], selectedCellId: '' };
  }
);

export default tableSlice.reducer;
