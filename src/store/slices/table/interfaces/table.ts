import { RequestEnhancedState } from '@store/enhancers/requests';
import { UndoEnhancedState } from '@store/enhancers/undo';
import { ID, BaseState } from '@store/interfaces/store';
import { Reconciliator } from '@store/slices/config/interfaces/config';

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

export interface TableInstance {
  id: ID;
  name: string;
  format: FileFormat;
  type: TableType;
  lastModifiedDate: string;
  nCells: number;
  nCellsReconciliated: number;
}

/**
 * Table UI state.
 */
export interface TableUIState {
  search: { filter: string; value: string };
  denseView: boolean;
  viewOnly: boolean;
  openReconciliateDialog: boolean;
  openExtensionDialog: boolean;
  openMetadataDialog: boolean;
  openExportDialog: boolean;
  headerExpanded: boolean;
  view: 'table' | 'graph' | 'raw';
  selectedColumnCellsIds: Record<ID, boolean>;
  selectedColumnsIds: Record<ID, boolean>;
  selectedRowsIds: Record<ID, boolean>;
  selectedCellIds: Record<ID, boolean>;
  expandedColumnsIds: Record<ID, boolean>;
  expandedCellsIds: Record<ID, boolean>;
  editableCellsIds: Record<ID, boolean>;
  lastSaved: string;
  tutorialBBoxes: Record<string, BBox>;
}

export interface BBox {
  height: number;
  width: number;
  x: number;
  y: number;
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface ColumnState extends BaseState<Column> {}
export interface RowState extends BaseState<Row> {}

export enum ColumnStatus {
  RECONCILIATED='reconciliated',
  PENDING='pending',
  EMPTY='empty'
}

export enum CsvSeparator {
  TAB='\t',
  COMMA=',',
  SEMICOLON=';'
}

/**
 * A column instance.
 */
export interface Column {
  id: ID;
  label: string;
  status: ColumnStatus;
  context: Record<ID, Context>;
  metadata: ColumnMetadata[];
  kind?: string;
  role?: string;
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
  id: ID;
  label: string;
  metadata: BaseMetadata[];
}

export interface Context {
  uri: string;
  total: number;
  reconciliated: number;
}

export interface BaseMetadata {
  id: ID;
  name: {
    value: string;
    uri: string;
  };
  match?: boolean;
  score?: number;
  type?: BaseMetadata[];
}

export interface ColumnMetadata extends BaseMetadata {
  property?: PropertyMetadata[];
}

export interface PropertyMetadata extends BaseMetadata {
  obj?: ID;
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
    metadata: BaseMetadata[]
  }[],
  reconciliator: Reconciliator & { id: ID };
}

export interface ExtendFulfilledPayload {
  columns: ColumnState['byId']
  rows: RowState['byId']
}

export interface AddCellMetadataPayload {
  cellId: ID;
  prefix: string;
  value: {
    id: string;
    name: string;
    score: number;
    match: string;
  }
}

export interface UpdateCellMetadataPayload {
  metadataId: ID,
  cellId: ID
}

export interface DeleteCellMetadataPayload {
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
