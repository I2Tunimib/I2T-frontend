import { ID } from '@store/interfaces/store';
import { Column, Row } from '@store/slices/table/interfaces/table';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { CancelToken } from 'axios';
import { apiEndpoint } from '../../configHelpers';
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
  exportTable: (
    format: string,
    params: Record<string, string | number> = {}
  ) => {
    return apiClient.get<any>(
      apiEndpoint({
        endpoint: 'EXPORT',
        subEndpoint: format,
        paramsValue: params
      })
    );
  },
  saveTable: (data: any, params: Record<string, string | number> = {}) => {
    return apiClient.put<any>(
      apiEndpoint({
        endpoint: 'SAVE',
        paramsValue: { ...params }
      }),
      data
    );
  },
  reconcile: (baseUrl: string, data: any) => apiClient.post(`/reconciliators${baseUrl}`, data),
  extend: (baseUrl: string, data: any) => apiClient.post(`extenders${baseUrl}`, data),
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
  importTable: (formData: FormData) => apiClient.post('/tables/import', formData),
  getChallengeDatasets: () => apiClient.get<ChallengeTableDataset[]>('/tables/challenge/datasets'),
  getChallengeTable: (datasetName: string, tableName: string) => apiClient.get(`/tables/challenge/datasets/${datasetName}/tables/${tableName}`),
  copyTable: (name: string) => apiClient.post('/tables/copy', { name }),
  removeTable: (id: ID) => apiClient.delete(`tables/${id}`)
};

export default tableAPI;
