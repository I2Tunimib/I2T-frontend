import { Dataset, Meta, Table } from '@services/api/datasets';
import { RequestEnhancedState } from '@store/enhancers/requests';
import { BaseState, ID } from '@store/interfaces/store';

/**
 * State which holds all datasets with their tables and UI state for dialogs.
 */
export interface DatasetsState extends RequestEnhancedState {
  entities: {
    currentDatasetId: string;
    metaDatasets: Meta<Dataset>,
    metaTables: Meta<Table>,
    datasets: DatasetsInstancesState;
    tables: TablesInstancesState;
  },
  ui: DatasetsUIState;
}

/**
 * UI state for dialogs.
 */
export interface DatasetsUIState {
  challengeDialogOpen: boolean;
  uploadDatasetDialogOpen: boolean;
  uploadTableDialogOpen: boolean;
  uploadProgressDialogOpen: boolean;
  helpDialogOpen: boolean;
}

/**
 * State which holds datasets instances.
 */
export interface DatasetsInstancesState extends BaseState<DatasetInstance> { }
/**
 * State which holds tables for a dataset.
 */
export interface TablesInstancesState extends BaseState<TableInstance> { }

/**
 * A dataset instance.
 */
export interface DatasetInstance {
  id: ID;
  name: string;
  status: Status;
  nTables: number;
  nAvgRows: number;
  nAvgCols: number;
  stdDevRows: number;
  stdDevCols: number;
  tables: ID[];
}

/**
 * A table instance.
 */
export interface TableInstance {
  id: ID;
  idDataset: ID;
  name: string;
  status: StatusTable;
  nRows: number;
  nCols: number;
  nCells: number;
  nCellsReconciliated: number;
}

export interface Status {
  TODO: number;
  DOING: number;
  DONE: number;
}

export enum StatusTable {
  TODO,
  DOING,
  DONE
}
