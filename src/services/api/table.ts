import { ID } from '@store/interfaces/store';
import { Column, Row, TableInstance } from '@store/slices/table/interfaces/table';
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
      }),
      { clearCacheEntry: true }
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
  automaticAnnotation: (params: Record<string, string | number> = {}, data: any) => {
    return apiClient.post<any>(
      apiEndpoint({
        endpoint: 'AUTOMATIC_ANNOTATION',
        paramsValue: { ...params }
      }),
      data
    );
  },
  reconcile: (baseUrl: string, data: any) => apiClient.post(`/reconciliators${baseUrl}`, data),
  extend: (baseUrl: string, data: any) => apiClient.post(`extenders${baseUrl}`, data),
  getChallengeDatasets: () => apiClient.get<ChallengeTableDataset[]>('/tables/challenge/datasets'),
  getChallengeTable: (datasetName: string, tableName: string) => apiClient.get(`/tables/challenge/datasets/${datasetName}/tables/${tableName}`)
};

export default tableAPI;
