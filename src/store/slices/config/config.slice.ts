import { createSliceWithRequests } from '@store/enhancers/requests';
import { nanoid } from 'nanoid';
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
      console.log(action.payload);
      const { reconciliators, extenders } = action.payload;

      reconciliators.forEach((reconciliator) => {
        const id = nanoid();
        state.entities.reconciliators.byId[id] = {
          id,
          ...reconciliator
        };
        state.entities.reconciliators.allIds.push(id);
      });

      extenders.forEach((extender) => {
        const id = nanoid();
        state.entities.extenders.byId[id] = {
          id,
          ...extender
        };
        state.entities.extenders.allIds.push(id);
      });
    })
  )
});

export default configSlice.reducer;
