import apiClient from './config/config';

const configAPI = {
  getConfig: () => apiClient.get('/config')
};

export default configAPI;
