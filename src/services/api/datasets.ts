import { ID } from '@store/interfaces/store';
import { DatasetInstance, TableInstance } from '@store/slices/datasets/interfaces/datasets';
import apiClient from './config/config';

export type Dataset = Omit<DatasetInstance, 'tables'>;
export type Table = TableInstance;

const datasetAPI = {
  getAllDatasets: () => apiClient.get<Dataset[]>('/dataset'),
  getOneDataset: (datasetId: ID) => apiClient.get<Dataset>(`/dataset/${datasetId}`),
  getAllDatasetTables: (datasetId: ID) => apiClient.get<Table[]>(`/dataset/${datasetId}/table`)
};

export default datasetAPI;
