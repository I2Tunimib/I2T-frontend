import { Extender, Reconciliator } from '@store/slices/config/interfaces/config';
import apiClient from './config/config';

interface GetConfigResponse {
  reconciliators: Reconciliator[];
  extenders: Extender[];
}

const configAPI = {
  getConfig: () => apiClient.get<GetConfigResponse>('/config')
};

export default configAPI;
