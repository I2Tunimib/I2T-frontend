import { IRequestState } from '@store/requests/interfaces/requests';

// Define a type for the slice state
export interface IConfigState extends IRequestState {
  servicesConfig: any;
}
