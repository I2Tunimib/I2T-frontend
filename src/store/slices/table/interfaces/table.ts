import { CsvSeparator } from '@services/converters/csv-converter';
import { RequestEnhancedState } from '@store/enhancers/requests';
import { UndoEnhancedState } from '@store/enhancers/undo';
import { ID, BaseState } from '@store/interfaces/store';
import { Reconciliator } from '@store/slices/config/interfaces/config';
import { TableInstance } from '@store/slices/tables/interfaces/tables';

/**
 * Table slice state.
 * It extends requests and undo states to support requests status and undo behaviour.
 */
export interface TableState extends RequestEnhancedState, UndoEnhancedState {
  entities: {
    tableInstance: CurrentTableState;
    columns: ColumnState;
    rows: RowState;
  },
  ui: TableUIState;
}

export interface CurrentTableState extends Partial<TableInstance>{}

/**
 * Table UI state.
 */
export interface TableUIState {
  search: { filter: string; value: string };
  denseView: boolean;
  openReconciliateDialog: boolean;
  openMetadataDialog: boolean;
  selectedColumnsIds: Record<ID, boolean>;
  selectedRowsIds: Record<ID, boolean>;
  selectedCellIds: Record<ID, boolean>;
  selectedCellMetadataId: Record<ID, string>;
  lastSaved: string;
}

export interface ColumnState extends BaseState<Column> {}
export interface RowState extends BaseState<Row> {}

export enum ColumnStatus {
  RECONCILIATED='reconciliated',
  PENDING='pending',
  EMPTY='empty'
}

/**
 * A column instance.
 */
export interface Column {
  id: ID;
  label: string;
  status: ColumnStatus;
  reconciliators: string[];
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
  reconciliator: {
    id: ID;
    name: string;
  };
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
  reconciliator: Reconciliator & { id: ID };
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

export interface UpdateCurrentTablePayload extends Partial<TableInstance> {}

export interface DeleteSelectedPayload {}

export interface DeleteColumnPayload {
  colId: ID;
}
export interface DeleteRowPayload {
  rowId: ID;
}

export enum TableType {
  RAW = 'raw',
  ANNOTATED = 'annotated',
  CHALLENGE = 'challenge',
  DATA = 'data',
  CEA = 'cea',
  CTA = 'cta',
  CPA = 'cpa'
}

export enum FileFormat {
  CSV = 'csv',
  JSON = 'json'
}

export interface MetaFile {
  format: FileFormat;
  separator?: CsvSeparator;
  lastModifiedData?: string;
}

export interface TableFile {
  name: string;
  type: TableType;
  original?: File | string;
  meta: MetaFile
}
