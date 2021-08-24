import { RequestEnhancedState } from '@store/enhancers/requests';

// Define a type for the slice state
export interface IConfigState extends RequestEnhancedState {
  servicesConfig: any;
}
