import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { TablesThunkActions } from './tables.thunk';

const selectTableEntities = (state: RootState) => state.tables.entities;
const selectUIState = (state: RootState) => state.tables.ui;
const selectSelectedSource = (state: RootState) => state.tables.ui.selectedSource;
const selectRequests = (state: RootState) => state.tables._requests;
const selectUploadRequestsState = (state: RootState) => state.tables._uploadRequests;

export const selectSearchTablesStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TablesThunkActions.SEARCH_TABLES)
);

// UPLOAD FILE STATUS SELECTOR
export const selectUploadRequests = createSelector(
  selectUploadRequestsState,
  (requests) => requests.allIds.map((id) => requests.byId[id])
);

export const selectNumberOfAllUploadRequests = createSelector(
  selectUploadRequestsState,
  (requests) => requests.allIds.length
);

export const selectNumberOfActiveUploadRequests = createSelector(
  selectUploadRequestsState,
  (requests) => requests.allIds.filter((id) => requests.byId[id].status === 'pending').length
);

export const selectTables = createSelector(
  selectTableEntities,
  selectSelectedSource,
  (tablesEntities, source) => tablesEntities[source].allIds
    .map((id) => tablesEntities[source].byId[id])
);

export const selectIsUploadDialogOpen = createSelector(
  selectUIState,
  (ui) => ui.uploadDialogOpen
);

export const selectIsUploadProgressDialogOpen = createSelector(
  selectUIState,
  (ui) => ui.uploadProgressDialogOpen
);

export const selectSelectedTable = createSelector(
  selectUIState,
  (ui) => ui.selectedTable
);
