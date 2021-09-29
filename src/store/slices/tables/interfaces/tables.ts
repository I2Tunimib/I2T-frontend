import { RequestEnhancedState } from '@store/enhancers/requests';
import { ID } from '@store/interfaces/store';
import { CsvSeparator, FileFormat, TableType } from '@store/slices/table/interfaces/table';

export interface TablesState extends RequestEnhancedState {
  entities: {
    raw: TablesInstancesState;
    annotated: TablesInstancesState;
  },
  ui: TablesUIState;
  _uploadRequests: UploadFilesState;
}

export interface TablesUIState {
  selectedSource?: 'raw' | 'annotated';
  challengeDialogOpen: boolean;
  uploadDialogOpen: boolean;
  uploadProgressDialogOpen: boolean;
}

export interface UploadFilesState extends BaseState<RequestUpload> {}

interface BaseState<T> {
  byId: Record<ID, T>;
  allIds: string[];
}

export interface RequestUpload {
  id: ID;
  name: string;
  progress: number;
  status: 'pending' | 'done';
}

export interface TableInstance {
  id: ID;
  name: string;
  format: FileFormat;
  type: TableType;
  lastModifiedDate: string;
  separator?: CsvSeparator;
}

export interface TablesInstancesState extends BaseState<TableInstance> { }

export interface OrderTablesPayload {
  order: 'asc' | 'desc';
  property: 'name' | 'lastModifiedDate';
}

export interface UpdateFileUploadPayload {
  requestId: ID;
  name: string;
  progress: number;
}
