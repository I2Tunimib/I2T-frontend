import { ISimpleColumn, ISimpleRow } from '@components/kit/simple-table/interfaces/simple-table';
import {
  createSelector,
  current,
  PayloadAction
} from '@reduxjs/toolkit';
import { convertFromCSV } from '@services/converters/csv-converter';
import { isEmptyObject } from '@services/utils/is-object';
import { RootState } from '@store';
import { createSliceWithRequests, getRequestStatus } from '@store/requests/requests-utils';
import merge from 'lodash/merge';
import {
  ID,
  ISetDataAction,
  ReconciliationFulfilledAction,
  TableState,
  TableUIState,
  UpdateCellMetadata,
  UpdateSelectedCellsAction
} from './interfaces/table';
import { getTable, reconcile, TableEndpoints } from './table.thunk';

// Define the initial state using that type
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
  requests: { byId: {}, allIds: [] }
};

const addObject = <T, K>(oldObject: T, newObject: T): T => ({
  ...oldObject,
  ...newObject
});

const updateObject = <T>(oldObject: T, fields: Partial<T>): T => merge(oldObject, fields);

const removeObject = <T, K extends keyof T>(object: T, property: K): Omit<T, K> => {
  const { [property]: omit, ...rest } = object;
  return rest;
};

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
    updateCellMetadata: (state, action: PayloadAction<UpdateCellMetadata>) => {
      const { selectedCellMetadataId } = state.ui;
      const { metadataId, cellId } = action.payload;
      selectedCellMetadataId[cellId] = metadataId;
    },
    updateColumnSelection: (state, action: PayloadAction<ID>) => {
      const id = action.payload;
      state.ui.selectedCellIds = {};
      state.ui.selectedColumnsIds = toggleObject(state.ui.selectedColumnsIds, id, true);
    },
    updateCellSelection: (state, action: PayloadAction<UpdateSelectedCellsAction>) => {
      const { id, multi } = action.payload;
      if (multi) {
        state.ui.selectedCellIds = toggleObject(state.ui.selectedCellIds, id, true);
      } else if (!state.ui.selectedCellIds[id]) {
        state.ui.selectedColumnsIds = {};
        state.ui.selectedCellIds = addObject({}, { [id]: true });
      }
    },
    updateUI: (state, action: PayloadAction<Partial<TableUIState>>) => {
      state.ui = { ...state.ui, ...action.payload };
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
        state, action: PayloadAction<ReconciliationFulfilledAction>
      ) => {
        const { data, reconciliator } = action.payload;
        // add metadata to cells
        data.forEach((item) => {
          const [rowId, colId] = item.id.split('$');
          state.entities.rows.byId[rowId].cells[colId].metadata = item.metadata;
          // update column reconciliator
          if (state.entities.columns.byId[colId].reconciliator !== reconciliator) {
            state.entities.columns.byId[colId].reconciliator = reconciliator;
          }
        });
      })
  )
});

export const {
  updateCellMetadata,
  updateColumnSelection,
  updateCellSelection,
  updateUI
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
const selectRequests = (state: RootState) => state.table.requests;

// Loading selectors
export const selectReconcileRequestStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableEndpoints.RECONCILE)
);

/**
 * All selectors
 */
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

export const selectSelectedColumns = createSelector(
  selectUIState,
  (ui) => ui.selectedColumnsIds
);

export const selectSelectedCells = createSelector(
  selectUIState,
  (ui) => ui.selectedCellIds
);

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
// ...rows.allIds.map((rowId) => ({
//   [`${rowId}-${colId}`]: rows.byId[rowId].cells[colId].label
// }));
// const selectCellsState = (state: RootState) => state.table.entities.cells;
// const selectUIState = (state: RootState) => state.table.ui;
// const selectSelectedColumnsState = (state: RootState) => state.table.ui.selectedColumnsIds;
// const selectSelectedCellState = (state: RootState) => state.table.ui.selectedCellId;
// const selectCellMetadataState = (state: RootState) => state.table.ui.selectedCellMetadataId;
// const selectRequests = (state: RootState) => state.table.requests;

