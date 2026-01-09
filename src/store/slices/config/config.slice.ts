import { createSliceWithRequests } from "@store/enhancers/requests";
import CONFIG from "../../../config";
import { getConfig } from "./config.thunk";
import { IConfigState } from "./interfaces/config";

// Define the initial state using that type
const initialState: IConfigState = {
  app: CONFIG,
  entities: {
    reconciliators: { byId: {}, allIds: [] },
    extenders: { byId: {}, allIds: [] },
    modifiers: { byId: {}, allIds: [] },
  },
  _requests: { byId: {}, allIds: [] },
};

export const configSlice = createSliceWithRequests({
  name: "config",
  initialState,
  reducers: {},
  extraRules: (builder) =>
    builder.addCase(getConfig.fulfilled, (state, action) => {
      console.log("Config slice - received payload:", action.payload);
      console.log(
        "Config slice - payload keys:",
        action.payload ? Object.keys(action.payload) : "no payload",
      );

      // Handle different possible response structures
      const payload = (action.payload as any) || {};

      // Try to find reconciliators data - could be under different keys
      const reconciliators =
        payload.reconciliators || payload.reconcilers || payload.services || [];
      const extenders = payload.extenders || payload.extensions || [];
      const modifiers = payload.modifiers || payload.extensions || [];

      console.log("Config slice - found data:", {
        reconciliators: {
          type: typeof reconciliators,
          isArray: Array.isArray(reconciliators),
          length: reconciliators?.length,
        },
        extenders: {
          type: typeof extenders,
          isArray: Array.isArray(extenders),
          length: extenders?.length,
        },
        modifiers: {
          type: typeof modifiers,
          isArray: Array.isArray(modifiers),
          length: modifiers?.length,
        },
      });

      // Process reconciliators if they exist and are an array
      if (Array.isArray(reconciliators)) {
        reconciliators.forEach((reconciliator, i) => {
          //state.entities.reconciliators.byId[reconciliator.id] = reconciliator;
          //state.entities.reconciliators.allIds.push(reconciliator.id);
          state.entities.reconciliators.byId[reconciliator.id] = reconciliator;
          state.entities.reconciliators.allIds.push(reconciliator.id);
        });
      } else {
        console.warn("Config slice - reconciliators not found or not an array");
      }

      // Process extenders if they exist and are an array
      if (Array.isArray(extenders)) {
        extenders.forEach((extender) => {
          state.entities.extenders.byId[extender.id] = extender;
          state.entities.extenders.allIds.push(extender.id);
        });
      } else {
        console.warn("Config slice - extenders not found or not an array");
      }

      // Process modifiers if they exist and are an array
      if (Array.isArray(modifiers)) {
        modifiers.forEach((modifier) => {
          state.entities.modifiers.byId[modifier.id] = modifier;
          state.entities.modifiers.allIds.push(modifier.id);
        });
      } else {
        console.warn("Config slice - modifiers not found or not an array");
      }
    }),
});

export default configSlice.reducer;
