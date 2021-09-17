import { RequestEnhancedState } from '@store/enhancers/requests';
import { BaseState, ID } from '@store/interfaces/store';

// Define a type for the slice state
export interface IConfigState extends RequestEnhancedState {
  entities: {
    reconciliators: ReconciliatorsState;
    extenders: ExtendersState;
  }
}

export interface ReconciliatorsState extends BaseState<Reconciliator & { id: ID }> {}
export interface ExtendersState extends BaseState<Extender & { id: ID }> {}

export interface Reconciliator {
  name: string;
  relativeUrl: string;
  metaToViz: string[];
  entityPageUrl?: string;
}

export interface Extender extends Record<string, any> {
  // ...
}
