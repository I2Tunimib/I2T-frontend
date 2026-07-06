import { ItemsToMatch } from "@pages/Viewer/TableViewer/RefineMatching/TypeRefineMatching";
import { RequestEnhancedState } from "@store/enhancers/requests";
import { UndoEnhancedState } from "@store/enhancers/undo";
import { ID, BaseState } from "@store/interfaces/store";
import { Reconciliator } from "@store/slices/config/interfaces/config";
import { DependencyGraph } from "./table";

/**
 * Table slice state.
 * It extends requests and undo states to support requests status and undo behaviour.
 */
export interface TableState extends RequestEnhancedState, UndoEnhancedState {
  entities: {
    tableInstance: Partial<CurrentTableState>;
    columns: ColumnState;
    rows: RowState;
  };
  ui: TableUIState;
  dependencies: DependencyGraph | null;
}

export interface CurrentTableState extends TableInstance {}

export interface TableInstance {
  id: ID;
  idDataset: ID;
  name: string;
  format: FileFormat;
  type: TableType;
  lastModifiedDate: string;
  nCells: number;
  nCellsReconciliated: number;
  minMetaScore: number;
  maxMetaScore: number;
  mantisStatus?: "PENDING" | "DONE";
  schemaStatus?: "PENDING" | "DONE";
  complianceStatus?: "PENDING" | "DONE" | "ERROR";
  compliance?: any; // legacy — kept for backward compatibility
  complianceReports?: ComplianceReport[];
}

export interface ComplianceReport {
  userId: string | null;
  date: string;
  result: any[];
}

export interface GraphNode {
  label: string;
  kind: string;
  datatype: string;
  role: string;
  metadata?: string;
  types: any[];
  properties: any[];
  values: string[];
}

export interface GraphLink {
  id: string;
  source: any;
  target: any;
  label: string;
  propID: string;
  curvature?: number;
}

export interface GraphMetric {
  name: string;
  value: any;
  description: string;
}

/**
 * Table UI state.
 */
export interface TableUIState {
  search: { globalFilter: string[]; filter: string; value: string };
  denseView: boolean;
  openReconciliateDialog: boolean;
  openExtensionDialog: boolean;
  openModificationDialog: boolean;
  openMetadataDialog: boolean;
  openExportDialog: boolean;
  showLinkLabels: boolean;
  showCompliance: boolean;
  currentGraphSnapshot: string;
  currentGraphSnapshotCompliance: string;
  currentGraphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  } | null;
  currentMetrics: GraphMetric[] | null;
  openGraphDialog: boolean;
  openComplianceStatusDialog: boolean;
  initialComplianceType: string;
  openAutoAnnotationDialog: boolean;
  openMetadataColumnDialog: boolean;
  metadataColumnDialogColId: string | null;
  metadataColumnDialogInitialTab: number;
  openHelpDialog: boolean;
  openGraphTutorialDialog: boolean;
  helpStart: "rec" | "ext" | "tutorial";
  graphTutorialStart: "tutorial";
  settingsDialog: boolean;
  settings: Partial<Settings>;
  headerExpanded: boolean;
  view: "table" | "graph" | "raw";
  selectedColumnCellsIds: Record<ID, boolean>;
  selectedColumnsIds: Record<ID, boolean>;
  selectedRowsIds: Record<ID, boolean>;
  selectedCellIds: Record<ID, boolean>;
  expandedColumnsIds: Record<ID, boolean>;
  expandedCellsIds: Record<ID, boolean>;
  editableCellsIds: Record<ID, boolean>;
  deletedColumnsIds: Record<ID, string>; // Track deleted columns with their names/labels
  lastSaved: string;
  tmpCell: Cell | null;
  tutorialBBoxes: Record<string, BBox>;
  tutorialStep: number;
}

export interface Settings {
  isViewOnly: boolean;
  isScoreLowerBoundEnabled: boolean;
  scoreLowerBound: number;
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
  RECONCILIATED = "reconciliated",
  PENDING = "pending",
  EMPTY = "empty",
}

export enum CsvSeparator {
  TAB = "\t",
  COMMA = ",",
  SEMICOLON = ";",
}

/**
 * A column instance.
 */
export interface Column {
  id: ID;
  label: string;
  status: ColumnStatus;
  context: Record<ID, Context>;
  annotationMeta: AnnotationMeta;
  metadata: ColumnMetadata[];
  kind?: string;
  role?: string;
  datatype?: string;
  reconciler?: string;
}
/**
 * A row instance.
 */
export interface Row {
  id: ID;
  cells: Record<ID, Cell>;
}
/**
 * A cell instance.
 */
export interface Cell {
  id: ID;
  label: string;
  metadata: BaseMetadata[];
  annotationMeta: AnnotationMeta;
}

