import { DatasetInstance, TableInstance } from '@store/slices/datasets/interfaces/datasets';
import { apiEndpoint } from '../../configHelpers';
import apiClient from './config/config';

export type Dataset = Omit<DatasetInstance, 'tables'>;
export type Table = TableInstance;
export type GlobalSearchResult = {
    datasets: DatasetInstance[];
    tables: TableInstance[];
}

export type MetaCollection = {
  label: string;
  type?: 'date' | 'percentage' | 'tag';
  props?: any;
}
export type Meta<T> = Partial<Record<keyof T, MetaCollection>>;

export type GetCollectionResult<T = {}> = {
  meta: Meta<T>,
  collection: T[]
}

const datasetAPI = {
  getDataset: (params: Record<string, string | number> = {}) => {
    return apiClient.get<GetCollectionResult<Dataset>>(apiEndpoint({
      endpoint: 'GET_DATASET',
      paramsValue: { ...params }
    }), { clearCacheEntry: true });
  },
  getDatasetInfo: (params: Record<string, string | number> = {}) => {
    return apiClient.get<Dataset>(apiEndpoint({
      endpoint: 'GET_DATASET_INFO',
      paramsValue: { ...params }
    }), { clearCacheEntry: true });
  },
  getTablesByDataset: (params: Record<string, string | number> = {}) => {
    return apiClient.get<GetCollectionResult<Table>>(apiEndpoint({
      endpoint: 'GET_TABLES_BY_DATASET',
      paramsValue: { ...params }
    }), { clearCacheEntry: true });
  },
  annotate: (name: string, data: { idDataset: any[]; idTable: any[] }) => {
    return apiClient.post<Table[]>(
      apiEndpoint({
        endpoint: 'PROCESS_START',
        subEndpoint: name
      }),
      data
    );
  },
  globalSearch: (query: string) => {
    return apiClient.get<GlobalSearchResult>(
      apiEndpoint({
        endpoint: 'GLOBAL_SEARCH',
        paramsValue: { query }
      })
    );
  },
  uploadDataset: (formData: FormData) => {
    return apiClient.post(
      apiEndpoint({
        endpoint: 'UPLOAD_DATASET'
      }),
      formData
    );
  },
  deleteDataset: (datasetId: string) => {
    return apiClient.delete(
      apiEndpoint({
        endpoint: 'DELETE_DATASET',
        paramsValue: { datasetId }
      })
    );
  },
  uploadTable: (formData: FormData, datasetId: string) => {
    return apiClient.post(
      apiEndpoint({
        endpoint: 'UPLOAD_TABLE',
        paramsValue: { datasetId }
      }),
      formData
    );
  },
  deleteTable: (params: { datasetId: string; tableId: string }) => {
    return apiClient.delete(
      apiEndpoint({
        endpoint: 'DELETE_TABLE',
        paramsValue: params
      })
    );
  }
};

export default datasetAPI;
