import { TableState } from "../interfaces/table";
import reducer from "../table.slice";

/**
 * Builders for table states used across the table store tests.
 *
 * The derived values (context counters, annotation meta, column status,
 * table counters) are computed here with an independent, deliberately naive
 * implementation, so tests do not just agree with the code under test.
 */

export type MetaSpec = {
  id: string;
  match?: boolean;
  score?: number;
  type?: { id: string; name: string; uri?: string }[];
  decider?: "machine" | "human";
  name?: string;
};

/** A metadata item as the store holds it after reconciliation. */
export const meta = (spec: MetaSpec) => ({
  id: spec.id,
  match: spec.match ?? false,
  score: spec.score ?? 0.5,
  name: { value: spec.name ?? spec.id, uri: `http://kg/${spec.id}` },
  ...(spec.type && { type: spec.type }),
  ...(spec.decider && { decider: spec.decider }),
});

/** [label, metadata] cell shorthand. */
export type CellSpec = string | [string, MetaSpec[]];

export type TableSpec = {
  /** column ids, in order; label defaults to the id */
  columns: (string | { id: string; label?: string; [k: string]: any })[];
  /** row id -> column id -> cell */
  rows: Record<string, Record<string, CellSpec>>;
  tableInstance?: Record<string, any>;
  ui?: Record<string, any>;
};

const prefixOf = (item: { id: string }) => item.id.split(":")[0];

const annotationMetaOf = (metadata: ReturnType<typeof meta>[]) => {
  if (metadata.length === 0) {
    return { annotated: false, match: { value: false } };
  }
  const scores = metadata.map((m) => m.score);
  const matched = metadata.some((m) => m.match);
  return {
    annotated: true,
    match: matched ? { value: true, reason: "reconciliator" } : { value: false },
    lowestScore: Math.min(...scores),
    highestScore: Math.max(...scores),
  };
};

export const buildCell = (rowId: string, colId: string, spec: CellSpec) => {
  const [label, specs] = typeof spec === "string" ? [spec, []] : spec;
  const metadata = specs.map(meta);
  return {
    id: `${rowId}$${colId}`,
    label,
    metadata,
    annotationMeta: annotationMetaOf(metadata),
  };
};

/** Context counters of a column, counted straight from its cells. */
const contextOf = (cells: ReturnType<typeof buildCell>[]) => {
  const context: Record<string, any> = {};
  cells.forEach((cell) => {
    if (cell.metadata.length === 0) return;
    const prefix = prefixOf(cell.metadata[0]);
    context[prefix] ??= { uri: "https://www.wikidata.org/wiki/", total: 0, reconciliated: 0 };
    context[prefix].total += 1;
    if (cell.metadata.some((m) => m.match)) context[prefix].reconciliated += 1;
  });
  return context;
};

const statusOf = (cells: ReturnType<typeof buildCell>[]) => {
  if (cells.every((c) => c.annotationMeta.match.value)) return "reconciliated";
  if (cells.some((c) => c.metadata.length > 0 || c.annotationMeta.annotated)) {
    return "pending";
  }
  return "empty";
};

export const initial = (): TableState =>
  reducer(undefined, { type: "@@init" }) as TableState;

export const buildTable = (spec: TableSpec): TableState => {
  const state = initial();
  const columnSpecs = spec.columns.map((c) =>
    typeof c === "string" ? { id: c } : c,
  );
  const rowIds = Object.keys(spec.rows);

  const columnsById: Record<string, any> = {};
  const rowsById: Record<string, any> = {};
  rowIds.forEach((rowId) => {
    rowsById[rowId] = { id: rowId, cells: {} };
  });

  columnSpecs.forEach(({ id, label, ...rest }) => {
    const cells = rowIds.map((rowId) =>
      buildCell(rowId, id, spec.rows[rowId][id] ?? ""),
    );
    cells.forEach((cell, i) => {
      rowsById[rowIds[i]].cells[id] = cell;
    });
    columnsById[id] = {
      id,
      label: label ?? id,
      status: statusOf(cells),
      context: contextOf(cells),
      annotationMeta: { annotated: false, match: { value: false }, highestScore: 0, lowestScore: 0 },
      metadata: [],
      ...rest,
    };
  });

  const nReconciliated = Object.values(columnsById).reduce(
    (acc: number, col: any) =>
      acc + Object.values<any>(col.context).reduce((a, c) => a + c.reconciliated, 0),
    0,
  );

  return {
    ...state,
    entities: {
      tableInstance: {
        id: "t1",
        idDataset: "d1",
        name: "table",
        lastModifiedDate: "2025-01-01T00:00:00.000Z",
        nCells: columnSpecs.length * rowIds.length,
        nCellsReconciliated: nReconciliated,
        minMetaScore: 0,
        maxMetaScore: 0,
        ...spec.tableInstance,
      },
      columns: { byId: columnsById, allIds: columnSpecs.map((c) => c.id) },
      rows: { byId: rowsById, allIds: rowIds },
    },
    ui: { ...state.ui, ...spec.ui },
  } as TableState;
};

/** A 3x2 table: Rome/Paris/Berlin with candidates, and a plain column. */
export const cities = (over: Partial<TableSpec> = {}) =>
  buildTable({
    columns: ["city", "note"],
    rows: {
      r1: {
        city: ["Rome", [{ id: "wd:Q220", match: true, score: 1 }, { id: "wd:Q1", score: 0.4 }]],
        note: "capital",
      },
      r2: {
        city: ["Paris", [{ id: "wd:Q90", score: 0.9 }, { id: "wd:Q2", score: 0.3 }]],
        note: "capital",
      },
      r3: { city: "Berlin", note: "" },
    },
    ...over,
  });

/** The cells of a column as { rowId: cell }. */
export const colCells = (state: TableState, colId: string) =>
  Object.fromEntries(
    state.entities.rows.allIds.map((rowId) => [
      rowId,
      state.entities.rows.byId[rowId].cells[colId],
    ]),
  );

export const matchOf = (state: TableState, cellId: string) => {
  const [rowId, colId] = cellId.split("$");
  return state.entities.rows.byId[rowId].cells[colId].metadata
    .filter((m: any) => m.match)
    .map((m: any) => m.id);
};

export const NOW = "2026-01-01T00:00:00.000Z";
