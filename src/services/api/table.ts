import { ID } from '@store/interfaces/store';
import { Column, Row } from '@store/slices/table/interfaces/table';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { CancelToken } from 'axios';
import { apiEndpoint } from '../../parseConfig';
import apiClient from './config/config';

export interface GetTableResponse {
  table: TableInstance;
  columns: Record<ID, Column>;
  rows: Record<ID, Row>;
}

export interface ChallengeTableDataset {
  name: string;
  tables: {
    fileName: string;
    format: string;
    ctime: Date;
    size: number;
  }[],
  annotations: string[];
}

const tableAPI = {
  getTable: (params: Record<string, string | number> = {}) => {
    return apiClient.get<GetTableResponse>(
      apiEndpoint({
        endpoint: 'GET_TABLE',
        paramsValue: { ...params }
      })
    );
  },
  exportTable: (datasetId: string, tableId: string, subEndpoint = '') => {
    return apiClient.post<any>(
      apiEndpoint({
        endpoint: 'EXPORT',
        subEndpoint
      }),
      { datasetId, tableId }
    );
  },
  saveTable: (data: any) => {
    return apiClient.post<any>(
      apiEndpoint({
        endpoint: 'SAVE'
      }),
      data
    );
  },
  // getTable: (id: ID, acceptHeader?: string) => apiClient.get<GetTableResponse>(`/tables/${id}`, {
  //   headers: {
  //     Accept: acceptHeader
  //   }
  // }),
  getTables: (type: string) => apiClient.get(`/tables?type=${type}`),
  searchTables: (query: string) => apiClient.get(`/tables?search=${query}`),
  uploadTable: (
    formData: FormData,
    cancelToken: CancelToken,
    onProgress: (progress: number) => void,
  ) => apiClient.post('/tables', formData, {
    headers: {
      'content-type': 'multipart/form-data'
    },
    cancelToken,
    onUploadProgress: (progressEvent) => {
      onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
    }
  }),
  // saveTable: (data: any) => apiClient.post<TableInstance>('/tables/save', data),
  importTable: (formData: FormData) => apiClient.post('/tables/import', formData),
  getChallengeDatasets: () => apiClient.get<ChallengeTableDataset[]>('/tables/challenge/datasets'),
  getChallengeTable: (datasetName: string, tableName: string) => apiClient.get(`/tables/challenge/datasets/${datasetName}/tables/${tableName}`),
  copyTable: (name: string) => apiClient.post('/tables/copy', { name }),
  removeTable: (id: ID) => apiClient.delete(`tables/${id}`),
  reconcile: (baseUrl: string, data: any) => apiClient.post(`/reconciliators${baseUrl}`, data)
};

export default tableAPI;
