import { RequestEnhancedState } from '@store/enhancers/requests';
import { BaseState, ID } from '@store/interfaces/store';

// Define a type for the slice state
export interface IConfigState extends RequestEnhancedState {
  entities: {
    reconciliators: ReconciliatorsState;
    extenders: ExtendersState;
  }
}

export interface ReconciliatorsState extends BaseState<Reconciliator> {}
export interface ExtendersState extends BaseState<Extender> {}

export interface Reconciliator {
  id: ID;
  name: string;
  prefix: string;
  uri: string;
  relativeUrl: string;
  metaToViz: string[];
}

export interface Extender extends Record<string, any> {
  id: ID;
  // ...
}
