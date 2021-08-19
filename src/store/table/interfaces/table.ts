import { IRequestState } from '@store/requests/interfaces/requests';

export interface ITableState extends IRequestState {
  entities: {
    columns: IColumnsState;
    rows: IRowsState;
    cells: ICellsState;
    columnCell: IColumnCellState;
    rowCell: IRowCellState;
  }
  ui: ITableUIState;
}

export interface ITableUIState {
  openReconciliateDialog: boolean;
  openMetadataDialog: boolean;
  selectedColumnsIds: string[];
  selectedCellId: string;
  selectedCellMetadataId: ICellMetadataState;
  contextualMenu: IContextualMenuState;
}

export interface IBaseState {
  byId: Record<string, unknown>;
  allIds: string[];
}

export interface IColumnState {
  id: string;
  label: string;
  reconciliator: string;
  extension: string;
}

export interface ICellState {
  id: string;
  rowId: string;
  columnId: string;
  label: string;
  metadata: IMetadataState[];
}

export interface IMetadataState extends Record<string, unknown> {
  id: string;
  name: string;
  match: boolean;
  score: number;
  type: {
    id: string;
    name: string;
  }[]
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

export interface IContextualMenuState {
  mouseX: number | null;
  mouseY: number | null;
  target: {
    id: string;
    type: 'cell' | 'column';
  } | null;
}

export interface ICellMetadataState {
  [cellId: string]: string;
}

export interface ISetDataAction {
  format: string;
  data: string;
}

export interface IAddCellsColumnMetadataAction {
  data: Partial<ICellsState>;
  reconciliator: string;
}
