import { IFetchParams } from 'hooks/fetch/fetch';

/**
 * Get table names
 */
export interface IConfigResponse {
  data: any;
}
export const servicesConfigEndpoint = (): IFetchParams => ({
  method: 'GET',
  url: '/config'
});
