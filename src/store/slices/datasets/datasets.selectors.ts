import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { DatasetThunkActions } from './datasets.thunk';

const selectDatasetsState = (state: RootState) => state.datasets.entities;
const selectDatasetsEntities = (state: RootState) => state.datasets.entities.datasets;
const selectCurrentDatasetId = (state: RootState) => state.datasets.entities.currentDatasetId;
const selectDatasetsUI = (state: RootState) => state.datasets.ui;
const selectRequests = (state: RootState) => state.datasets._requests;

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

export const selectGetAllDatasetsStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, DatasetThunkActions.GET_DATASET)
);

export const selectGetTablesDatasetStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, DatasetThunkActions.GET_TABLES_BY_DATASET)
);

export const selectUploadDatasetStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, DatasetThunkActions.UPLOAD_DATASET)
);

export const selectUploadTableStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, DatasetThunkActions.UPLOAD_TABLE)
);

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
