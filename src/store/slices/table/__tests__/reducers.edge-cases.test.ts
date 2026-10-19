import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer, {
  addCellMetadata,
  addColumnMetadata,
  addColumnType,
  autoMatching,
  clearColumnReconciliation,
  deleteCellMetadata,
  deleteColumnMetadata,
  propagateCellMetadata,
  refineMatching,
  updateCellMetadata,
  updateColumnTypeMatches,
  updateSchema,
  updateUI,
} from "../table.slice";
import { extend, modify, reconcile } from "../table.thunk";
import { buildTable, cities, colCells, matchOf } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

vi.mock("@services/api/table", () => ({ default: { trackTable: vi.fn() } }));

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

const WD = "https://www.wikidata.org/wiki/";
const wikidata = { id: "wikidata", prefix: "wd", uri: WD } as any;

describe("updateCellMetadata", () => {
  it("keeps the score range of the cell", () => {
    const next = reducer(cities(), updateCellMetadata({ cellId: "r2$city", metadataId: "wd:Q90" }));
    expect(colCells(next, "city").r2.annotationMeta).toMatchObject({ lowestScore: 0.3, highestScore: 0.9 });
    const back = reducer(next, updateCellMetadata({ cellId: "r2$city", metadataId: "wd:Q90" }));
    expect(colCells(back, "city").r2.annotationMeta).toMatchObject({ lowestScore: 0.3, highestScore: 0.9 });
  });

  it("unmatches every candidate when the id is unknown", () => {
    const next = reducer(cities(), updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q404" }));
    expect(matchOf(next, "r1$city")).toEqual([]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: false });
  });

  it("an explicit match: false does not match an unmatched candidate", () => {
    const next = reducer(cities(), updateCellMetadata({ cellId: "r2$city", metadataId: "wd:Q90", match: false }));
    expect(matchOf(next, "r2$city")).toEqual([]);
  });
});

