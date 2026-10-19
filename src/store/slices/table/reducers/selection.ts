import { Payload } from "@store/interfaces/store";
import {
  UpdateSelectedCellsPayload,
  UpdateSelectedColumnPayload,
  UpdateSelectedRowPayload,
} from "../interfaces/table";
import {
  selectOneCell,
  selectOneColumn,
  selectOneColumnCell,
  selectOneRow,
  toggleCellSelection,
  toggleColumnCellsSelection,
  toggleColumnSelection,
  toggleRowSelection,
} from "../utils/table.selection-utils";
import { TableReducer } from "./types";

// With `multi` the id is added to / removed from the selection, otherwise the
// selection is replaced by it.

export const updateColumnSelection: TableReducer<UpdateSelectedColumnPayload> = (
  state,
  { payload: { id, multi } },
) => (multi ? toggleColumnSelection(state, id) : selectOneColumn(state, id));

export const updateColumnCellsSelection: TableReducer<
  UpdateSelectedColumnPayload
> = (state, { payload: { id, multi } }) =>
  multi ? toggleColumnCellsSelection(state, id) : selectOneColumnCell(state, id);

export const updateCellSelection: TableReducer<Payload<UpdateSelectedCellsPayload>> = (
  state,
  { payload: { id, multi } },
) => (multi ? toggleCellSelection(state, id) : selectOneCell(state, id));

export const updateRowSelection: TableReducer<Payload<UpdateSelectedRowPayload>> = (
  state,
  { payload: { id, multi } },
) => (multi ? toggleRowSelection(state, id) : selectOneRow(state, id));
