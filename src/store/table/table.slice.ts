import {
  createSelector,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { convertFromCSV } from '@services/converters/csv-converter';
import { RootState } from '@store';
import merge from 'lodash/merge';

// Define a type for the slice state
interface ITableState {
  entities: {
    columns: IColumnsState;
    rows: IRowsState;
    cells: ICellsState;
    columnCell: IColumnCellState;
    rowCell: IRowCellState;
  }
  ui: ITableUIState;
}

interface IBaseState {
  byId: Record<string, unknown>;
  allIds: string[];
}

interface IColumnState {
  id: string;
  label: string;
  reconciliator: string;
  extension: string;
}

interface ICellState {
  id: string;
  rowId: string;
  columnId: string;
  label: string;
  metadata: IMetadataState[];
}

interface IMetadataState {
  id: string;
  name: string;
  match: boolean;
  score: number;
  type: {
    id: string;
    name: string;
  }
}

export interface IColumnsState extends IBaseState {
  byId: {
    [id: string]: IColumnState
  }
}

export interface IRowsState extends IBaseState {
  byId: {
    [id: string]: {
      id: string;
    }
  }
}

export interface ICellsState extends IBaseState {
  byId: {
    [id: string]: ICellState
  }
}

export interface IRowCellState extends IBaseState {
  byId: {
    [id: string]: {
      id: string;
      rowId: string;
      cellId: string;
    }
  }
}

export interface IColumnCellState extends IBaseState {
  byId: {
    [id: string]: {
      id: string;
      columnId: string;
      cellId: string;
    }
  }
}

interface ITableUIState {
  openReconciliateDialog: boolean;
  openMetadataDialog: boolean;
  selectedColumnsIds: string[];
  selectedCell: string;
}

interface ISetDataAction {
  format: string;
  data: string;
}

interface IAddCellsColumnMetadataAction {
  data: Partial<ICellsState>;
  reconciliator: string;
}

// Define the initial state using that type
const initialState: ITableState = {
  entities: {
    columns: { byId: {}, allIds: [] },
    rows: { byId: {}, allIds: [] },
    cells: { byId: {}, allIds: [] },
    columnCell: { byId: {}, allIds: [] },
    rowCell: { byId: {}, allIds: [] }
  },
  ui: {
    openReconciliateDialog: false,
    openMetadataDialog: false,
    selectedColumnsIds: [],
    selectedCell: ''
  }
};

export const tableSlice = createSlice({
  name: 'table',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setData: (state, { payload }: PayloadAction<ISetDataAction>) => {
      const { data, format } = payload;
      if (format === 'csv') {
        const entities = convertFromCSV(data);
        state.entities = entities;
      }
      return state;
    },
    updateSelectedColumns: (state, { payload }: PayloadAction<string>) => {
      const { selectedColumnsIds } = state.ui;
      if (!selectedColumnsIds.includes(payload)) {
        // add id if not yet selected
        return {
          ...state,
          ui: { ...state.ui, selectedColumnsIds: [...selectedColumnsIds, payload] }
        };
      }
      // remove id if already selected
      return {
        ...state,
        ui: { ...state.ui, selectedColumnsIds: selectedColumnsIds.filter((id) => id !== payload) }
      };
    },
    updateSelectedCell: (state, { payload }: PayloadAction<string>) => {
      const { selectedCell } = state.ui;
      // if cell is reclicked set to null
      if (selectedCell === payload) {
        return { ...state, ui: { ...state.ui, selectedCell: '' } };
      }
      // if new cell is clicked
      return { ...state, ui: { ...state.ui, selectedCell: payload } };
    },
    updateUI: (state, { payload }: PayloadAction<Partial<ITableUIState>>) => {
      state.ui = { ...state.ui, ...payload };
    },
    updateCells: (state, { payload }: PayloadAction<Partial<ICellsState>>) => {
      const updatedCells = merge({}, state.entities.cells.byId, payload);
      state.entities.cells.byId = updatedCells;
    },
    addCellsColumnMetadata: (state, { payload }: PayloadAction<IAddCellsColumnMetadataAction>) => {
      const { data, reconciliator } = payload;
      // add metadata to cells
      const updatedCells = merge({}, state.entities.cells.byId, data);
      state.entities.cells.byId = updatedCells;
      // add reconciliator name to columns
      const { entities: { columns }, ui: { selectedColumnsIds } } = state;
      selectedColumnsIds.forEach((id) => {
        columns.byId[id].reconciliator = reconciliator;
      });
    }
  }
});

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export const {
  setData,
  updateCells,
  addCellsColumnMetadata,
  updateSelectedColumns,
  updateSelectedCell,
  updateUI
} = tableSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectTableState = (state: RootState) => state.table;
export const selectEntitiesState = (state: RootState) => state.table.entities;
export const selectUIState = (state: RootState) => state.table.ui;
export const selectSelectedColumnsState = (state: RootState) => state.table.ui.selectedColumnsIds;

