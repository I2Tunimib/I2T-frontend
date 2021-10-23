import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { ID } from '@store/interfaces/store';
import { DatasetThunkActions } from './datasets.thunk';
import { TableInstance } from './interfaces/datasets';

const selectDatasetsState = (state: RootState) => state.datasets.entities;
const selectDatasetsEntities = (state: RootState) => state.datasets.entities.datasets;
const selectCurrentDatasetId = (state: RootState) => state.datasets.entities.currentDatasetId;
const selectDatasetsUI = (state: RootState) => state.datasets.ui;
const selectRequests = (state: RootState) => state.datasets._requests;

export const selectDatasets = createSelector(
  selectDatasetsState,
  (entities) => entities.datasets.allIds.map((id) => entities.datasets.byId[id])
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

export const selectCurrentDataset = createSelector(
  selectCurrentDatasetId,
  selectDatasetsEntities,
  (datasetId, datasets) => datasets.byId[datasetId]
);

export const selectCurrentDatasetTables = createSelector(
  selectDatasetsState,
  ({ currentDatasetId, datasets, tables }) => {
    if (currentDatasetId !== '') {
      return datasets.byId[currentDatasetId].tables.map((tableId) => tables.byId[tableId]);
    }
    return [];
  }
);

export const selectIsUploadDialogOpen = createSelector(
  selectDatasetsUI,
  (ui) => ui.uploadDialogOpen
);
