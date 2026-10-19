import { Draft } from "@reduxjs/toolkit";
import { Payload } from "@store/interfaces/store";
import {
  AutomaticAnnotationPayload,
  TableState,
} from "../../interfaces/table";
import { TableReducer } from "../types";

type State = Draft<TableState>;

export const automaticAnnotationPending: TableReducer<any> = (state, { meta }: any) => {
  if (meta.arg.target === "schema") {
    state.entities.tableInstance.schemaStatus = "PENDING";
  } else {
    state.entities.tableInstance.mantisStatus = "PENDING";
  }
  state.ui.settings.isViewOnly = true;
};

export const automaticAnnotationFulfilled: TableReducer<
  Payload<AutomaticAnnotationPayload>
> = (state, { payload: { datasetId, tableId, mantisStatus, schemaStatus } }) => {
  if (mantisStatus) {
    state.entities.tableInstance.mantisStatus = mantisStatus;
  }
  if (schemaStatus) {
    state.entities.tableInstance.schemaStatus = schemaStatus;
  }
  state.ui.settings.isViewOnly =
    mantisStatus === "PENDING" || schemaStatus === "PENDING";
};

export const saveTableFulfilled: TableReducer<Payload<{ lastModifiedDate: string }>> = (
  state,
  { payload },
) => {
  state.ui.lastSaved = payload.lastModifiedDate;
};

export const tableCompliancePending: TableReducer = (state) => {
  state.entities.tableInstance.complianceStatus = "PENDING";
};

export const tableComplianceFulfilled: TableReducer = (state) => {
  if (state.entities.tableInstance.complianceStatus !== "DONE") {
    state.entities.tableInstance.complianceStatus = "PENDING";
  }
};

export const tableComplianceRejected: TableReducer = (state) => {
  state.entities.tableInstance.complianceStatus = "ERROR";
};

export const getDependenciesFulfilled: TableReducer<Payload<any>> = (
  state,
  { payload },
) => {
  state.dependencies = payload ?? null;
};
