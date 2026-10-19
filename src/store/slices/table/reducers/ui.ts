import { Payload } from "@store/interfaces/store";
import {
  BBox,
  DependencyGraph,
  UpdateCellEditablePayload,
  UpdateColumnEditablePayload,
  TableUIState,
} from "../interfaces/table";
import { toggleObject } from "../utils/table.utils";
import { initialState } from "./initial-state";
import { TableReducer } from "./types";

export const restoreInitialState: TableReducer = () => ({ ...initialState });

export const clearDeletedColumns: TableReducer = (state) => {
  state.ui.deletedColumnsIds = {};
};

/**
 * Merge parameters of the UI into the current state.
 * Settings are merged one level deeper, so a few can be changed at once.
 */
export const updateUI: TableReducer<Payload<Partial<TableUIState>>> = (
  state,
  { payload },
) => {
  const { undoable, ...rest } = payload;
  state.ui = {
    ...state.ui,
    ...rest,
    ...(rest.settings && { settings: { ...state.ui.settings, ...rest.settings } }),
  };
};

export const setHelpStart: TableReducer<boolean | "tutorial" | "rec" | "ext"> = (
  state,
  { payload },
) => {
  state.ui.helpStart = payload;
};

export const setGraphTutorialStart: TableReducer<boolean | "tutorial"> = (
  state,
  { payload },
) => {
  state.ui.graphTutorialStart = payload;
};

export const addTutorialBox: TableReducer<{ id: string; bbox: BBox }> = (
  state,
  { payload: { id, bbox } },
) => {
  state.ui.tutorialBBoxes[id] = bbox;
};

export const updateColumnVisibility: TableReducer<{
  id: string;
  isVisible: boolean;
}> = (state, { payload: { id, isVisible } }) => {
  state.ui.columnVisibility[id] = isVisible;
};

export const updateDependencies: TableReducer<DependencyGraph | null> = (
  state,
  { payload },
) => {
  state.dependencies = payload;
};

export const updateColumnEditable: TableReducer<
  Payload<UpdateColumnEditablePayload>
> = (state, { payload: { colId } }) => {
  state.ui.editableCellsIds = toggleObject(state.ui.editableCellsIds, colId, true);
};

export const updateCellEditable: TableReducer<
  Payload<UpdateCellEditablePayload>
> = (state, { payload: { cellId } }) => {
  state.ui.editableCellsIds = toggleObject(state.ui.editableCellsIds, cellId, true);
};

/** Expand the columns of the selection, or collapse them if they are expanded. */
export const updateSelectedCellExpanded: TableReducer<Payload> = (state) => {
  const { selectedCellIds, selectedColumnsIds, selectedColumnCellsIds } = state.ui;
  const columnIds = new Set([
    ...Object.keys(selectedCellIds).map((cellId) => cellId.split("$")[1]),
    ...Object.keys(selectedColumnsIds),
    ...Object.keys(selectedColumnCellsIds),
  ]);
  columnIds.forEach((colId) => {
    state.ui.expandedColumnsIds = toggleObject(
      state.ui.expandedColumnsIds,
      colId,
      true,
    );
  });
  state.ui.expandRevision += 1;
};
