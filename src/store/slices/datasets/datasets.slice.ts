import { PayloadAction } from '@reduxjs/toolkit';
import { Dataset, Table } from '@services/api/datasets';
import { createSliceWithRequests } from '@store/enhancers/requests';
import { getAllDatasets, getAllDatasetTables } from './datasets.thunk';
import { DatasetsInstancesState, DatasetsState, TablesInstancesState } from './interfaces/datasets';

const initialState: DatasetsState = {
  entities: {
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
  reducers: {},
  extraRules: (builder) => (
    builder
      .addCase(getAllDatasets.fulfilled, (state, action: PayloadAction<Dataset[]>) => {
        state.entities.datasets = action.payload
          .reduce<DatasetsInstancesState>((acc, { id, ...rest }) => {
            acc.byId[id] = {
              id,
              ...rest
            };
            acc.allIds.push(id);
            return acc;
          }, { byId: {}, allIds: [] });
      })
      .addCase(getAllDatasetTables.fulfilled, (state, action: PayloadAction<Table[]>) => {
        state.entities.tables = action.payload
          .reduce<TablesInstancesState>((acc, { id, ...rest }) => {
            acc.byId[id] = {
              id,
              ...rest
            };
            acc.allIds.push(id);
            return acc;
          }, { byId: {}, allIds: [] });
      })
  )
});
