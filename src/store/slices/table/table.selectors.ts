import { createSelector } from '@reduxjs/toolkit';
import { floor } from '@services/utils/math';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { ID } from '@store/interfaces/store';
import { Row } from 'react-table';
import { Context } from 'vm';
import { selectReconciliators, selectReconciliatorsAsObject } from '../config/config.selectors';
import { BaseMetadata } from './interfaces/table';
import { TableThunkActions } from './table.thunk';
import { getCellContext, getMinMaxScore } from './utils/table.reconciliation-utils';
import { getCell, getIdsFromCell } from './utils/table.utils';

// Input selectors
const selectTableState = (state: RootState) => state.table;
const selectEntitiesState = (state: RootState) => state.table.entities;
const selectColumnsState = (state: RootState) => state.table.entities.columns;
const selectRowsState = (state: RootState) => state.table.entities.rows;
const selectUIState = (state: RootState) => state.table.ui;
const selectRequests = (state: RootState) => state.table._requests;
const selectDraftState = (state: RootState) => state.table._draft;
const selectReconciliatorById = (state: RootState, { value }: any) => {
  // return reconId ? state.config.entities.reconciliators.byId[reconId] : undefined;
  return undefined;
};
const selectColumnContexts = (state: RootState, { data }: any) => {
  return data
    ? Object.keys(data.context).filter((context: ID) => data.context[context].reconciliated > 0)
    : [];
};

// LOADING SELECTORS
export const selectGetTableStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableThunkActions.GET_TABLE)
);
export const selectGetChallengeTableStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableThunkActions.GET_CHALLENGE_TABLE)
);
export const selectReconcileRequestStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableThunkActions.RECONCILE)
);
export const selectSaveTableStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TableThunkActions.SAVE_TABLE)
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
 * Select current table.
 */
export const selectCurrentTable = createSelector(
  selectEntitiesState,
  (entities) => entities.tableInstance
);

export const selectColumnReconciliators = createSelector(
  selectColumnContexts,
  selectReconciliatorsAsObject,
  (contexts, reconciliators) => contexts.map((context: ID) => reconciliators[context].name)
);

export const selectReconciliatorCell = createSelector(
  selectReconciliatorById,
  (reconciliator) => '' // (reconciliator ? reconciliator.name : '')
);

export const selectExpandedCellsIds = createSelector(
  selectUIState,
  (ui) => ui.expandedCellsIds
);

export const selectExpandedColumnsIds = createSelector(
  selectUIState,
  (ui) => ui.expandedColumnsIds
);

export const selectEditableCellsIds = createSelector(
  selectUIState,
  (ui) => ui.editableCellsIds
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

export const selectCurrentCell = createSelector(
  selectCellIdIfOneSelected,
  selectRowsState,
  (cellId, rows) => {
    if (cellId) {
      const [rowId, colId] = getIdsFromCell(cellId);
      return rows.byId[rowId].cells[colId];
    }
    return undefined;
  }
);

// SELECTORS FOR UI STATUS

export const selectLastSaved = createSelector(
  selectUIState,
  (ui) => ui.lastSaved
);

export const selectIsUnsaved = createSelector(
  selectLastSaved,
  selectCurrentTable,
  (lastSaved, { lastModifiedDate }) => {
    if (!lastSaved || !lastModifiedDate) {
      return true;
    }
    return new Date(lastSaved) < new Date(lastModifiedDate);
  }
);

export const selectCurrentView = createSelector(
  selectUIState,
  (ui) => ui.view
);

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
export const selectExportDialogStatus = createSelector(
  selectUIState,
  (ui) => ui.openExportDialog
);

export const selectSearchStatus = createSelector(
  selectUIState,
  (ui) => ui.search
);

export const selectIsHeaderExpanded = createSelector(
  selectUIState,
  (ui) => ui.headerExpanded
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
    && !selectedCells.some((cell) => cell.metadata.length === 0)
);

// DATA TRANSFORMATION SELECTORS

/**
 * Get data to display in main table component.
 * Transform data in Column and Data objects for react-table component.
 */
export const selectDataTableFormat = createSelector(
  selectEntitiesState,
  selectReconciliatorsAsObject,
  (entities, reconciliators) => {
    const columns = entities.columns.allIds.map((colId) => {
      const { label, id, ...rest } = entities.columns.byId[colId];
      return {
        Header: label,
        accessor: colId,
        id,
        data: { ...rest }
      };
    });

    const rows = entities.rows.allIds.map((rowId) => (
      Object.keys(entities.rows.byId[rowId].cells).reduce((acc, colId) => {
        const cell = entities.rows.byId[rowId].cells[colId];
        const cellContext = getCellContext(cell);
        const currentService = reconciliators[cellContext];
        return {
          ...acc,
          [colId]: {
            ...cell,
            metadata: cell.metadata.map((item) => ({
              ...item,
              url: `${currentService.uri}/${item.id.split(':')[1]}`
            })),
            rowId
          }
        };
      }, {})
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
      const { min, max } = getMinMaxScore(cell.metadata);
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

const toString = (value: any) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'boolean') {
    return `${value}`;
  }
  return value;
};

/**
 * Get metadata formatted to display as table.
 */
export const selectCellMetadataTableFormat = createSelector(
  selectCellIdIfOneSelected,
  selectReconciliators,
  selectRowsState,
  (cellId, reconciliators, rows) => {
    if (cellId) {
      const [rowId, colId] = getIdsFromCell(cellId);
      const cell = rows.byId[rowId].cells[colId];
      const cellContext = getCellContext(cell);
      const service = reconciliators.byId[cellContext];
      if (service) {
        const columns = service.metaToViz.map((tableColId) => ({
          Header: tableColId,
          accessor: tableColId
        }));

        const data = cell.metadata.map((item) => {
          return {
            ...service.metaToViz.reduce((acc, tableColId) => {
              acc[tableColId] = {
                label: toString(item[tableColId as keyof BaseMetadata]),
                isLink: tableColId === 'name',
                link: tableColId === 'name' && `${service.uri}/${item.id.split(':')[1]}`
              };
              return acc;
            }, {} as { [key: string]: any } & Row),
            isSelected: item.match
          };
        });
        return { columns, data };
      }
    }
    return { columns: [] as any, data: [] as any };
  }
);
