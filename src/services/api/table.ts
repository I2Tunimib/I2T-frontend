import { CsvSeparator } from '@services/converters/csv-converter';
import { FileFormat, TableType } from '@store/slices/table/interfaces/table';
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
  getTable: (name: string) => apiClient.get<GetTableResponse>(`/tables/${name}`),
  reconcile: (baseUrl: string, data: any) => apiClient.post(baseUrl, data)
};

export default tableAPI;
