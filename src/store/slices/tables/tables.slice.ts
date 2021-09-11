import { PayloadAction } from '@reduxjs/toolkit';
import { createSliceWithRequests } from '@store/enhancers/requests';
import { removeObject } from '../table/utils/table.utils';
import {
  OrderTablesPayload, TableInstance,
  TablesState, TablesUIState, UpdateFileUploadPayload
} from './interfaces/tables';
import { getTables, uploadTable } from './tables.thunk';
import { orderTablesArray, orderTablesByDate } from './utils/tables.utils';

// Define the initial state using that type
const initialState: TablesState = {
  entities: {
    raw: { byId: {}, allIds: [] },
    annotated: { byId: {}, allIds: [] }
  },
  ui: {
    selectedSource: 'raw',
    uploadDialogOpen: false,
    selectedTable: '',
    uploadProgressDialogOpen: false
  },
  _uploadRequests: { byId: {}, allIds: [] },
  _requests: { byId: {}, allIds: [] }
};

export const tablesSlice = createSliceWithRequests({
  name: 'tables',
  initialState,
  reducers: {
    orderTables: (state, action: PayloadAction<OrderTablesPayload>) => {
      const { order, property } = action.payload;
      const { selectedSource } = state.ui;
      orderTablesArray(state, selectedSource, property, order);
    },
    /**
     * Merges parameters of the UI to the current state.
     */
    updateUI: (state, action: PayloadAction<Partial<TablesUIState>>) => {
      const { uploadProgressDialogOpen } = action.payload;
      if (uploadProgressDialogOpen === false) {
        state._uploadRequests = initialState._uploadRequests;
      }
      state.ui = { ...state.ui, ...action.payload };
    },
    updateFileUpload: (state, action: PayloadAction<UpdateFileUploadPayload>) => {
      const { requestId, fileName, progress } = action.payload;
      if (!state._uploadRequests.byId[requestId]) {
        state._uploadRequests.allIds.push(requestId);
      }
      state._uploadRequests.byId[requestId] = {
        id: requestId,
        fileName,
        progress,
        status: progress < 100 ? 'pending' : 'done'
      };
    }
  },
  extraRules: (builder) => (
    builder
      .addCase(getTables.fulfilled, (state, action) => {
        const tables = action.payload;
        const { selectedSource } = state.ui;

        tables.forEach((table: TableInstance) => {
          if (!state.entities[selectedSource].byId[table.name]) {
            state.entities[selectedSource].byId[table.name] = table;
            state.entities[selectedSource].allIds.push(table.name);
          }
        });
      })
      .addCase(uploadTable.fulfilled, (state, action) => {
        const table = action.payload;
        const { selectedSource } = state.ui;
        if (!state.entities[selectedSource].byId[table.name]) {
          state.entities[selectedSource].byId[table.name] = table;
          state.entities[selectedSource].allIds.unshift(table.name);
        }
      })
      .addCase(uploadTable.rejected, (state, action) => {
        const { error, meta } = action;
        if (error.name === 'AbortError') {
          state._uploadRequests.byId = removeObject(state._uploadRequests.byId, meta.arg.requestId);
          state._uploadRequests.allIds = state._uploadRequests.allIds
            .filter((id) => id !== meta.arg.requestId);
        }
      })
  )
});

export const {
  orderTables,
  updateUI,
  updateFileUpload
} = tablesSlice.actions;

export default tablesSlice.reducer;
