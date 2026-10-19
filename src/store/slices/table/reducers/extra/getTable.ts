import { Draft } from "@reduxjs/toolkit";
import { GetTableResponse } from "@services/api/table";
import { Payload } from "@store/interfaces/store";
import { TableState } from "../../interfaces/table";
import { TableReducer } from "../types";
import { setTableEntities } from "../table";
import { refreshAllColumns, refreshScoreBoundaries } from "../../utils/table.reconciliation-utils";

type State = Draft<TableState>;

export const getTableFulfilled: TableReducer<Payload<GetTableResponse>> = (
  state,
  action,
) => {
  const { table, columns, rows, columnOrder } = action.payload;
  state.ui.lastSaved = table.lastModifiedDate;
  setTableEntities(state, { table, columns, rows, columnOrder });
  if (state.ui.settings.scoreLowerBound === 0) {
    state.ui.settings.scoreLowerBound = 0.35;
  }
  refreshAllColumns(state);
  refreshScoreBoundaries(state);
};
