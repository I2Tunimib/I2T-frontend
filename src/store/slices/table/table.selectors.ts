import { ISimpleColumn, ISimpleRow } from '@components/kit/SimpleTable';
import { createSelector } from '@reduxjs/toolkit';
import { floor } from '@services/utils/math';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { selectServicesConfig } from '../config/config.selectors';
import { TableEndpoints } from './table.thunk';
import { getMinMaxScore } from './utils/table.reconciliation-utils';
import { getIdsFromCell } from './utils/table.utils';

// Input selectors
const selectTableState = (state: RootState) => state.table;
const selectEntitiesState = (state: RootState) => state.table.entities;
const selectColumnsState = (state: RootState) => state.table.entities.columns;
const selectRowsState = (state: RootState) => state.table.entities.rows;
const selectUIState = (state: RootState) => state.table.ui;
const selecteSelectedCellMetadataId = (state: RootState) => state.table.ui.selectedCellMetadataId;
const selectRequests = (state: RootState) => state.table._requests;
const selectDraftState = (state: RootState) => state.table._draft;

// LOADING SELECTORS
export const selectReconcileRequestStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableEndpoints.RECONCILE)
);
export const selectGetTableRequestStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableEndpoints.GET_TABLE)
);

// UNDO SELECTORS
export const selectCanUndo = createSelector(
  selectDraftState,
  (draft) => draft.undoPointer > -1
);
export const selectCanRedo = createSelector(
  selectDraftState,
  (draft) => draft.redoPointer > -1
);

/**
 * Get selected columns ids as object.
 */
export const selectSelectedColumnIds = createSelector(
  selectUIState,
  (ui) => ui.selectedColumnsIds
);
/**
 * Get selected columns ids as array.
 */
export const selectSelectedColumnIdsAsArray = createSelector(
  selectSelectedColumnIds,
  (colIds) => Object.keys(colIds)
);

/**
 * Get selected rows ids as object.
 */
export const selectSelectedRowIds = createSelector(
  selectUIState,
  (ui) => ui.selectedRowsIds
);
/**
 * Get selected rows ids as array.
 */
export const selectSelectedRowIdsAsArray = createSelector(
  selectSelectedRowIds,
  (rowIds) => Object.keys(rowIds)
);
/**
 * Get selected cells ids as object.
 */
export const selectSelectedCellIds = createSelector(
  selectUIState,
  (ui) => ui.selectedCellIds
);
/**
 * Get selected cells ids as array.
 */
export const selectSelectedCellsIdsAsArray = createSelector(
  selectSelectedCellIds,
  (cellIds) => Object.keys(cellIds)
);
/**
 * Get selected cells.
 * Get array of selected Cell objects.
 */
export const selectSelectedCells = createSelector(
  selectSelectedCellsIdsAsArray,
  selectRowsState,
  (selectedCellsIds, rows) => selectedCellsIds.map((cellId) => {
    const [rowId, colId] = getIdsFromCell(cellId);
    return rows.byId[rowId].cells[colId];
  })
);
/**
 * Check if AT LEAST a cell is selected.
 */
export const selectIsCellSelected = createSelector(
  selectSelectedCellsIdsAsArray,
  (cellIds) => cellIds.length > 0
);
/**
 * Check if ONLY ONE cell is selected.
 */
export const selectIsOnlyOneCellSelected = createSelector(
  selectSelectedCellsIdsAsArray,
  (cellIds) => cellIds.length === 1
);
/**
 * Get cell id if only one is selected.
 */
export const selectCellIdIfOneSelected = createSelector(
  selectIsOnlyOneCellSelected,
  selectSelectedCellsIdsAsArray,
  (isOnlyOneCell, cellIds) => {
    if (!isOnlyOneCell) {
      return '';
    }
    return cellIds[0];
  }
);
/**
 * Get cell metadata ids as object.
 */
export const selectCellMetadataIds = createSelector(
  selectUIState,
  (ui) => ui.selectedCellMetadataId
);
/**
 * Get selected metadata for current selected cell.
 */
