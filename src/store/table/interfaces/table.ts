import { RequestEnhancedState } from '@store/enhancers/requests';
import { UndoEnhancedState } from '@store/enhancers/undo';

export interface TableState extends RequestEnhancedState, UndoEnhancedState {
  entities: {
    columns: ColumnState;
    rows: RowState;
  },
  ui: TableUIState;
}

export interface TableUIState {
  openReconciliateDialog: boolean;
  openMetadataDialog: boolean;
  selectedColumnsIds: Record<ID, boolean>;
  selectedRowsIds: Record<ID, boolean>;
  selectedCellIds: Record<ID, boolean>;
  selectedCellMetadataId: Record<ID, string>;
}

export type ID = string;

interface BaseState<T> {
  byId: Record<ID, T>;
  allIds: string[];
}

export interface ColumnState extends BaseState<Column> {}
export interface RowState extends BaseState<Row> {}

export interface Column {
  id: ID;
  label: string;
  reconciliator: string;
  extension: string;
}
export interface Row {
  id: ID;
  cells: Record<ID, Cell>
}
export interface Cell {
  id: ID;
  rowId: ID;
  columnId: ID;
  label: string;
  metadata: Metadata[];
}
export interface Metadata extends Record<string, unknown> {
  id: ID;
  name: string;
  match: boolean;
  score: number;
  type: {
    id: string;
    name: string;
  }[]
}
export interface JoinTable {
  id: ID;
  primaryId: ID;
  foreignId: ID;
}

/**
 * ACTIONS
 */
export interface ISetDataAction {
  format: string;
  data: string;
}

export interface UpdateSelectedCellsAction {
  id: ID;
  multi?: boolean;
}

export interface ReconciliationFulfilledAction {
  data: {
    id: ID,
    metadata: Metadata[]
  }[],
  reconciliator: string;
}

export interface UpdateCellMetadata {
  metadataId: ID,
  cellId: ID
}