describe("deleteCellMetadata", () => {
  const twoMatched = () => {
    const table = cities();
    table.entities.rows.byId.r1.cells.city.metadata[1].match = true;
    return table;
  };

  it("keeps the match when another matched candidate remains", () => {
    const next = reducer(twoMatched(), deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220" }));
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q1"]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: true, reason: "manual" });
  });

  it("unmatches the cell when the matched candidate is removed and none is left matched", () => {
    const next = reducer(cities(), deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220" }));
    expect(colCells(next, "city").r1.annotationMeta).toMatchObject({ annotated: true, match: { value: false } });
  });

  it("leaves the annotation alone when an unmatched candidate is removed", () => {
    const next = reducer(cities(), deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q1" }));
    // matched by the reconciliator: the reason must not become "manual"
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: true, reason: "reconciliator" });
  });

  it("ignores a cell that does not exist", () => {
    const state = cities();
    expect(reducer(state, deleteCellMetadata({ cellId: "r1$ghost", metadataId: "x" })).entities).toEqual(state.entities);
  });
});

describe("addCellMetadata", () => {
  it("ignores a cell that does not exist", () => {
    const state = cities();
    const next = reducer(
      state,
      addCellMetadata({ cellId: "r1$ghost", prefix: "wd", value: { id: "wd:Q1", name: "x", score: 1, match: "true", uri: "u" } } as any),
    );
    expect(next.entities).toEqual(state.entities);
  });
});

describe("propagateCellMetadata", () => {
  const typed = () =>
    buildTable({
      columns: ["a"],
      rows: {
        r1: { a: ["Rome", [{ id: "wd:Q1", type: [{ id: "wd:T", name: "City" }] }]] },
        r2: { a: "Rome" },
      },
    });

  it("copies the candidate with its types into cells that did not have it", () => {
    const next = reducer(
      typed(),
      propagateCellMetadata({ cellId: "r1$a", metadataId: "wd:Q1", value: { match: true } } as any),
    );
    // reading nested values would throw if they were revoked proxies
    expect(JSON.parse(JSON.stringify(colCells(next, "a").r2.metadata))).toMatchObject([
      { id: "wd:Q1", match: true, type: [{ id: "wd:T", name: "City" }] },
    ]);
  });

  it("unmatches the other candidates of a same-label cell that already had the candidate", () => {
    const state = buildTable({
      columns: ["a"],
      rows: {
        r1: { a: ["Rome", [{ id: "wd:Q1" }]] },
        r2: { a: ["Rome", [{ id: "wd:Q1" }, { id: "wd:Q2", match: true }]] },
      },
    });
    const next = reducer(
      state,
      propagateCellMetadata({ cellId: "r1$a", metadataId: "wd:Q1", value: { match: true } } as any),
    );
    expect(matchOf(next, "r2$a")).toEqual(["wd:Q1"]);
  });
});

describe("refineMatching and autoMatching on missing cells", () => {
  it("refineMatching skips a cell that does not exist", () => {
    const state = cities();
    const next = reducer(state, refineMatching({ changes: [{ cellId: "r1$ghost", metaItemId: "x" }] } as any));
    expect(next.entities.rows).toEqual(state.entities.rows);
  });

  it("autoMatching skips a selected cell that does not exist", () => {
    const state = reducer(cities(), updateUI({ selectedCellIds: { "r1$ghost": true } }));
    const next = reducer(state, autoMatching({ threshold: 0.5 }));
    expect(next.entities.rows).toEqual(state.entities.rows);
  });
});

describe("autoMatching on columns", () => {
  const entity = (id: string, score: number, match = false) => ({ id, score, match, name: { value: id, uri: "" } });
  const table = (entities: any[] | undefined, annotationMatch = false) =>
    reducer(
      buildTable({
        columns: [
          {
            id: "a",
            metadata: entities ? [{ entity: entities }] : [],
            annotationMeta: { annotated: true, match: { value: annotationMatch } },
          },
        ],
        rows: { r1: { a: "x" } },
      }),
      updateUI({ selectedColumnsIds: { a: true } }),
    );
  const run = (state: any, threshold = 0.5) => reducer(state, autoMatching({ threshold })).entities.columns.byId.a;

  it("matches the best entity at or above the threshold", () => {
    const column = run(table([entity("e1", 0.4), entity("e2", 0.9), entity("e3", 0.7)]));
    expect(column.metadata[0].entity.map((e: any) => e.match)).toEqual([false, true, false]);
    expect(column.annotationMeta.match).toEqual({ value: true, reason: "refinement" });
  });

  it("leaves a column alone when its best entity is already matched", () => {
    const column = run(table([entity("e1", 0.9, true)]));
    expect(column.annotationMeta.match).toEqual({ value: false });
  });

  it("unmatches a matched column when no entity reaches the threshold", () => {
    const column = run(table([entity("e1", 0.2, true)], true));
    expect(column.metadata[0].entity[0].match).toBe(false);
    expect(column.annotationMeta.match).toEqual({ value: false });
  });

  it("leaves an unmatched column alone when no entity reaches the threshold", () => {
    const column = run(table([entity("e1", 0.2)]));
    expect(column.metadata[0].entity[0].match).toBe(false);
    expect(column.annotationMeta.match).toEqual({ value: false });
  });

  it("skips columns without entities", () => {
    expect(run(table(undefined)).metadata).toEqual([]);
    expect(run(table([])).metadata[0].entity).toEqual([]);
  });
});

describe("updateSchema and clearColumnReconciliation", () => {
  it("updateSchema ignores the schema of another table", () => {
    const state = cities();
    const next = reducer(
      state,
      updateSchema({
        table: { id: "other" },
        result: { kind_classification: { city: "entity" }, ner_classification: {} },
      } as any),
    );
    expect(next.entities).toEqual(state.entities);
  });

  it("clearColumnReconciliation ignores an unknown column", () => {
    const state = cities();
    expect(reducer(state, clearColumnReconciliation({ colId: "ghost" })).entities).toEqual(state.entities);
  });
});

describe("addColumnMetadata without optional fields", () => {
  const bare = (over: Record<string, any> = {}) =>
    buildTable({ columns: [{ id: "a", ...over }, "b"], rows: { r1: { a: "x", b: "y" } } });

  it("entity: no prefix, no context and no link", () => {
    const state = bare();
    delete (state.entities.columns.byId.a as any).context;
    const next = reducer(
      state,
      addColumnMetadata({ colId: "a", type: "entity", value: { id: "e", name: "E", score: 1, match: "true" } } as any),
    );
    expect(next.entities.columns.byId.a.context[""]).toEqual({ reconciliated: 0, total: 0, uri: "" });
  });

  it("property: no prefix, no subject (the column itself), no context and no link", () => {
    const state = bare();
    delete (state.entities.columns.byId.a as any).context;
    const next = reducer(
      state,
      addColumnMetadata({ colId: "a", type: "property", value: { id: "p", name: "P", obj: "b", score: 1, match: "true" } } as any),
    );
    expect(next.entities.columns.byId.a.role).toBe("subject");
    expect(next.entities.columns.byId.a.metadata[0].property).toHaveLength(1);
    expect(next.entities.columns.byId.a.context[""]).toEqual({ reconciliated: 0, total: 0, uri: "" });
  });

  it("deleteColumnMetadata ignores an unknown type", () => {
    const state = bare();
    expect(reducer(state, deleteColumnMetadata({ colId: "a", type: "type", metadataId: "x" } as any)).entities).toEqual(
      state.entities,
    );
  });
});

describe("column types: which column", () => {
  const table = () =>
    buildTable({
      columns: [{ id: "a", metadata: [{ type: [{ id: "T1", name: "x", match: false, score: 0 }] }] }, "b"],
      rows: { r1: { a: "x", b: "y" } },
    });
  const typesOf = (state: any) => state.entities.columns.byId.a.metadata[0].type.map((t: any) => t.id);

  it("addColumnType prefers the column of the payload, then the dialog, then the selection", () => {
    const base = table();
    const payload = { newTypes: [{ id: "T2", name: "y" }] };
    expect(typesOf(reducer(base, addColumnType({ ...payload, colId: "a" } as any)))).toEqual(["T1", "T2"]);
    const dialog = reducer(base, updateUI({ metadataColumnDialogColId: "a" }));
    expect(typesOf(reducer(dialog, addColumnType(payload as any)))).toEqual(["T1", "T2"]);
    const selected = reducer(base, updateUI({ selectedColumnCellsIds: { a: true } }));
    expect(typesOf(reducer(selected, addColumnType(payload as any)))).toEqual(["T1", "T2"]);
  });

  it("addColumnType ignores an unknown column", () => {
    const state = table();
    const next = reducer(state, addColumnType({ colId: "ghost", newTypes: [{ id: "T", name: "n" }] } as any));
    expect(next.entities.columns).toEqual(state.entities.columns);
    expect(next.entities.rows).toEqual(state.entities.rows);
  });

  it("updateColumnTypeMatches falls back to the selected column of cells", () => {
    const selected = reducer(table(), updateUI({ selectedColumnCellsIds: { a: true } }));
    const next = reducer(selected, updateColumnTypeMatches({ typeIds: ["T1"] }));
    // the score it had is kept (0 is a score), only a missing one gets the default
    expect(next.entities.columns.byId.a.metadata[0].type[0]).toMatchObject({ match: true, score: 0 });
  });
});

describe("reconcile results for things that do not exist", () => {
  const done = (state: any, data: any) =>
    reducer(state, reconcile.fulfilled({ data, reconciliator: wikidata } as any, "req", {} as any));

  it("ignores results for cells of a column that does not exist", () => {
    const state = cities();
    const next = done(state, { "r1$ghost": { id: "r1$ghost", metadata: [{ id: "wd:Q1", name: "x", score: 1, match: true }] } });
    expect(next.entities.rows).toEqual(state.entities.rows);
  });

  it("builds a column annotation from results that carry only properties", () => {
    const state = buildTable({ columns: [{ id: "a", metadata: [] }], rows: { r1: { a: "x" } } });
    const next = done(state, { a: { id: "a", metadata: [{ property: [{ id: "wd:P1", obj: "b" }] }] } });
    expect(next.entities.columns.byId.a.metadata[0]).toMatchObject({ type: [], property: [{ id: "wd:P1", match: true }] });
  });
});

describe("service columns: what the service learned about the original column", () => {
  const extended = (state: any, originalColMeta: any) =>
    reducer(
      state,
      extend.fulfilled(
        { data: { columns: { n: { label: "N", metadata: [], cells: { r1: null } } }, originalColMeta }, selectedColumnId: "a" } as any,
        "req",
        {} as any,
      ),
    );
  const modified = (state: any, originalColMeta: any) =>
    reducer(
      state,
      modify.fulfilled(
        { data: { columns: { n: { label: "N", metadata: [], cells: { r1: null } } }, originalColMeta }, selectedColumnId: "a" } as any,
        "req",
        {} as any,
      ),
    );
  const base = (over: Record<string, any> = {}) =>
    buildTable({ columns: [{ id: "a", ...over }], rows: { r1: { a: "x" } } });

  it("extension: ignores an original column that does not exist", () => {
    const state = base();
    const next = extended(state, { originalColName: "ghost", types: [], properties: [] });
    expect(next.entities.columns.byId.a).toEqual(state.entities.columns.byId.a);
  });

  it("extension: gives a column without metadata somewhere to keep types and properties", () => {
    const next = extended(base(), {
      originalColName: "a",
      types: [{ id: "wd:Q5", name: "human" }],
      properties: [{ id: "wd:P1", obj: "n" }],
    });
    expect(next.entities.columns.byId.a.metadata[0].type[0].uri).toBe(`${WD}Q5`);
    expect(next.entities.columns.byId.a.metadata[0].property[0].uri).toBe(`${WD}Property:P1`);
  });

  it("extension: does not add types or properties twice", () => {
    const state = base({
      metadata: [{ type: [{ id: "wd:Q5", name: "human" }], property: [{ id: "wd:P1", obj: "n" }] }],
    });
    const next = extended(state, {
      originalColName: "a",
      types: [{ id: "wd:Q5", name: "human" }],
      properties: [{ id: "wd:P1", obj: "n" }],
    });
    expect(next.entities.columns.byId.a.metadata[0].type).toHaveLength(1);
    expect(next.entities.columns.byId.a.metadata[0].property).toHaveLength(1);
  });

  it("extension: works without types or properties", () => {
    const next = extended(base({ metadata: [{}] }), { originalColName: "a" });
    expect(next.entities.columns.byId.a.metadata[0]).toMatchObject({ type: [], property: [] });
  });

  it("modification: appends the properties to a column that has metadata", () => {
    const next = modified(base({ metadata: [{ property: [{ id: "wd:P0", obj: "x" }] }] }), {
      originalColName: "a",
      properties: [{ id: "wd:P1", obj: "n" }],
    });
    expect(next.entities.columns.byId.a.metadata[0].property.map((p: any) => p.id)).toEqual(["wd:P0", "wd:P1"]);
  });

  it("modification: starts the property list when there was none, or has no properties to add", () => {
    const started = modified(base({ metadata: [{}] }), { originalColName: "a", properties: [{ id: "wd:P1", obj: "n" }] });
    expect(started.entities.columns.byId.a.metadata[0].property).toHaveLength(1);
    const none = modified(base({ metadata: [{}] }), { originalColName: "a" });
    expect(none.entities.columns.byId.a.metadata[0].property).toEqual([]);
  });

  it("modification: ignores a missing column or a column without metadata", () => {
    const withoutMetadata = base();
    expect(
      modified(withoutMetadata, { originalColName: "a", properties: [{ id: "wd:P1" }] }).entities.columns.byId.a.metadata,
    ).toEqual([]);
    const missing = modified(base(), { originalColName: "ghost", properties: [] });
    expect(missing.entities.columns.byId.a.metadata).toEqual([]);
  });
});
