import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@root/store';
import { getRequestStatus } from '@store/enhancers/requests';
import { ID } from '@store/interfaces/store';
import { DatasetThunkActions } from './datasets.thunk';
import { TableInstance } from './interfaces/datasets';

const selectDatasetsState = (state: RootState) => state.datasets.entities;
const selectDatasetsEntities = (state: RootState) => state.datasets.entities.datasets;
const selectCurrentDatasetId = (state: RootState) => state.datasets.entities.currentDatasetId;
const selectRequests = (state: RootState) => state.datasets._requests;

export const selectDatasets = createSelector(
  selectDatasetsState,
  (entities) => entities.datasets.allIds.map((id) => entities.datasets.byId[id])
);

export const selectGetAllDatasetsStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, DatasetThunkActions.GET_ALL_DATASETS)
);

export const selectCurrentDataset = createSelector(
  selectCurrentDatasetId,
  selectDatasetsEntities,
  (datasetId, datasets) => datasets.byId[datasetId]
);

export const selectCurrentDatasetTables = createSelector(
  selectDatasetsState,
  ({ currentDatasetId, datasets, tables }) => {
    if (currentDatasetId) {
      return datasets.byId[currentDatasetId].tables.map((tableId) => tables.byId[tableId]);
    }
    return [];
  }
);

// export const selectDatasetsTableFormat = createSelector(
//   selectDatasetsState,
//   (entities) => {
//     if (entities.datasets.allIds.length === 0) {
//       return { columns: [], data: [] };
//     }
//     const data = entities.datasets.allIds.map((id) => {
//       const dataset = entities.datasets.byId[id];
//       return {
//         name: dataset.name,
//         nTables: dataset.nTables,
//         nAvgRows: dataset.avgRows,
//         nAvgCols: dataset.avgCols,
//         stdDevRows: dataset.stdRows,
//         stdDevCols: dataset.stdCols,
//         status: dataset.status
//       };
//     });
//     const columns = Object.keys(data[0]).map((key) => ({
//       Header: key,
//       accessor: key
//     }));

//     return { columns, data };
//   }
// );