export const selectTableData = createSelector(
  selectEntitiesState,
  ({
    columns,
    rows,
    rowCell,
    cells
  }) => {
    // return an array of rows formatted for the table component
    const formattedRows = rows.allIds.map((rowId) => (
      // reduce to row object
      rowCell.allIds
        .reduce((acc, rowCellId) => {
          if (rowCell.byId[rowCellId].rowId === rowId) {
            const {
              id, label,
              metadata, columnId
            } = cells.byId[rowCell.byId[rowCellId].cellId];
            return {
              ...acc,
              [columnId]: {
                id,
                label,
                metadata
              }
            };
          }
          return acc;
        }, {})));
    const formattedColumns = columns.allIds.map((colId) => {
      const {
        id: accessor, label: Header,
        reconciliator, extension
      } = (columns.byId[colId]);
      return {
        Header,
        accessor,
        reconciliator,
        extension
      };
    });
    return {
      data: formattedRows,
      columns: formattedColumns
    };
  }
);

/**
 * Selector which returns ids of selected columns
 */
export const selectSelectedColumnsIds = createSelector(
  selectUIState,
  (ui) => ui.selectedColumnsIds
);

/**
 * Selector which returns if at least a column is selected
 */
export const selectIsColumnSelected = createSelector(
  selectTableState,
  ({ ui: { selectedColumnsIds } }) => selectedColumnsIds.length > 0
);

/**
 * Selector which returns the state of reconciliate dialog
 */
export const selectReconciliateDialogOpen = createSelector(
  selectTableState,
  ({ ui }) => ui.openReconciliateDialog
);

/**
 * Selector which returns cells selected by columns
 */
export const selectSelectedColumnsCells = createSelector(
  selectEntitiesState,
  selectSelectedColumnsState,
  ({ cells }, selectedColumnsIds) => selectedColumnsIds.reduce((acc, colId) => {
    const filteredCells = cells.allIds
      .filter((cellId) => cells.byId[cellId].columnId === colId)
      .map((filteredCellId) => cells.byId[filteredCellId]);

    return [...acc, ...filteredCells];
  }, [] as ICellState[])
);

/**
 * Selector which returns cells selected by columns processed for reconciliation
 * request
 */
export const selectCellsReconciliationRequest = createSelector(
  selectSelectedColumnsCells,
  (cells) => cells.map(({ id, label }) => ({ id, label }))
);

/**
 * Selector which returns the state of the metadata dialog
 */
export const selectMetadataDialogOpen = createSelector(
  selectTableState,
  ({ ui }) => ui.openReconciliateDialog
);

/**
 * Selector which returns the state of the selected cell
 */
export const selectSelectedCell = createSelector(
  selectTableState,
  ({ ui }) => ui.selectedCell
);

export default tableSlice.reducer;
