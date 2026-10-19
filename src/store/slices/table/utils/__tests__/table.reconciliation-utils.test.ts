import { describe, expect, it } from "vitest";
import { produce } from "immer";
import {
  computeCellAnnotationStats,
  computeColumnAnnotationStats,
  createContext,
  getCellContext,
  getColumnStatus,
  getMinMaxScore,
  isCellReconciliated,
  refreshAllColumns,
  refreshColumns,
  refreshScoreBoundaries,
  refreshTableCounts,
  summarizeMatches,
} from "../table.reconciliation-utils";
import { buildTable, cities } from "../../__tests__/fixtures";

/** Run a change on a table state as a draft, like a reducer does. */
const change = (state: any, recipe: (draft: any) => void): any => (produce as any)(state, recipe);

describe("cells", () => {
  it("isCellReconciliated: a cell is reconciliated when a candidate is matched", () => {
    expect(isCellReconciliated({ metadata: [{ match: false }, { match: true }] } as any)).toBe(true);
    expect(isCellReconciliated({ metadata: [{ match: false }] } as any)).toBe(false);
    expect(isCellReconciliated({ metadata: [] } as any)).toBe(false);
  });

  it("getCellContext is the prefix of the first candidate, or empty", () => {
    expect(getCellContext({ metadata: [{ id: "geo:1" }, { id: "wd:2" }] } as any)).toBe("geo");
    expect(getCellContext({ metadata: [] } as any)).toBe("");
  });

  it("getMinMaxScore: scores range, a missing score counts as zero", () => {
    expect(getMinMaxScore([{ score: 0.4 }, { score: 0.9 }, {}] as any)).toEqual({ min: 0, max: 0.9 });
  });

  it("createContext has defaults", () => {
    expect(createContext({})).toEqual({ uri: "", total: 0, reconciliated: 0 });
    expect(createContext({ uri: "u", total: 2, reconciliated: 1 })).toEqual({ uri: "u", total: 2, reconciliated: 1 });
  });
});

describe("annotation stats", () => {
  const item = (score: number | undefined, match = false) => ({ id: "x", score, match }) as any;

  it("summarizeMatches: match flag and scores range", () => {
    expect(summarizeMatches([item(0.2), item(0.9, true)])).toEqual({
      match: { value: true, reason: "reconciliator" },
      lowestScore: 0.2,
      highestScore: 0.9,
    });
    expect(summarizeMatches([item(0.5)]).match).toEqual({ value: false });
  });

  it("summarizeMatches: candidates without a numeric score count as zero", () => {
    expect(summarizeMatches([item(undefined)])).toMatchObject({ lowestScore: 0, highestScore: 0 });
    expect(summarizeMatches([item(undefined), item(0.4)])).toMatchObject({ lowestScore: 0.4, highestScore: 0.4 });
  });

  it("computeCellAnnotationStats: nothing without candidates", () => {
    expect(computeCellAnnotationStats({ metadata: [] } as any)).toEqual({
      match: { value: false },
      highestScore: 0,
      lowestScore: 0,
    });
    expect(computeCellAnnotationStats({ metadata: [item(0.3, true)] } as any).match.value).toBe(true);
  });

  it("computeColumnAnnotationStats: from the entities of the column", () => {
    const none = { match: { value: false }, highestScore: 0, lowestScore: 0 };
    expect(computeColumnAnnotationStats({ metadata: [] } as any)).toEqual(none);
    expect(computeColumnAnnotationStats({ metadata: [{}] } as any)).toEqual(none);
    expect(computeColumnAnnotationStats({ metadata: [{ entity: [] }] } as any)).toEqual(none);
    expect(computeColumnAnnotationStats({ metadata: [{ entity: [item(0.7, true)] }] } as any)).toEqual({
      match: { value: true, reason: "reconciliator" },
      lowestScore: 0.7,
      highestScore: 0.7,
    });
  });
});

describe("getColumnStatus", () => {
  const status = (table: any, colId: string) => {
    let result: string | undefined;
    change(table, (draft) => {
      result = getColumnStatus(draft, colId);
    });
    return result;
  };

  it("reconciliated when every row is matched", () => {
    const table = buildTable({
      columns: ["a"],
      rows: { r1: { a: ["x", [{ id: "wd:Q1", match: true }]] }, r2: { a: ["y", [{ id: "wd:Q2", match: true }]] } },
    });
    expect(status(table, "a")).toBe("reconciliated");
  });

  it("reconciliated when the counters say every row is reconciliated", () => {
    const table = buildTable({ columns: [{ id: "a", context: { wd: { uri: "", total: 2, reconciliated: 2 } } }], rows: { r1: { a: "x" }, r2: { a: "y" } } });
    expect(status(table, "a")).toBe("reconciliated");
  });

  it("pending when some cell has candidates or is annotated", () => {
    expect(status(cities(), "city")).toBe("pending");
    const annotated = buildTable({ columns: ["a"], rows: { r1: { a: "x" }, r2: { a: "y" } } });
    annotated.entities.rows.byId.r2.cells.a.annotationMeta = { annotated: true, match: { value: false } } as any;
    expect(status(annotated, "a")).toBe("pending");
  });

  it("pending when a row has no cell in the column but another has candidates", () => {
    const table = cities();
    delete table.entities.rows.byId.r3.cells.city;
    expect(status(table, "city")).toBe("pending");
  });

  it("empty when nothing is annotated", () => {
    expect(status(cities(), "note")).toBe("empty");
  });

  it("empty for a table without rows", () => {
    const table = buildTable({ columns: ["a"], rows: {} });
    expect(status(table, "a")).toBe("empty");
  });
});

