import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { createRequestStatusSelector } from '@store/slices/requests/requests.selectors';
import {
  getDataset, getTablesByDataset, uploadDataset, uploadTable
} from './datasets.thunk';

const selectDatasetsState = (state: RootState) => state.datasets.entities;
const selectDatasetsEntities = (state: RootState) => state.datasets.entities.datasets;
const selectCurrentDatasetId = (state: RootState) => state.datasets.entities.currentDatasetId;
const selectDatasetsUI = (state: RootState) => state.datasets.ui;

export const selectDatasets = createSelector(
  selectDatasetsState,
  (entities) => {
    return {
      meta: entities.metaDatasets,
      collection: entities.datasets.allIds.map((id) => {
        const { tables, ...rest } = entities.datasets.byId[id];
        return rest;
      })
    };
  }
);

export const selectGetAllDatasetsStatus =
  createRequestStatusSelector(getDataset);
export const selectGetTablesDatasetStatus =
  createRequestStatusSelector(getTablesByDataset);
export const selectUploadDatasetStatus =
  createRequestStatusSelector(uploadDataset);
export const selectUploadTableStatus = createRequestStatusSelector(uploadTable);

export const selectCurrentDataset = createSelector(
  selectCurrentDatasetId,
  selectDatasetsEntities,
  (datasetId, datasets) => datasets.byId[datasetId]
);

export const selectCurrentDatasetTables = createSelector(
  selectDatasetsState,
  ({
    currentDatasetId, datasets,
    tables, metaTables
  }) => {
    if (currentDatasetId !== '') {
      return {
        meta: metaTables,
        collection: datasets.byId[currentDatasetId].tables.map((tableId) => tables.byId[tableId])
      };
    }
    return {
      meta: {},
      collection: []
    };
  }
);

export const selectIsUploadDatasetDialogOpen = createSelector(
  selectDatasetsUI,
  (ui) => ui.uploadDatasetDialogOpen
);

export const selectIsUploadTableDialogOpen = createSelector(
  selectDatasetsUI,
  (ui) => ui.uploadTableDialogOpen
);

export const selectIsHelpDialogOpen = createSelector(
  selectDatasetsUI,
  (ui) => ui.helpDialogOpen
);
