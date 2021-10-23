import { Extender, Reconciliator } from '@store/slices/config/interfaces/config';
import { apiEndpoint } from '../../parseConfig';
import apiClient from './config/config';

interface GetConfigResponse {
  reconciliators: Reconciliator[];
  extenders: Extender[];
}

const configAPI = {
  getConfig: () => apiClient.get<GetConfigResponse>(
    apiEndpoint({
      endpoint: 'GET_SERVICES_CONFIG'
    })
  )
};

export default configAPI;
