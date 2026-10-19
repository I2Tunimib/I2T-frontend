import { Draft } from "@reduxjs/toolkit";
import { KG_INFO } from "@services/utils/kg-info";
import { ID } from "@store/interfaces/store";
import {
  BaseMetadata,
  Cell,
  Column,
  ColumnStatus,
  TableState,
} from "../interfaces/table";
import { getColumn, getContextPrefix } from "./table.utils";

type State = Draft<TableState>;

// WHAT A CELL OR A COLUMN SAYS ABOUT ITSELF

/** A cell is reconciliated when one of its candidates is matched. */
export const isCellReconciliated = ({ metadata }: Cell) =>
  metadata.some((item) => item.match);

/** The context of a cell: the prefix of its first candidate ("" if none). */
export const getCellContext = (cell: Cell) =>
  cell.metadata.length > 0 ? getContextPrefix(cell.metadata[0]) : "";

/** Min and max score of a list of candidates. */
export const getMinMaxScore = (metadata: BaseMetadata[]) => {
  const scores = metadata.map(({ score = 0 }) => score);
  return { min: Math.min(...scores), max: Math.max(...scores) };
};

const noMatch = () => ({
  match: { value: false },
  highestScore: 0,
  lowestScore: 0,
});

/**
 * What a list of candidates says: whether one is matched, and the scores range.
 * A matched candidate was matched by the reconciliator.
 */
export const summarizeMatches = (items: BaseMetadata[]) => {
  const scores = items
    .map(({ score }) => score)
    .filter((score) => typeof score === "number");
  return {
    match: items.some(({ match }) => match)
      ? { value: true, reason: "reconciliator" as const }
      : { value: false },
    lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
  };
};

export const computeCellAnnotationStats = (cell: Cell) =>
  cell.metadata.length > 0 ? summarizeMatches(cell.metadata) : noMatch();

export const computeColumnAnnotationStats = (column: Column) => {
  const entities = column.metadata[0]?.entity;
  return entities && entities.length > 0
    ? summarizeMatches(entities)
    : noMatch();
};

// DERIVED DATA
//
// The counters of a column (its contexts), its status and the totals of the
// table are all worked out from the cells. They are stored because the table
// is saved as it is, so every change that touches cells calls refreshColumns
// once, instead of each change adjusting the counters by hand.

const getCellOf = (state: State, rowId: ID, colId: ID): Cell | undefined =>
  state.entities.rows.byId[rowId]?.cells?.[colId];

/**
 * A column is fully annotated when every row has a matched cell, whether it
 * was matched by a reconciliator or by hand.
 */
const isColumnFullyAnnotated = (state: State, colId: ID) =>
  state.entities.rows.allIds.every(
    (rowId) => getCellOf(state, rowId, colId)?.annotationMeta?.match?.value,
  );

/** A column is partially annotated when any cell has candidates. */
const isColumnPartiallyAnnotated = (state: State, colId: ID) =>
  state.entities.rows.allIds.some((rowId) => {
    const cell = getCellOf(state, rowId, colId);
    return (
      !!cell &&
      (cell.metadata.length > 0 || !!cell.annotationMeta?.annotated)
    );
  });

const countReconciliated = (column: Column) =>
  Object.values(column.context).reduce(
    (acc, { reconciliated }) => acc + (reconciliated || 0),
    0,
  );

export const getColumnStatus = (state: State, colId: ID) => {
  const column = getColumn(state, colId);
  // nothing to reconcile in a table without rows
  if (state.entities.rows.allIds.length === 0) {
    return ColumnStatus.EMPTY;
  }
  if (
    countReconciliated(column) === state.entities.rows.allIds.length ||
    isColumnFullyAnnotated(state, colId)
  ) {
    return ColumnStatus.RECONCILIATED;
  }
  if (isColumnPartiallyAnnotated(state, colId)) {
    return ColumnStatus.PENDING;
  }
  return ColumnStatus.EMPTY;
};

export const createContext = ({
  uri = "",
  total = 0,
  reconciliated = 0,
}: Partial<{ uri: string; total: number; reconciliated: number }>) => ({
  uri,
  total,
  reconciliated,
});

/**
 * Count the cells of a column per context (the prefix of their candidates):
 * `total` cells have candidates, `reconciliated` of them have a match.
 * Contexts keep their uri, and contexts without cells are kept at zero: they
 * are also created by the column's own metadata.
 */
const refreshColumnContext = (state: State, colId: ID) => {
  const column = getColumn(state, colId);
  column.context ??= {};

  const counts: Record<string, { total: number; reconciliated: number }> = {};
  state.entities.rows.allIds.forEach((rowId) => {
    const cell = getCellOf(state, rowId, colId);
    const prefix = cell && getCellContext(cell);
    if (!cell || !prefix) return;
    counts[prefix] ??= { total: 0, reconciliated: 0 };
    counts[prefix].total += 1;
    if (isCellReconciliated(cell)) counts[prefix].reconciliated += 1;
  });

  Object.keys({ ...column.context, ...counts }).forEach((prefix) => {
    const known = column.context[prefix];
    column.context[prefix] = {
      uri: (known && known.uri) ?? KG_INFO[prefix]?.uri ?? "",
      total: counts[prefix]?.total ?? 0,
      reconciliated: counts[prefix]?.reconciliated ?? 0,
    };
  });
};

/** Total and reconciliated cells of the table. */
export const refreshTableCounts = (state: State) => {
  const { tableInstance, columns, rows } = state.entities;
  tableInstance.nCellsReconciliated = columns.allIds.reduce(
    (acc, colId) => acc + countReconciliated(columns.byId[colId]),
    0,
  );
  tableInstance.nCells = columns.allIds.length * rows.allIds.length;
};

/** Refresh the counters and status of some columns, then the table totals. */
export const refreshColumns = (state: State, colIds: Iterable<ID>) => {
  new Set(colIds).forEach((colId) => {
    // ids may come from cells that do not exist (e.g. stale selections)
    if (!getColumn(state, colId)) return;
    refreshColumnContext(state, colId);
    getColumn(state, colId).status = getColumnStatus(state, colId);
  });
  refreshTableCounts(state);
};

export const refreshAllColumns = (state: State) =>
  refreshColumns(state, state.entities.columns.allIds);

/** The range of the scores of all annotated cells. */
export const refreshScoreBoundaries = (state: State) => {
  const { rows, columns, tableInstance } = state.entities;
  let min = 0;
  let max = 0;

  rows.allIds.forEach((rowId) => {
    columns.allIds.forEach((colId) => {
      const annotationMeta = rows.byId[rowId].cells[colId]?.annotationMeta;
      // manual annotations may have no scores: comparing with undefined is false
      if (annotationMeta?.annotated) {
        if (annotationMeta.lowestScore < min) min = annotationMeta.lowestScore;
        if (annotationMeta.highestScore > max) max = annotationMeta.highestScore;
      }
    });
  });

  tableInstance.minMetaScore = min;
  tableInstance.maxMetaScore = max;
};
