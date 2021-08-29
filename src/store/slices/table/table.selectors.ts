import { ISimpleColumn, ISimpleRow } from '@components/kit/SimpleTable';
import { createSelector } from '@reduxjs/toolkit';
import { isEmptyObject } from '@services/utils/is-object';
import { floor } from '@services/utils/math';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { selectServicesConfig } from '../config/config.slice';
import { MetadataInstance } from './interfaces/table';
import { TableEndpoints } from './table.thunk';
import { getIdsFromCell } from './utils/table.utils';

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
  (draft) => draft.undoPointer > -1
);
export const selectCanRedo = createSelector(
  selectDraftState,
  (draft) => draft.redoPointer > -1
);

/**
 * Get selected columns.
 */
export const selectSelectedColumns = createSelector(
  selectUIState,
  (ui) => ui.selectedColumnsIds
);

/**
 * Get selected rows.
 */
export const selectSelectedRowsIds = createSelector(
  selectUIState,
  (ui) => ui.selectedRowsIds
);

/**
 * Get selected cells ids as object.
 */
export const selectSelectedCellsIds = createSelector(
  selectUIState,
  (ui) => ui.selectedCellIds
);
/**
 * Get selected cells ids as array.
 */
export const selectSelectedCellsIdsAsArray = createSelector(
  selectSelectedCellsIds,
  (selectedCells) => Object.keys(selectedCells)
);
/**
 * Get selected cells.
 */
export const selectSelectedCells = createSelector(
  selectSelectedCellsIdsAsArray,
  selectRowsState,
  (selectedCellsIds, rows) => selectedCellsIds.map((cellId) => {
    const [rowId, colId] = getIdsFromCell(cellId);
    return rows.byId[rowId].cells[colId];
  })
);

export const selectCanDelete = createSelector(
  selectSelectedColumns,
  selectSelectedCellsIdsAsArray,
  (selectedColumns, selectedCells) => selectedCells.length > 0 && selectedCells
    .every((cellId) => getIdsFromCell(cellId)[1] in selectedColumns)
);

/**
 * Auto matching should be enabled when all selected cells have metadatas.
 */
export const selectIsAutoMatchingEnabled = createSelector(
  selectSelectedCells,
  (selectedCells) => selectedCells.length > 0
    && !selectedCells.some((cell) => cell.metadata.values.length === 0)
);

const getMinMaxScore = (metadataArray: MetadataInstance[]) => {
  const scores = metadataArray.map((metadataItem) => metadataItem.score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return { min, max };
};
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
      const [rowId, colId] = getIdsFromCell(cellId);
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
