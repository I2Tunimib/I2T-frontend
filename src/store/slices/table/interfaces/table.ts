import { RequestEnhancedState } from '@store/enhancers/requests';
import { UndoEnhancedState } from '@store/enhancers/undo';

/**
 * Table slice state.
 * It extends requests and undo states to support requests status and undo behaviour.
 */
export interface TableState extends RequestEnhancedState, UndoEnhancedState {
  entities: {
    columns: ColumnState;
    rows: RowState;
  },
  ui: TableUIState;
}

/**
 * Table UI state.
 */
export interface TableUIState {
  denseView: boolean;
  openReconciliateDialog: boolean;
  openMetadataDialog: boolean;
  selectedColumnsIds: Record<ID, boolean>;
  selectedRowsIds: Record<ID, boolean>;
  selectedCellIds: Record<ID, boolean>;
  selectedCellMetadataId: Record<ID, string>;
}

export type ID = string;
/**
 * Base state for entities.
 */
interface BaseState<T> {
  byId: Record<ID, T>;
  allIds: string[];
}

export interface ColumnState extends BaseState<Column> {}
export interface RowState extends BaseState<Row> {}

/**
 * A column instance.
 */
export interface Column {
  id: ID;
  label: string;
  reconciliator: string;
  extension: string;
}
/**
 * A row instance.
 */
export interface Row {
  id: ID;
  cells: Record<ID, Cell>
}
/**
 * A cell instance.
 */
export interface Cell {
  label: string;
  metadata: Metadata;
  editable: boolean;
  expanded: boolean;
}
export interface Metadata {
  reconciliator: string;
  values: MetadataInstance[];
}
/**
 * A metadata instance.
 */
export interface MetadataInstance extends Record<string, unknown> {
  id: ID;
  name: string;
  match: boolean;
  score: number;
  type: {
    id: string;
    name: string;
  }[]
}

/**
 * ACTIONS
 */
export interface SetDataPayload {
  format: string;
  data: string;
}

export interface UpdateSelectedCellsPayload {
  id: ID;
  multi?: boolean;
}

export interface UpdateSelectedRowPayload {
  id: ID;
  multi?: boolean;
}

export interface UpdateSelectedColumnPayload {
  id: ID;
  multi?: boolean;
}

export interface ReconciliationFulfilledPayload {
  data: {
    id: ID,
    metadata: MetadataInstance[]
  }[],
  reconciliator: string;
}

export interface UpdateCellMetadataPayload {
  metadataId: ID,
  cellId: ID
}

export interface UpdateCellLabelPayload {
  cellId: ID,
  value: string
}

export interface UpdateCellEditablePayload {
  cellId: ID
}

export interface AutoMatchingPayload {
  threshold: number;
}

export interface DeleteSelectedPayload {}

export interface DeleteColumnPayload {
  colId: ID;
}

export interface DeleteRowPayload {
  rowId: ID;
}