export const selectMetdataCellId = createSelector(
  selectCellIdIfOneSelected,
  selecteSelectedCellMetadataId,
  (cellId, metadataCell) => (cellId ? metadataCell[cellId] : '')
);

// SELECTORS FOR UI STATUS

export const selectIsDenseView = createSelector(
  selectUIState,
  (ui) => ui.denseView
);

/**
 * Get reconciliation dialog status.
 */
export const selectReconcileDialogStatus = createSelector(
  selectUIState,
  (ui) => ui.openReconciliateDialog
);
/**
 * Get metadata dialog status.
 */
export const selectMetadataDialogStatus = createSelector(
  selectUIState,
  (ui) => ui.openMetadataDialog
);

// SELECTORS TO CHECK IF AN ACTION IS ENABLED

/**
 * Check if delete action is enabled.
 * If only rows and/or columns are selected returns true, false otherwise.
 */
export const selectCanDelete = createSelector(
  selectSelectedColumnIds,
  selectSelectedRowIds,
  selectSelectedCellsIdsAsArray,
  (colIds, rowIds, cellIds) => cellIds.length > 0 && cellIds.every((cellId) => (
    getIdsFromCell(cellId)[0] in rowIds || getIdsFromCell(cellId)[1] in colIds
  ))
);

/**
 * Check if Auto matching action is enabled.
 * When all selected cells have metadatas returns true, false otherwise.
 */
export const selectIsAutoMatchingEnabled = createSelector(
  selectSelectedCells,
  (selectedCells) => selectedCells.length > 0
    && !selectedCells.some((cell) => cell.metadata.values.length === 0)
);

// DATA TRANSFORMATION SELECTORS

/**
 * Get data to display in main table component.
 * Transform data in Column and Data objects for react-table component.
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

/**
 * Get cells for Reconciliation action.
 * Transform data to array of objects {id, label}.
 */
export const selectReconciliationCells = createSelector(
  selectSelectedCellsIdsAsArray,
  selectRowsState,
  (cellIds, rows) => {
    return cellIds.map((cellId) => {
      const [rowId, colId] = getIdsFromCell(cellId);
      return {
        id: cellId,
        label: rows.byId[rowId].cells[colId].label
      };
    });
  }
);

/**
 * Get cells for Auto Matching action.
 * Transform data to get selected cells object, number and min and max scores.
 */
export const selectAutoMatchingCells = createSelector(
  selectSelectedCells,
  (selectedCells) => {
    const {
      minScoreAcc: minScore,
      maxScoreAcc: maxScore
    } = selectedCells.reduce(({ minScoreAcc, maxScoreAcc }, cell) => {
      const { min, max } = getMinMaxScore(cell.metadata.values);
      return {
        minScoreAcc: minScoreAcc < min ? minScoreAcc : min,
        maxScoreAcc: maxScoreAcc > max ? maxScoreAcc : max
      };
    }, { minScoreAcc: 500, maxScoreAcc: 0 });
    return {
      selectedCells,
      n: selectedCells.length,
      minScore: floor(minScore),
      maxScore: floor(maxScore)
    };
  }
);

/**
 * Get metadata formatted to display as table.
 */
export const selectCellMetadataTableFormat = createSelector(
  selectCellIdIfOneSelected,
  selectServicesConfig,
  selectRowsState,
  (cellId, config, rows): {
    columns: ISimpleColumn[], rows: ISimpleRow[], selectedCellId: string
  } => {
    if (!cellId) {
      return { columns: [] as ISimpleColumn[], rows: [] as ISimpleRow[], selectedCellId: '' };
    }
    const [rowId, colId] = getIdsFromCell(cellId);

    const currentService = config.reconciliators
      .find((service: any) => service.name
        === rows.byId[rowId].cells[colId].metadata.reconciliator);

    const { metadata } = rows.byId[rowId].cells[colId];

    if (metadata.values.length > 0) {
      const formattedCols: ISimpleColumn[] = currentService.metaToViz.map((label: string) => ({
        id: label
      }));
      const formattedRows = rows.byId[rowId].cells[colId].metadata.values
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