// const getFormattedRows = (rows: IRowsState, cells: ICellsState, rowCell: IRowCellState) => (
//   rows.allIds.map((rowId) => (
//     // reduce to row object
//     rowCell.allIds
//       .reduce((acc, rowCellId) => {
//         if (rowCell.byId[rowCellId].primaryKey === rowId) {
//           const {
//             id, label,
//             metadata, columnId
//           } = cells.byId[rowCell.byId[rowCellId].foreignKey];
//           return {
//             ...acc,
//             [columnId]: {
//               id,
//               label,
//               metadata
//             }
//           };
//         }
//         return acc;
//       }, {})))
// );

// const getFormattedColumns = (columns: IColumnsState) => (
//   columns.allIds.map((colId) => {
//     const {
//       id: accessor, label: Header,
//       reconciliator, extension
//     } = (columns.byId[colId]);
//     return {
//       Header,
//       accessor,
//       reconciliator,
//       extension
//     };
//   })
// );

// export const selectTableData = createSelector(
//   selectEntitiesState,
//   ({
//     columns,
//     rows,
//     rowCell,
//     cells
//   }) => {
//     // return an array of rows formatted for the table component
//     const formattedRows = getFormattedRows(rows, cells, rowCell);
//     // return an array of columns formatted for the table component
//     const formattedColumns = getFormattedColumns(columns);
//     return {
//       data: formattedRows,
//       columns: formattedColumns
//     };
//   }
// );

// export const selectSelectedCellMetadata = createSelector(
//   selectSelectedCellState,
//   selectCellsState,
//   (cellId, cells) => (cellId ? cells.byId[cellId].metadata : [])
// );

// export const selectSelectedCellMetadataTableFormat = createSelector(
//   selectSelectedCellMetadata,
//   (metadata) => {
//     if (metadata.length === 0) {
//       return { columns: [], rows: [] };
//     }
//     const columns = Object.keys(metadata[0]).map((key) => ({
//       id: key
//     }));
//     const rows = metadata
//       .map((metadataItem) => ({
//         id: metadataItem.id,
//         cells: columns.map((col) => (col.id === 'type'
//           ? metadataItem.type[0].name
//           : metadataItem[col.id] as string))
//       }));
//     return { columns, rows };
//   }
// );

// export const selectCellMetadata = createSelector(
//   selectCellMetadataState,
//   selectSelectedCellState,
//   (cellMetadataIds, cellId) => cellMetadataIds[cellId]
// );

// export const selectAllCellsMetadata = createSelector(
//   selectUIState,
//   (ui) => ui.selectedCellMetadataId
// );

// /**
//  * Selector which returns ids of selected columns
//  */
// export const selectSelectedColumnsIds = createSelector(
//   selectUIState,
//   (ui) => ui.selectedColumnsIds
// );

// /**
//  * Selector which returns if at least a column is selected
//  */
// export const selectIsColumnSelected = createSelector(
//   selectTableState,
//   ({ ui: { selectedColumnsIds } }) => selectedColumnsIds.length > 0
// );

// /**
//  * Selector which returns the state of reconciliate dialog
//  */
// export const selectReconciliateDialogOpen = createSelector(
//   selectTableState,
//   ({ ui }) => ui.openReconciliateDialog
// );

// /**
//  * Selector which returns cells selected by columns
//  */
// export const selectSelectedColumnsCells = createSelector(
//   selectEntitiesState,
//   selectSelectedColumnsState,
//   ({ cells }, selectedColumnsIds) => selectedColumnsIds.reduce((acc, colId) => {
//     const filteredCells = cells.allIds
//       .filter((cellId) => cells.byId[cellId].columnId === colId)
//       .map((filteredCellId) => cells.byId[filteredCellId]);

//     return [...acc, ...filteredCells];
//   }, [] as ICellState[])
// );

// /**
//  * Selector which returns cells selected by columns processed for reconciliation
//  * request
//  */
// export const selectCellsReconciliationRequest = createSelector(
//   selectSelectedColumnsCells,
//   (cells) => cells.map(({ id, label }) => ({ id, label }))
// );

// /**
//  * Selector which returns the state of the metadata dialog
//  */
// export const selectMetadataDialogOpen = createSelector(
//   selectUIState,
//   (ui) => ui.openMetadataDialog
// );

// /**
//  * Selector which returns the state of the selected cell
//  */
// export const selectSelectedCell = createSelector(
//   selectUIState,
//   (ui) => ui.selectedCellId
// );

// export const selectContextualMenuState = createSelector(
//   selectUIState,
//   (ui) => ui.contextualMenu
// );

export default tableSlice.reducer;
