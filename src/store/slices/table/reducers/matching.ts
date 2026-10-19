import { Draft, PayloadAction } from "@reduxjs/toolkit";
import { ID, Payload } from "@store/interfaces/store";
import {
  AutoMatchingPayload,
  RefineMatchingPayload,
  TableState,
} from "../interfaces/table";
import { TableReducer } from "./types";
import { withHistory } from "./history";
import {
  getCell,
  findCell,
  getColumn,
  getIdsFromCell,
} from "../utils/table.utils";
import { refreshColumns } from "../utils/table.reconciliation-utils";
import { pickBestCandidate } from "../utils/table.metadata-utils";

type State = Draft<TableState>;

/**
 * Match the best candidate at or above the threshold for every selected cell
 * (and the entity candidates of every selected column). Ties go to the first.
 * A cell whose best candidate is already matched is left alone.
 */
export const autoMatching: TableReducer<Payload<AutoMatchingPayload>> = (
  state,
  { payload: { threshold, undoable = true } },
) =>
  withHistory(state, undoable, (draft) => {
    const updatedColumns = new Set<ID>();

    Object.keys(draft.ui.selectedCellIds).forEach((cellId) => {
      const [rowId, colId] = getIdsFromCell(cellId);
      updatedColumns.add(colId);
      matchCellMetadata(draft, rowId, colId, threshold);
    });

    Object.keys(draft.ui.selectedColumnsIds).forEach((colId) => {
      updatedColumns.add(colId);
      matchColumnEntities(draft, colId, threshold);
    });

    updatedColumns.forEach((colId) => refreshColumns(draft, [colId]));
  });

/**
 * Apply the refinement of one cell: either choose a candidate (the match moves
 * to it) or unmatch every candidate.
 */
export const refineMatching: TableReducer<Payload<RefineMatchingPayload>> = (
  state,
  { payload: { changes, undoable = true } },
) =>
  withHistory(state, undoable, (draft) => {
    const updatedColumns = new Set<ID>();

    changes.forEach((change) => {
      const [rowId, colId] = getIdsFromCell(change.cellId);
      updatedColumns.add(colId);
      const cell = findCell(draft, rowId, colId);
      if (!cell) return;

      if (change.metaItemId) {
        cell.metadata.forEach((metaItem) => {
          metaItem.match = metaItem.id === change.metaItemId;
        });
        cell.annotationMeta = {
          ...cell.annotationMeta,
          annotated: true,
          match: { value: true, reason: "refinement" },
        };
      } else {
        cell.metadata.forEach((metaItem) => {
          metaItem.match = false;
        });
        cell.annotationMeta = {
          ...cell.annotationMeta,
          match: { value: false },
        };
      }
    });

    updatedColumns.forEach((colId) => refreshColumns(draft, [colId]));
  });

function matchCellMetadata(draft: State, rowId: ID, colId: ID, threshold: number) {
  const cell = findCell(draft, rowId, colId);
  if (!cell) return;
  const best = pickBestCandidate(cell.metadata, threshold);
  if (best === -1) {
    if (cell.annotationMeta.match.value) {
      cell.metadata.forEach((m) => (m.match = false));
      cell.annotationMeta = {
        ...cell.annotationMeta,
        match: { value: false },
      };
    }
    return;
  }
  const bestItem = cell.metadata[best];
  if (bestItem.match) return; // already matched: leave it alone
  cell.metadata.forEach((m, i) => {
    m.match = i === best;
  });
  cell.annotationMeta = {
    ...cell.annotationMeta,
    annotated: true,
    match: { value: true, reason: "refinement" },
  };
}

function matchColumnEntities(draft: State, colId: ID, threshold: number) {
  const column = getColumn(draft, colId);
  const entities = column.metadata?.[0]?.entity;
  if (!entities?.length) return;
  const best = pickBestCandidate(entities, threshold);
  if (best === -1) {
    if (column.annotationMeta?.match?.value) {
      entities.forEach((m) => {
        m.match = false;
      });
      column.annotationMeta = { ...column.annotationMeta, match: { value: false } };
    }
    return;
  }
  const bestItem = entities[best];
  if (bestItem.match) return;
  entities.forEach((m, i) => {
    m.match = i === best;
  });
  column.annotationMeta = {
    ...column.annotationMeta,
    annotated: true,
    match: { value: true, reason: "refinement" },
  };
}
