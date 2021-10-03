import { RequestEnhancedState } from '@store/enhancers/requests';
import { BaseState, ID } from '@store/interfaces/store';

/**
 * State which holds all datasets with their tables and UI state for dialogs.
 */
export interface DatasetsState extends RequestEnhancedState {
  entities: {
    currentDatasetId: string;
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
  uploadDialogOpen: boolean;
  uploadProgressDialogOpen: boolean;
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
  name: string;
  status: StatusTable;
  nRows: number;
  nCols: number;
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
