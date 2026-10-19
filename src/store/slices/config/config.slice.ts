import { createSlice } from "@reduxjs/toolkit";
import { normalize } from "@store/utils/normalize";
import { getConfig } from "./config.thunk";
import { IConfigState } from "./interfaces/config";

const initialState: IConfigState = {
  policyEditorUrl: "",
  policyEngineUrl: "",
  annotationQuickViewUrl: "",
  entities: {
    reconciliators: { byId: {}, allIds: [] },
    extenders: { byId: {}, allIds: [] },
    modifiers: { byId: {}, allIds: [] },
    complianceServices: { byId: {}, allIds: [] },
  },
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(getConfig.fulfilled, (state, action) => {
      const {
        reconciliators,
        extenders,
        modifiers,
        complianceServices,
        annotationQuickViewUrl,
        policyEditorUrl,
        policyEngineUrl,
      } = action.payload;
      state.annotationQuickViewUrl = annotationQuickViewUrl;
      state.policyEditorUrl = policyEditorUrl;
      state.policyEngineUrl = policyEngineUrl;
      // replace, never append: fetching the config twice must not duplicate ids
      state.entities = {
        reconciliators: normalize(reconciliators),
        extenders: normalize(extenders),
        modifiers: normalize(modifiers),
        complianceServices: normalize(complianceServices),
      };
    }),
});

export default configSlice.reducer;
