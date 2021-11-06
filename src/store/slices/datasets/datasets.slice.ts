import { PayloadAction } from '@reduxjs/toolkit';
import { Dataset, GetCollectionResult, Table } from '@services/api/datasets';
import { createSliceWithRequests } from '@store/enhancers/requests';
import { ID } from '@store/interfaces/store';
import {
  deleteDataset, deleteTable, getDataset,
  getTablesByDataset, uploadDataset
} from './datasets.thunk';
import {
  DatasetsInstancesState, DatasetsState,
  DatasetsUIState, TablesInstancesState
} from './interfaces/datasets';

const initialState: DatasetsState = {
  entities: {
    currentDatasetId: '',
    metaDatasets: {},
    metaTables: {},
    datasets: { byId: {}, allIds: [] },
    tables: { byId: {}, allIds: [] }
  },
  ui: {
    challengeDialogOpen: false,
    uploadDialogOpen: false,
    uploadProgressDialogOpen: false
  },
  _requests: { byId: {}, allIds: [] }
};

export const datasetsSlice = createSliceWithRequests({
  name: 'datasets',
  initialState,
  reducers: {
    setCurrentDataset: (state, action: PayloadAction<string>) => {
      state.entities.currentDatasetId = action.payload;
    },
    updateUI: (state, action: PayloadAction<Partial<DatasetsUIState>>) => {
      const { ...rest } = action.payload;
      state.ui = { ...state.ui, ...rest };
    }
  },
  extraRules: (builder) => (
    builder
      .addCase(getDataset.fulfilled,
        (state, action: PayloadAction<GetCollectionResult<Dataset>>) => {
          const { meta, collection } = action.payload;
          state.entities.metaDatasets = meta;
          state.entities.datasets = collection
            .reduce<DatasetsInstancesState>((acc, { id, ...rest }) => {
              acc.byId[id] = {
                id,
                tables: [],
                ...rest
              };
              acc.allIds.push(id);
              return acc;
            }, { byId: {}, allIds: [] });
        })
      .addCase(getTablesByDataset.fulfilled,
        (state, action: PayloadAction<{ data: GetCollectionResult<Table>, datasetId: ID }>) => {
          const { data, datasetId } = action.payload;
          const { meta, collection } = data;
          state.entities.metaTables = meta;
          // new tables from get
          const tablesState = collection.reduce<TablesInstancesState>((acc, { id, ...rest }) => {
            acc.byId[id] = {
              id,
              ...rest
            };
            acc.allIds.push(id);
            return acc;
          }, { byId: {}, allIds: [] });
          // set ids for dataset
          state.entities.datasets.byId[datasetId].tables = tablesState.allIds;
          // add new tables to state
          state.entities.tables.byId = {
            ...state.entities.tables.byId,
            ...tablesState.byId
          };
          // add new tables ids to state
          state.entities.tables.allIds = [
            ...state.entities.tables.allIds,
            ...tablesState.allIds
          ];
        })
      .addCase(uploadDataset.fulfilled,
        (state, action: PayloadAction<{ datasets: any[] }>) => {
          const { datasets } = action.payload;

          state.entities.datasets = datasets.reduce((acc, item) => {
            acc.byId[item.id] = { ...item, tables: [] };
            acc.allIds.push(item.id);
            return acc;
          }, state.entities.datasets);
        })
      .addCase(deleteDataset.fulfilled,
        (state, action: PayloadAction<string>) => {
          const datasetId = action.payload;

          delete state.entities.datasets.byId[datasetId];
          state.entities.datasets.allIds = state.entities.datasets.allIds
            .filter((id) => id !== datasetId);
        })
      .addCase(deleteTable.fulfilled,
        (state, action: PayloadAction<{ datasetId: string; tableId: string }>) => {
          const { datasetId, tableId } = action.payload;

          state.entities.datasets.byId[datasetId].tables = state.entities
            .datasets.byId[datasetId].tables.filter((id) => id !== tableId);

          delete state.entities.tables.byId[tableId];
          state.entities.tables.allIds = state.entities.tables.allIds
            .filter((id) => id !== tableId);
        })
  )
});

export const {
  setCurrentDataset,
  updateUI
} = datasetsSlice.actions;

export default datasetsSlice.reducer;
