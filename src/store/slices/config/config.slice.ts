import { createSliceWithRequests } from '@store/enhancers/requests';
import { getConfig } from './config.thunk';
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

export default configSlice.reducer;
