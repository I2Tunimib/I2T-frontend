import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';

const selectTableEntities = (state: RootState) => state.tables.entities;
const selectUIState = (state: RootState) => state.tables.ui;
const selectSelectedSource = (state: RootState) => state.tables.ui.selectedSource;

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
