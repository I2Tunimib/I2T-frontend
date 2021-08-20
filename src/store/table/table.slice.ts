import {
  createSelector,
  current,
  PayloadAction
} from '@reduxjs/toolkit';
import { convertFromCSV } from '@services/converters/csv-converter';
import { RootState } from '@store';
import { createSliceWithRequests, getRequestStatus } from '@store/requests/requests-utils';
import merge from 'lodash/merge';
import {
  IAddCellsColumnMetadataAction, ICellsState, ICellState,
  IColumnsState, IRowCellState, IRowsState,
  ISetDataAction, ITableState, ITableUIState
} from './interfaces/table';
import { getTable, reconcile, TableEndpoints } from './table.thunk';

// Define the initial state using that type
const initialState: ITableState = {
  entities: {
    columns: { byId: {}, allIds: [] },
    rows: { byId: {}, allIds: [] },
    cells: { byId: {}, allIds: [] },
    columnCell: { byId: {}, allIds: [] },
    rowCell: { byId: {}, allIds: [] }
  },
  ui: {
    openReconciliateDialog: false,
    openMetadataDialog: false,
    selectedColumnsIds: [],
    selectedCellId: '',
    selectedCellMetadataId: {},
    contextualMenu: {
      mouseX: null,
      mouseY: null,
      target: null
    }
  },
  requests: { byId: {}, allIds: [] }
};

export const tableSlice = createSliceWithRequests({
  name: 'table',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    updateSelectedColumns: (state, { payload }: PayloadAction<string>) => {
      const { selectedColumnsIds } = state.ui;
      if (!selectedColumnsIds.includes(payload)) {
        // add id if not yet selected
        return {
          ...state,
          ui: { ...state.ui, selectedColumnsIds: [...selectedColumnsIds, payload] }
        };
      }
      // remove id if already selected
      return {
        ...state,
        ui: { ...state.ui, selectedColumnsIds: selectedColumnsIds.filter((id) => id !== payload) }
      };
    },
    updateSelectedCell: (state, { payload }: PayloadAction<string>) => {
      const { selectedCellId } = state.ui;
      // if cell is reclicked set to null
      if (selectedCellId === payload) {
        return { ...state, ui: { ...state.ui, selectedCellId: '' } };
      }
      // if new cell is clicked
      return { ...state, ui: { ...state.ui, selectedCellId: payload } };
    },
    updateUI: (state, { payload }: PayloadAction<Partial<ITableUIState>>) => {
      state.ui = { ...state.ui, ...payload };
    },
    updateCells: (state, { payload }: PayloadAction<Partial<ICellsState>>) => {
      const updatedCells = merge({}, state.entities.cells.byId, payload);
      state.entities.cells.byId = updatedCells;
    },
    updateCellMetadata: (state, { payload }: PayloadAction<string>) => {
      const { selectedCellMetadataId, selectedCellId } = state.ui;
      selectedCellMetadataId[selectedCellId] = payload;
    }
  },
  extraRules: (builder) => (
    builder
      // set table on request fulfilled
      .addCase(getTable.fulfilled, (state, { payload }: PayloadAction<ISetDataAction>) => {
        const { data, format } = payload;
        if (format === 'csv') {
          const entities = convertFromCSV(data);
          state.entities = entities;
        }
        return state;
      })
      // set metadata on request fulfilled
      .addCase(reconcile.fulfilled, (
        state, { payload }: PayloadAction<IAddCellsColumnMetadataAction>
      ) => {
        const { data, reconciliator } = payload;
        // add metadata to cells
        const updatedCells = merge({}, state.entities.cells.byId, data);
        state.entities.cells.byId = updatedCells;
        // add reconciliator name to columns
        const { entities: { columns }, ui: { selectedColumnsIds } } = state;
        selectedColumnsIds.forEach((id) => {
          columns.byId[id].reconciliator = reconciliator;
        });
      })
  )
});

export const {
  setData,
  updateCells,
  addCellsColumnMetadata,
  updateSelectedColumns,
  updateSelectedCell,
  updateCellMetadata,
  updateUI
} = tableSlice.actions;

// Input selectors
const selectTableState = (state: RootState) => state.table;
const selectEntitiesState = (state: RootState) => state.table.entities;
const selectCellsState = (state: RootState) => state.table.entities.cells;
const selectUIState = (state: RootState) => state.table.ui;
const selectSelectedColumnsState = (state: RootState) => state.table.ui.selectedColumnsIds;
const selectSelectedCellState = (state: RootState) => state.table.ui.selectedCellId;
const selectCellMetadataState = (state: RootState) => state.table.ui.selectedCellMetadataId;
const selectRequests = (state: RootState) => state.table.requests;

