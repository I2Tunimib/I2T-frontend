import { current } from "@reduxjs/toolkit";
import { Payload } from "@store/interfaces/store";
import {
  AddCellMetadataPayload,
  DeleteCellMetadataPayload,
  UpdateCellMetadataPayload,
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

/** What a cell with no candidates says about itself. */
const noAnnotation = () => ({
  annotated: false,
  match: { value: false },
  highestScore: 0,
  lowestScore: 0,
});
import { isMatching, metadataIdCandidates, hasMetadataId } from "../utils/table.metadata-utils";

/**
 * Assign a candidate to a cell, unmatching the other candidates of the cell.
 * `match` defaults to toggling the target candidate.
 */
export const updateCellMetadata: TableReducer<Payload<UpdateCellMetadataPayload>> = (
  state,
  { payload: { metadataId, cellId, match, undoable = true } },
) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  const cell = getCell(state, rowId, colId);
  if (cell.metadata.length === 0) return state;

  return withHistory(state, undoable, (draft) => {
    const draftCell = getCell(draft, rowId, colId);
    const target = draftCell.metadata.find((m) => m.id === metadataId);
    const newMatch = target ? (match !== undefined ? match : !target.match) : false;
    draftCell.metadata.forEach((m) => {
      m.match = m === target ? newMatch : false;
    });
    draftCell.annotationMeta = {
      ...draftCell.annotationMeta,
      annotated: true,
      match: newMatch ? { value: true, reason: "manual" } : { value: false },
    };
    refreshColumns(draft, [colId]);
  });
};

/**
 * Remove candidates from a cell. Any removed item being matched unmatches the
 * cell; when the cell ends up empty it stops being counted as annotated.
 */
export const deleteCellMetadata: TableReducer<Payload<DeleteCellMetadataPayload>> = (
  state,
  { payload: { metadataId, cellId, undoable = true } },
) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  const cell = getCell(state, rowId, colId);
  if (!cell) return state;

  const targetIds = metadataIdCandidates(metadataId);
  return withHistory(state, undoable, (draft) => {
    const draftCell = getCell(draft, rowId, colId);
    const wasMatch = draftCell.metadata.some(
      (item) => item.match && hasMetadataId(item, targetIds),
    );
    draftCell.metadata = draftCell.metadata.filter((item) => !hasMetadataId(item, targetIds));

    if (draftCell.metadata.length === 0) {
      draftCell.annotationMeta = noAnnotation();
    } else if (wasMatch) {
      // the matched candidate is gone; another one may still be matched
      const hasMatch = draftCell.metadata.some((item) => item.match);
      draftCell.annotationMeta = {
        ...draftCell.annotationMeta,
        annotated: true,
        match: hasMatch ? { value: true, reason: "manual" } : { value: false },
      };
    }
    refreshColumns(draft, [colId]);
  });
};

/**
 * Push a candidate onto every cell that shares the source cell's label, and
 * stamp it with the new match value. The backend tracking side effect lives
 * in `table.listeners.ts`.
 */
export const propagateCellMetadata: TableReducer<Payload<AddCellMetadataPayload>> = (
  state,
  { payload: { metadataId, cellId, value, undoable = true } },
) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  // a snapshot: the candidate is copied into other cells of another draft
  const currentMetadata = current(getCell(state, rowId, colId)).metadata.find(
    (m) => m.id === metadataId,
  );
  if (!currentMetadata) return state;

  const newMatch = isMatching(value.match);
  return withHistory(state, undoable, (draft) => {
    const draftCell = getCell(draft, rowId, colId);
    const cellLabel = draftCell.label;
    const rowsIds = draft.entities.rows.allIds;

    rowsIds.forEach((rowId2) => {
      const targetCell = findCell(draft, rowId2, colId);
      if (!targetCell || targetCell.label !== cellLabel) return;
      const existing = targetCell.metadata.find((m) => m.id === metadataId);
      if (existing) {
        existing.match = newMatch;
      } else {
        targetCell.metadata.push({
          ...currentMetadata,
          id: `${currentMetadata.id}`,
          match: newMatch,
        });
      }
      if (newMatch) {
        targetCell.metadata.forEach((m) => {
          if (m.id !== metadataId) m.match = false;
        });
      }
      targetCell.annotationMeta = {
        ...targetCell.annotationMeta,
        annotated: true,
        match: { value: newMatch, reason: "manual" },
      };
    });

    refreshColumns(draft, [colId]);
  });
};

/**
 * Remove candidates from every cell that shares the source cell's label.
 * Ignores a missing cell instead of throwing.
 */
export const propagateCellDeleteMetadata: TableReducer<
  Payload<{ metadataIds: string[]; cellId: string; undoable?: boolean }>
> = (
  state,
  { payload: { metadataIds, cellId, undoable = true } },
) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  const cell = findCell(state, rowId, colId);
  if (!cell) return state;
  const cellLabel = cell.label;
  const targetIds = metadataIds.flatMap(metadataIdCandidates);

  return withHistory(state, undoable, (draft) => {
    const rowsIds = draft.entities.rows.allIds;
    rowsIds.forEach((rowId2) => {
      const targetCell = findCell(draft, rowId2, colId);
      if (!targetCell || targetCell.label !== cellLabel) return;
      targetCell.metadata = targetCell.metadata.filter(
        (item) => !hasMetadataId(item, targetIds),
      );
      if (targetCell.metadata.length === 0) {
        targetCell.annotationMeta = noAnnotation();
      } else {
        const hasMatch = targetCell.metadata.some((item) => item.match);
        targetCell.annotationMeta = {
          ...targetCell.annotationMeta,
          annotated: true,
          match: hasMatch ? { value: true, reason: "manual" } : { value: false },
        };
      }
    });
    refreshColumns(draft, [colId]);
  });
};

/**
 * Add a candidate to a cell. Replaces an existing candidate with the same id,
 * otherwise appends it. When it matches, the other candidates are unmatched.
 */
export const addCellMetadata: TableReducer<Payload<AddCellMetadataPayload>> = (
  state,
  { payload: { cellId, prefix, value, undoable = true } },
) => {
  const [rowId, colId] = getIdsFromCell(cellId);
  const cell = getCell(state, rowId, colId);
  if (!cell) return state;

  return withHistory(state, undoable, (draft) => {
    const draftCell = getCell(draft, rowId, colId);
    const { id, match, name, uri, ...rest } = value;
    const matching = isMatching(match);
    const existingMetadata = draftCell.metadata.findIndex((m) => m.id === id);

    if (existingMetadata !== -1) {
      draftCell.metadata[existingMetadata] = {
        ...draftCell.metadata[existingMetadata],
        match: matching,
        name: { value: name, uri },
      };
    } else {
      if (matching) {
        draftCell.metadata = draftCell.metadata.map((item) => ({
          ...item,
          match: false,
        }));
      }
      const annotationMetaMatching = draftCell.annotationMeta.match;
      if (!annotationMetaMatching.value && matching) {
        draftCell.annotationMeta = {
          ...draftCell.annotationMeta,
          match: { value: true, reason: "manual" },
        };
      }
      const newMeta = {
        id,
        match: matching,
        name: { value: name, uri },
        ...rest,
      };
      draftCell.metadata.push(newMeta);
      draftCell.annotationMeta = { ...draftCell.annotationMeta, annotated: true };
    }
    refreshColumns(draft, [colId]);
  });
};
