import { PayloadAction } from '@reduxjs/toolkit';
import { createSliceWithRequests } from '@store/enhancers/requests';
import { TableType } from '../table/interfaces/table';
import { removeObject } from '../table/utils/table.utils';
import {
  OrderTablesPayload, TableInstance,
  TablesState, TablesUIState, UpdateFileUploadPayload
} from './interfaces/tables';
import {
  copyTable, getTables,
  removeTable, uploadTable
} from './tables.thunk';
import { orderTablesArray } from './utils/tables.utils';

// Define the initial state using that type
const initialState: TablesState = {
  entities: {
    raw: { byId: {}, allIds: [] },
    annotated: { byId: {}, allIds: [] }
  },
  ui: {
    uploadDialogOpen: false,
    importDialogOpen: false,
    uploadProgressDialogOpen: false
  },
  _uploadRequests: { byId: {}, allIds: [] },
  _requests: { byId: {}, allIds: [] }
};

export const tablesSlice = createSliceWithRequests({
  name: 'tables',
  initialState,
  reducers: {
    /**
     * Order tables by name or date.
     */
    orderTables: (state, action: PayloadAction<OrderTablesPayload>) => {
      const { selectedSource } = state.ui;
      if (selectedSource) {
        const { order, property } = action.payload;
        orderTablesArray(state, selectedSource, property, order);
      }
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
    /**
     * Update upload requests.
     */
    updateFileUpload: (state, action: PayloadAction<UpdateFileUploadPayload>) => {
      const { requestId, name, progress } = action.payload;
      if (!state._uploadRequests.byId[requestId]) {
        state._uploadRequests.allIds.push(requestId);
      }
      state._uploadRequests.byId[requestId] = {
        id: requestId,
        name,
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

        if (selectedSource) {
          tables.forEach((table: TableInstance) => {
            if (!state.entities[selectedSource].byId[table.id]) {
              state.entities[selectedSource].byId[table.id] = table;
              state.entities[selectedSource].allIds.push(table.id);
            }
          });
        }
      })
      .addCase(uploadTable.fulfilled, (state, action) => {
        const table = action.payload as TableInstance;
        const { type } = table;
        if (type === TableType.RAW || type === TableType.ANNOTATED) {
          if (!state.entities[type].byId[table.name]) {
            state.entities[type].byId[table.name] = table;
            state.entities[type].allIds.unshift(table.name);
          }
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
      .addCase(copyTable.fulfilled, (state, action) => {
        const table = action.payload;
        const { type } = table as TableInstance;
        if (type === TableType.RAW || type === TableType.ANNOTATED) {
          if (!state.entities[type].byId[table.name]) {
            state.entities[type].byId[table.name] = table;
            state.entities[type].allIds.unshift(table.name);
          }
        }
      })
      .addCase(removeTable.fulfilled, (state, action: PayloadAction<string>) => {
        const id = action.payload;
        const { selectedSource: type } = state.ui;
        if (type === TableType.RAW || type === TableType.ANNOTATED) {
          if (state.entities[type].byId[id]) {
            state.entities[type].byId = removeObject(state.entities[type].byId, id);
            state.entities[type].allIds = state.entities[type].allIds
              .filter((tableId) => tableId !== id);
          }
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
