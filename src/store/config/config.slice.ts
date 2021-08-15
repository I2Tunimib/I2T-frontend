import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@store';

// Define a type for the slice state
interface IConfigState {
    servicesConfig: any;
}

// Define the initial state using that type
const initialState: IConfigState = {
  servicesConfig: {}
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, { payload }: PayloadAction<Partial<IConfigState>>) => (
      { ...state, ...payload }
    )
  }
});

export const { setConfig } = configSlice.actions;

// select slice state
export const selectConfig = (state: RootState) => state.config;

/**
 * Selector which return the configuration for all services
 */
export const selectServicesConfig = createSelector(
  selectConfig,
  ({ servicesConfig }) => servicesConfig
);

export default configSlice.reducer;
