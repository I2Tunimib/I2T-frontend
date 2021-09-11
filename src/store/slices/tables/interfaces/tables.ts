import { CsvSeparator } from '@services/converters/csv-converter';
import { RequestEnhancedState } from '@store/enhancers/requests';
import { FileFormat, ID, TableType } from '@store/slices/table/interfaces/table';

export interface TablesState extends RequestEnhancedState {
  entities: {
    raw: TablesInstancesState;
    annotated: TablesInstancesState;
  },
  ui: TablesUIState;
}

export interface TablesUIState {
  selectedSource: 'raw' | 'annotated';
  uploadDialogOpen: boolean;
  selectedTable: string;
}

interface BaseState<T> {
  byId: Record<ID, T>;
  allIds: string[];
}

export interface TableInstance {
  name: string;
  lastModifiedDate: string;
  format: FileFormat;
  type: TableType;
  separator?: CsvSeparator;
}

export interface TablesInstancesState extends BaseState<TableInstance> { }

export interface OrderTablesPayload {
  order: 'asc' | 'desc';
  property: 'name' | 'lastModifiedDate';
}
