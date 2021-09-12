import { CsvSeparator } from '@services/converters/csv-converter';
import { FileFormat, TableType } from '@store/slices/table/interfaces/table';
import { CancelToken } from 'axios';
import apiClient from './config/config';

interface GetTableResponse {
  data: string;
  name: string;
  format: FileFormat;
  type: TableType;
  separator?: CsvSeparator;
}

const tableAPI = {
  getTableNames: (dataSource: string) => apiClient.get(`/${dataSource}`),
  getTables: (type: string) => apiClient.get(`/tables?type=${type}`),
  searchTables: (query: string) => apiClient.get(`/tables?search=${query}`),
  getTable: (name: string, acceptHeader?: string) => apiClient.get<GetTableResponse>(`/tables/${name}`, {
    headers: {
      Accept: acceptHeader
    }
  }),
  uploadTable: (
    formData: FormData,
    cancelToken: CancelToken,
    onProgress: (progress: number) => void,
  ) => apiClient.post('/tables/upload', formData, {
    headers: {
      'content-type': 'multipart/form-data'
    },
    cancelToken,
    onUploadProgress: (progressEvent) => {
      onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
    }
  }),
  copyTable: (name: string) => apiClient.post('/tables/copy', { name }),
  removeTable: (name: string) => apiClient.delete(`tables/${name}`),
  reconcile: (baseUrl: string, data: any) => apiClient.post(baseUrl, data)
};

export default tableAPI;
