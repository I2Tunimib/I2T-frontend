import { createSliceWithRequests } from '@store/enhancers/requests';
import { getConfig } from './config.thunk';
import { IConfigState } from './interfaces/config';

// Define the initial state using that type
const initialState: IConfigState = {
  entities: {
    reconciliators: { byId: {}, allIds: [] },
    extenders: { byId: {}, allIds: [] }
  },
  _requests: { byId: {}, allIds: [] }
};

export const configSlice = createSliceWithRequests({
  name: 'config',
  initialState,
  reducers: {},
  extraRules: (builder) => (
    builder.addCase(getConfig.fulfilled, (state, action) => {
      const { reconciliators, extenders } = action.payload;

      reconciliators.forEach((reconciliator) => {
        state.entities.reconciliators.byId[reconciliator.prefix] = reconciliator;
        state.entities.reconciliators.allIds.push(reconciliator.prefix);
      });

      extenders.forEach((extender) => {
        state.entities.extenders.byId[extender.id] = extender;
      });
    })
  )
});

export default configSlice.reducer;
