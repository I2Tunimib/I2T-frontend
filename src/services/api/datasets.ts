import { ID } from '@store/interfaces/store';
import { DatasetInstance, TableInstance } from '@store/slices/datasets/interfaces/datasets';
import config from '../../config.yaml';
import apiClient from './config/config';

export type Dataset = Omit<DatasetInstance, 'tables'>;
export type Table = TableInstance;

const { API } = config;

const datasetAPI = {
  getAllDatasets: () => apiClient.get<Dataset[]>(API.GET_DATASET),
  getOneDataset: (datasetId: ID) => apiClient.get<Dataset>(API.GET_DATASET.replace(':id_dataset', datasetId)),
  getAllDatasetTables: (datasetId: ID) => apiClient.get<Table[]>(API.GET_TABLES_BY_DATASET.replace(':id_dataset', datasetId))
};

export default datasetAPI;