// Loading selectors
export const selectReconcileRequestStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableEndpoints.RECONCILE)
);

const getFormattedRows = (rows: IRowsState, cells: ICellsState, rowCell: IRowCellState) => (
  rows.allIds.map((rowId) => (
    // reduce to row object
    rowCell.allIds
      .reduce((acc, rowCellId) => {
        if (rowCell.byId[rowCellId].rowId === rowId) {
          const {
            id, label,
            metadata, columnId
          } = cells.byId[rowCell.byId[rowCellId].cellId];
          return {
            ...acc,
            [columnId]: {
              id,
              label,
              metadata
            }
          };
        }
        return acc;
      }, {})))
);

const getFormattedColumns = (columns: IColumnsState) => (
  columns.allIds.map((colId) => {
    const {
      id: accessor, label: Header,
      reconciliator, extension
    } = (columns.byId[colId]);
    return {
      Header,
      accessor,
      reconciliator,
      extension
    };
  })
);

export const selectTableData = createSelector(
  selectEntitiesState,
  ({
    columns,
    rows,
    rowCell,
    cells
  }) => {
    // return an array of rows formatted for the table component
    const formattedRows = getFormattedRows(rows, cells, rowCell);
    // return an array of columns formatted for the table component
    const formattedColumns = getFormattedColumns(columns);
    return {
      data: formattedRows,
      columns: formattedColumns
    };
  }
);

export const selectSelectedCellMetadata = createSelector(
  selectSelectedCellState,
  selectCellsState,
  (cellId, cells) => (cellId ? cells.byId[cellId].metadata : [])
);

export const selectSelectedCellMetadataTableFormat = createSelector(
  selectSelectedCellMetadata,
  (metadata) => {
    if (metadata.length === 0) {
      return { columns: [], rows: [] };
    }
    const columns = Object.keys(metadata[0]).map((key) => ({
      id: key
    }));
    const rows = metadata
      .map((metadataItem) => ({
        id: metadataItem.id,
        cells: columns.map((col) => (col.id === 'type'
          ? metadataItem.type[0].name
          : metadataItem[col.id] as string))
      }));
    return { columns, rows };
  }
);

export const selectCellMetadata = createSelector(
  selectCellMetadataState,
  selectSelectedCellState,
  (cellMetadataIds, cellId) => cellMetadataIds[cellId]
);

export const selectAllCellsMetadata = createSelector(
  selectUIState,
  (ui) => ui.selectedCellMetadataId
);

/**
 * Selector which returns ids of selected columns
 */
export const selectSelectedColumnsIds = createSelector(
  selectUIState,
  (ui) => ui.selectedColumnsIds
);

/**
 * Selector which returns if at least a column is selected
 */
export const selectIsColumnSelected = createSelector(
  selectTableState,
  ({ ui: { selectedColumnsIds } }) => selectedColumnsIds.length > 0
);

/**
 * Selector which returns the state of reconciliate dialog
 */
export const selectReconciliateDialogOpen = createSelector(
  selectTableState,
  ({ ui }) => ui.openReconciliateDialog
);

/**
 * Selector which returns cells selected by columns
 */
export const selectSelectedColumnsCells = createSelector(
  selectEntitiesState,
  selectSelectedColumnsState,
  ({ cells }, selectedColumnsIds) => selectedColumnsIds.reduce((acc, colId) => {
    const filteredCells = cells.allIds
      .filter((cellId) => cells.byId[cellId].columnId === colId)
      .map((filteredCellId) => cells.byId[filteredCellId]);

    return [...acc, ...filteredCells];
  }, [] as ICellState[])
);

/**
 * Selector which returns cells selected by columns processed for reconciliation
 * request
 */
export const selectCellsReconciliationRequest = createSelector(
  selectSelectedColumnsCells,
  (cells) => cells.map(({ id, label }) => ({ id, label }))
);

/**
 * Selector which returns the state of the metadata dialog
 */
export const selectMetadataDialogOpen = createSelector(
  selectUIState,
  (ui) => ui.openMetadataDialog
);

/**
 * Selector which returns the state of the selected cell
 */
export const selectSelectedCell = createSelector(
  selectUIState,
  (ui) => ui.selectedCellId
);

export const selectContextualMenuState = createSelector(
  selectUIState,
  (ui) => ui.contextualMenu
);

export default tableSlice.reducer;