export interface AnnotationMeta {
  annotated?: boolean;
  match: {
    value: boolean;
    reason?: "reconciliator" | "manual" | "refinement";
    reconciler?: string;
  };
  highestScore: number;
  lowestScore: number;
}

export interface Context {
  uri: string;
  total: number;
  reconciliated: number;
}

export interface BaseMetadata {
  id: ID;
  name:
    | {
        value: string;
        uri: string | undefined;
      }
    | string;
  match: boolean;
  score: number;
  type?: BaseMetadata[];
  additionalTypes?: BaseMetadata[];
}

export interface ColumnMetadata extends BaseMetadata {
  property?: PropertyMetadata[];
  entity?: BaseMetadata[];
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

export interface AutomaticAnnotationPayload {
  datasetId: string;
  tableId: string;
  mantisStatus: "PENDING";
  schemaStatus: "PENDING";
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
    id: ID;
    metadata: BaseMetadata[];
  }[];
  reconciliator: Reconciliator & { id: ID };
}

export interface ExtendFulfilledPayload {
  columns: ColumnState["byId"];
  rows: RowState["byId"];
}

export interface ModifyFulfilledPayload {
  columns: ColumnState["byId"];
  rows: RowState["byId"];
}

export interface AddCellMetadataPayload {
  cellId: ID;
  metadataId: string;
  prefix: string;
  value: {
    id: string;
    name: string;
    score: number;
    match: string;
    uri: string;
  };
}

export interface AddColumnMetadataPayload {
  colId: ID;
  type: "type" | "property" | "entity";
  prefix?: string;
  value: {
    id: string;
    name: string;
    uri?: string;
    score: number;
    match: string;
    description: string;
    obj?: string;
  };
}

export interface DeleteColumnMetadataPayload {
  metadataId: ID;
  colId: ID;
  type: "type" | "property" | "entity";
}

export interface UpdateCellMetadataPayload {
  metadataId: ID;
  cellId: ID;
  match?: boolean;
}
export interface UpdateColumnMetadataPayload {
  metadataId: ID;
  colId: ID;
}

export interface DeleteCellMetadataPayload {
  metadataId: ID;
  cellId: ID;
}

export interface UpdateCellLabelPayload {
  cellId: ID;
  value: string;
}

export interface UpdateColumnEditablePayload {
  colId: ID;
}

export interface UpdateCellEditablePayload {
  cellId: ID;
}

export interface AutoMatchingPayload {
  threshold: number;
}

export interface RefineMatchingPayload {
  changes: ItemsToMatch[];
}

export interface UpdateColumnTypePayload {
  id: ID;
  name: string;
}

export interface UpdateColumnTypeMatchesPayload {
  typeIds: string[];
}

export interface AddColumnTypePayload {
  id: string;
  name: string;
  uri?: string;
}

export interface UpdateCurrentTablePayload extends Partial<TableInstance> {}

// ---------------------------------------------------------------------------
// Dependencies (returned by the backend middleware after every service call)
// ---------------------------------------------------------------------------

export interface DependencyNode {
  id: string;
  children: string[];
  parents: string[];
  supportChildren?: string[];
  supportParents?: string[];
  [key: string]: any;
}

export interface DependencyOperation {
  id: string;
  opNumber?: number;
  timestamp?: string;
  operationType: "RECONCILIATION" | "EXTENSION" | "MODIFICATION" | string;
  columnName?: string;
  /** Generic fallback (older log entries) */
  service?: string;
  /** Set for RECONCILIATION operations */
  reconciler?: string;
  /** Set for EXTENSION operations */
  extender?: string;
  /** Set for MODIFICATION operations */
  modifier?: string;
  /** True if this operation was committed before the last table save */
  consolidated?: boolean;
  [key: string]: any;
}

export interface DependencyGraph {
  datasetId: string;
  tableId: string;
  columns: Record<string, any>;
  operationsCount: number;
  latestTableData: any;
  nodes: Record<string, DependencyNode>;
  operations: DependencyOperation[];
}

export interface DeleteSelectedPayload {}

export interface DeleteColumnPayload {
  colId: ID;
}
export interface DeleteRowPayload {
  rowId: ID;
}

export interface CopyCellPayload {
  cellId: ID;
}

export interface PasteCellPayload {
  cellId: ID;
}

export enum TableType {
  RAW = "raw",
  ANNOTATED = "annotated",
  CHALLENGE = "challenge",
  DATA = "data",
  CEA = "cea",
  CTA = "cta",
  CPA = "cpa",
}

export enum FileFormat {
  CSV = "csv",
  JSON = "json",
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
  meta: MetaFile;
}
