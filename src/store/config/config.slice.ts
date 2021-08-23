import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { createSliceWithRequests, getRequestStatus } from '@store/enhancers/requests';
import { ConfigEndpoints, getConfig } from './config.thunk';
import { IConfigState } from './interfaces/config';

// Define the initial state using that type
const initialState: IConfigState = {
  servicesConfig: {},
  _requests: { byId: {}, allIds: [] }
};

export const configSlice = createSliceWithRequests({
  name: 'config',
  initialState,
  reducers: {},
  extraRules: (builder) => (
    builder.addCase(getConfig.fulfilled, (state, action) => {
      state.servicesConfig = action.payload;
    })
  )
});

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
export const selectGetConfigRequest = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, ConfigEndpoints.GET_CONFIG)
);

export default configSlice.reducer;
