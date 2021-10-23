import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { ConfigEndpoints } from './config.thunk';

// select slice state
export const selectConfig = (state: RootState) => state.config.entities;
// select reconciliators
export const selectReconciliators = (state: RootState) => state.config.entities.reconciliators;
// select requests
export const selectRequests = (state: RootState) => state.config._requests;
export const selectStoreConfig = (state: RootState) => state.config;

/**
 * Selector which return the configuration for all services
 */
// export const selectServicesConfig = createSelector(
//   selectConfig,
//   (config) => config.servicesConfig
// );

export const selectAppConfig = createSelector(
  selectStoreConfig,
  (storeConfig) => storeConfig.app
);

export const selectAppConfigExportFormats = createSelector(
  selectStoreConfig,
  (storeConfig) => storeConfig.app.API.ENDPOINTS.EXPORT
);

export const selectReconciliatorsAsObject = createSelector(
  selectReconciliators,
  (reconciliators) => reconciliators.byId
);

export const selectReconciliatorsAsArray = createSelector(
  selectReconciliators,
  (reconciliators) => reconciliators.allIds.map((id) => reconciliators.byId[id])
);

// Loading selectors
export const selectGetConfigRequest = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, ConfigEndpoints.GET_CONFIG)
);
