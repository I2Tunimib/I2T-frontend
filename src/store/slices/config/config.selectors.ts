import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { ConfigEndpoints } from './config.thunk';

// select slice state
export const selectConfig = (state: RootState) => state.config;
// select requests
export const selectRequests = (state: RootState) => state.config._requests;

/**
 * Selector which return the configuration for all services
 */
export const selectServicesConfig = createSelector(
  selectConfig,
  (config) => config.servicesConfig
);

// Loading selectors
export const selectGetConfigRequest = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, ConfigEndpoints.GET_CONFIG)
);
