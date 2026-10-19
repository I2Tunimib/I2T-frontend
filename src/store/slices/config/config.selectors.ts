import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { createRequestStatusSelector } from "@store/slices/requests/requests.selectors";
import { getConfig } from "./config.thunk";

// select slice state
export const selectConfig = (state: RootState) => state.config.entities;
// select reconciliators
export const selectReconciliators = (state: RootState) =>
  state.config.entities.reconciliators;
// select extenders
export const selectExtenders = (state: RootState) =>
  state.config.entities.extenders;
// select modifiers
export const selectModifiers = (state: RootState) =>
  state.config.entities.modifiers;
// select compliance services
export const selectComplianceServices = (state: RootState) =>
  state.config.entities.complianceServices;
export const selectStoreConfig = (state: RootState) => state.config;

export const selectAnnotationQuickViewUrl = createSelector(
  selectStoreConfig,
  (storeConfig) => storeConfig.annotationQuickViewUrl
);

export const selectReconciliatorsAsObject = createSelector(
  selectReconciliators,
  (reconciliators) => reconciliators.byId
);

export const selectReconciliatorsAsArray = createSelector(
  selectReconciliators,
  (reconciliators) => reconciliators.allIds.map((id) => reconciliators.byId[id])
);

export const selectExtendersAsObject = createSelector(
  selectExtenders,
  (extenders) => extenders.byId
);

export const selectExtendersAsArray = createSelector(
  selectExtenders,
  (extenders) =>
    extenders.allIds
      .map((id) => extenders.byId[id])
      .sort((a, b) => a.name.localeCompare(b.name))
);

export const selectModifiersAsObject = createSelector(
  selectModifiers,
  (modifiers) => modifiers.byId
);

export const selectModifiersAsArray = createSelector(
  selectModifiers,
  (modifiers) =>
    modifiers.allIds
      .map((id) => modifiers.byId[id])
      .sort((a, b) => a.name.localeCompare(b.name))
);

export const selectComplianceAsArray = createSelector(
  selectComplianceServices,
  (complianceServices) =>
    complianceServices.allIds
      .map((id) => complianceServices.byId[id])
);
// Loading selectors
export const selectGetConfigRequest = createRequestStatusSelector(getConfig);
