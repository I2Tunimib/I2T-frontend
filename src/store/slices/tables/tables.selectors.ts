import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { TablesThunkActions } from './tables.thunk';

const selectTableEntities = (state: RootState) => state.tables.entities;
const selectUIState = (state: RootState) => state.tables.ui;
const selectSelectedSource = (state: RootState) => state.tables.ui.selectedSource;
const selectRequests = (state: RootState) => state.tables._requests;

export const selectSearchTablesStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, TablesThunkActions.SEARCH_TABLES)
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

export const selectSelectedTable = createSelector(
  selectUIState,
  (ui) => ui.selectedTable
);