describe("refreshColumns", () => {
  const refreshed = (table: any, colIds?: string[]) =>
    change(table, (draft) => {
      if (colIds) refreshColumns(draft, colIds);
      else refreshAllColumns(draft);
    });

  it("counts the cells of each context from the cells themselves", () => {
    const table = cities();
    table.entities.columns.byId.city.context = { wd: { uri: "keep", total: 99, reconciliated: 99 } };
    const next = refreshed(table, ["city"]);
    expect(next.entities.columns.byId.city.context).toEqual({ wd: { uri: "keep", total: 2, reconciliated: 1 } });
    expect(next.entities.columns.byId.city.status).toBe("pending");
  });

  it("creates the context of a prefix it finds, with the known link of its knowledge base", () => {
    const table = cities();
    table.entities.columns.byId.city.context = {};
    const next = refreshed(table, ["city"]);
    expect(next.entities.columns.byId.city.context.wd.uri).toBe("https://www.wikidata.org/wiki/");
    const unknown = buildTable({ columns: ["a"], rows: { r1: { a: ["x", [{ id: "zz:1" }]] } } });
    unknown.entities.columns.byId.a.context = {};
    expect(refreshed(unknown, ["a"]).entities.columns.byId.a.context.zz).toEqual({ uri: "", total: 1, reconciliated: 0 });
  });

  it("keeps contexts without cells at zero, and fills a context that was created empty", () => {
    const table = cities();
    table.entities.columns.byId.note.context = { wd: { uri: "u", total: 4, reconciliated: 4 }, empty: {} as any };
    const next = refreshed(table, ["note"]);
    expect(next.entities.columns.byId.note.context.wd).toEqual({ uri: "u", total: 0, reconciliated: 0 });
    expect(next.entities.columns.byId.note.context.empty).toEqual({ uri: "", total: 0, reconciliated: 0 });
  });

  it("adds a context to a column that has none", () => {
    const table = cities();
    delete (table.entities.columns.byId.city as any).context;
    const next = refreshed(table, ["city"]);
    expect(next.entities.columns.byId.city.context.wd.total).toBe(2);
  });

  it("ignores rows without a cell in the column", () => {
    const table = cities();
    delete table.entities.rows.byId.r1.cells.city;
    const next = refreshed(table, ["city"]);
    expect(next.entities.columns.byId.city.context.wd).toMatchObject({ total: 1, reconciliated: 0 });
  });

  it("only refreshes the given columns, once each", () => {
    const table = cities();
    table.entities.columns.byId.city.context.wd.total = 99;
    table.entities.columns.byId.note.status = "reconciliated" as any;
    const next = refreshed(table, ["city", "city"]);
    expect(next.entities.columns.byId.city.context.wd.total).toBe(2);
    expect(next.entities.columns.byId.note.status).toBe("reconciliated");
  });

  it("refreshAllColumns refreshes every column and the table totals", () => {
    const table = cities();
    table.entities.columns.byId.note.status = "reconciliated" as any;
    const next = refreshed(table);
    expect(next.entities.columns.byId.note.status).toBe("empty");
    expect(next.entities.tableInstance).toMatchObject({ nCells: 6, nCellsReconciliated: 1 });
  });
});

describe("refreshTableCounts", () => {
  it("counts cells and reconciliated cells", () => {
    const table = cities();
    table.entities.tableInstance.nCells = 0;
    table.entities.tableInstance.nCellsReconciliated = 0;
    const next = change(table, (draft) => refreshTableCounts(draft));
    expect(next.entities.tableInstance).toMatchObject({ nCells: 6, nCellsReconciliated: 1 });
  });

  it("counts a context without a counter as zero", () => {
    const table = cities();
    table.entities.columns.byId.city.context = { wd: { uri: "" } as any };
    const next = change(table, (draft) => refreshTableCounts(draft));
    expect(next.entities.tableInstance.nCellsReconciliated).toBe(0);
  });
});

describe("refreshScoreBoundaries", () => {
  const boundaries = (table: any) =>
    change(table, (draft) => refreshScoreBoundaries(draft)).entities.tableInstance;

  it("is the range of the scores of annotated cells, starting from zero", () => {
    expect(boundaries(cities())).toMatchObject({ minMetaScore: 0, maxMetaScore: 1 });
  });

  it("can go below zero", () => {
    const table = cities();
    table.entities.rows.byId.r2.cells.city.annotationMeta = { annotated: true, lowestScore: -2, highestScore: 0.1 } as any;
    expect(boundaries(table)).toMatchObject({ minMetaScore: -2, maxMetaScore: 1 });
  });

  it("ignores cells that are not annotated, have no annotation, or no scores", () => {
    const table = cities();
    table.entities.rows.byId.r2.cells.city.annotationMeta = { annotated: false, lowestScore: -9, highestScore: 9 } as any;
    delete (table.entities.rows.byId.r3.cells.city as any).annotationMeta;
    table.entities.rows.byId.r1.cells.note.annotationMeta = { annotated: true, match: { value: true } } as any;
    delete table.entities.rows.byId.r1.cells.city;
    expect(boundaries(table)).toMatchObject({ minMetaScore: 0, maxMetaScore: 0 });
  });
});
