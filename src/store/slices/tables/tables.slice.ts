import { PayloadAction } from '@reduxjs/toolkit';
import { createSliceWithRequests } from '@store/enhancers/requests';
import {
  OrderTablesPayload, TableInstance,
  TablesState, TablesUIState
} from './interfaces/tables';
import { getTables } from './tables.thunk';
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
    selectedTable: ''
  },
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
      state.ui = { ...state.ui, ...action.payload };
    }
  },
  extraRules: (builder) => (
    builder.addCase(getTables.fulfilled, (state, action) => {
      const tables = action.payload;
      const { selectedSource } = state.ui;

      tables.forEach((table: TableInstance) => {
        if (!state.entities[selectedSource].byId[table.name]) {
          state.entities[selectedSource].byId[table.name] = table;
          state.entities[selectedSource].allIds.push(table.name);
        }
      });
    })
  )
});

export const {
  orderTables,
  updateUI
} = tablesSlice.actions;

export default tablesSlice.reducer;
