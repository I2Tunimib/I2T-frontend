import { IColumn, IRow } from '@components/kit/table/interfaces/table';
import {
  createSelector,
  createSlice,
  current,
  PayloadAction
} from '@reduxjs/toolkit';
import { convertFromCSV } from '@services/converters/csv-converter';
import { RootState } from '@store';

// Define a type for the slice state
interface ITableState {
  columns: IColumn[];
  data: IRow[];
  tableConfig: ITableConfigState;
  ui: ITableUIState
}

interface ITableConfigState {
  compact: boolean;
}

interface ITableUIState {
  openReconciliateDialog: boolean;
  selectedColumnsIds: string[];
  selectedCell: {
    rowId?: number,
    columnId?: string
  }
}

interface ISetDataAction {
  data: {
    format: string;
    content: string;
  }
}

interface IUpdateColumnsAction {
  data: Record<string, any[]>;
  reconciliator: string;
}

interface IUpdateData {
  rowIndex: number,
  columnId: string,
  value: string
}

// Define the initial state using that type
const initialState: ITableState = {
  columns: [],
  data: [],
  tableConfig: {
    compact: false
  },
  ui: {
    openReconciliateDialog: false,
    selectedColumnsIds: [],
    selectedCell: {}
  }
};

export const tableSlice = createSlice({
  name: 'table',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setData: (state, { payload }: PayloadAction<ISetDataAction>) => {
      const { data } = payload;
      if (data.format === 'csv') {
        return { ...state, ...convertFromCSV(data.content) };
      }
      return state;
    },
    updateColumns: (state, { payload }: PayloadAction<IUpdateColumnsAction>) => {
      const { data, reconciliator } = payload;

      const columnKeys = Object.keys(data);
      // update columns cells
      state.data = state.data.map((row, index) => (
        columnKeys.reduce((acc, key) => ({
          ...acc,
          [key]: { ...row[key], ...data[key][index] }
        }), row)));
      // update column headers
      state.columns = state.columns.map((col) => {
        if (columnKeys.indexOf(col.accessor) !== -1) {
          return { ...col, reconciliator };
        }
        return col;
      });
    },
    updateHeaderData: (state, { payload }: PayloadAction<string>) => {
      const { columns, ui } = state;
      // set selection
      state.columns = columns.map((col) => {
        if (col.accessor === payload) {
          return {
            ...col,
            selected: !col.selected
          };
        }
        return col;
      });
      // set which columns are selected
      ui.selectedColumnsIds = state.columns
        .filter((col) => col.selected)
        .map((col) => col.accessor);
    },
    updateSelectedCell: (state, { payload }: PayloadAction<{
      rowId: number, columnId: string
    }>) => {
      const { rowId: previousRowId, columnId: previousColumnId } = state.ui.selectedCell;
      const { rowId, columnId } = payload;
      // if cell is reclicked set to null
      if (rowId === previousRowId && columnId === previousColumnId) {
        return { ...state, ui: { ...state.ui, selectedCell: {} } };
      }
      // if new cell is clicked
      return { ...state, ui: { ...state.ui, selectedCell: { rowId, columnId } } };
    },
    updateUI: (state, { payload }: PayloadAction<Partial<ITableUIState>>) => {
      state.ui = { ...state.ui, ...payload };
    }
    // updateData: (state, { payload }: PayloadAction<IUpdateData>) => {
    //   const { data } = state;
    //   state.data = data.map((row, index) => {
    //     if (index === payload.rowIndex) {
    //       return {
    //         ...data[payload.rowIndex],
    //         [payload.columnId]: { label: payload.value }
    //       };
    //     }
    //     return row;
    //   });
    // },
    // updateHeader: (state, action: PayloadAction<any>) => {
    //   const { columns } = state.table;
    // }
    // decrement: (state) => {
    //   state.value -= 1;
    // },
    // // Use the PayloadAction type to declare the contents of `action.payload`
    // incrementByAmount: (state, action: PayloadAction<number>) => {
    //   state.value += action.payload;
    // }
  }
});

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export const {
  setData,
  updateColumns,
  updateHeaderData,
  updateSelectedCell,
  updateUI
} = tableSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectTable = (state: RootState) => state.table;

/**
 * Selector which returns columns and data
 */
export const selectTableData = createSelector(
  selectTable,
  (table) => table
);

/**
 * Selector which returns if at least a column is selected
 */
export const selectIsColumnSelected = createSelector(
  selectTable,
  ({ ui: { selectedColumnsIds } }) => selectedColumnsIds.length > 0
);

/**
 * Selector which returns selected columns data
 */
export const selectSelectedColumns = createSelector(
  selectTable,
  ({ data, ui: { selectedColumnsIds } }) => selectedColumnsIds.map((id) => ({
    [id]: data.map((row) => row[id])
  }))
);

/**
 * Selector which returns selected columns for Asia Geonames request
 */
export const selectSelectedColumnsAsiaGeo = createSelector(
  selectTable,
  ({ data, ui: { selectedColumnsIds } }) => selectedColumnsIds.map((id) => ({
    [id]: data.map((row) => {
      // deconstruct required objects
      const { label } = row[id];
      return { label };
    })
  }))
);

/**
 * Selector which returns the state of reconciliate dialog
 */
export const selectReconciliateDialogOpen = createSelector(
  selectTable,
  ({ ui }) => ui.openReconciliateDialog
);

/**
 * Selector which returns the state of the selected cell
 */
export const selectSelectedCell = createSelector(
  selectTable,
  ({ ui: { selectedCell } }) => selectedCell
);

/**
 * Selector which returns true if a cell is selected, false otherwise
 */
export const selectIsCellSelected = createSelector(
  selectSelectedCell,
  ({ rowId, columnId }) => rowId && columnId
);

export default tableSlice.reducer;