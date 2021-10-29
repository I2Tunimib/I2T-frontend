import { createSliceWithRequests } from '@store/enhancers/requests';
import merge from 'lodash/merge';
import { getConfig } from './config.thunk';
import { IConfigState } from './interfaces/config';
import config from '../../../config.yaml';
import configOverrides from '../../../config-overrides.yaml';

// Define the initial state using that type
const initialState: IConfigState = {
  app: merge(config, configOverrides),
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
        state.entities.extenders.allIds.push(extender.id);
      });
    })
  )
});

export default configSlice.reducer;
