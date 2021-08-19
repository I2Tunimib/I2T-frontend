import apiClient from './config/config';

const tableAPI = {
  getTableNames: (dataSource: string) => apiClient.get(`/${dataSource}`),
  getTable: (dataSource: string, name: string) => apiClient.get(`/${dataSource}/${name}`),
  reconcile: (baseUrl: string, data: any) => apiClient.post(baseUrl, data)
};

export default tableAPI;
