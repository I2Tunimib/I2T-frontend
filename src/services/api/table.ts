import apiClient from './config/config';

const tableAPI = {
  getTableNames: (dataSource: string) => apiClient.get(`/${dataSource}`),
  getTables: (type: string) => apiClient.get(`/tables?type=${type}`),
  getTable: (dataSource: string, name: string) => apiClient.get(`/${dataSource}/${name}`),
  reconcile: (baseUrl: string, data: any) => apiClient.post(baseUrl, data)
};

export default tableAPI;
