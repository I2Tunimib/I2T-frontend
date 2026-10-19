import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer, { undo } from "../table.slice";
import { reconcile } from "../table.thunk";
import { buildTable, colCells, matchOf, NOW } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

vi.mock("@services/api/table", () => ({ default: {} }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const WD = "https://www.wikidata.org/wiki/";
const wikidata = { id: "wikidata", prefix: "wd", uri: WD } as any;

/** A table whose "city" column was never reconciled. */
const plain = (cityOver: Record<string, any> = {}) =>
  buildTable({
    columns: [{ id: "city", ...cityOver }, "note"],
    rows: {
      r1: { city: "Rome", note: "" },
      r2: { city: "Paris", note: "" },
      r3: { city: "Berlin", note: "" },
    },
  });

const cellResults = () => ({
  "r1$city": {
    id: "r1$city",
    metadata: [
      { id: "wd:Q220", name: "Rome", score: 1, match: true, type: [{ id: "wd:Q515", name: "city" }] },
      { id: "wd:Q1", name: "Italy", score: 0.2, match: false },
    ],
  },
  "r2$city": {
    id: "r2$city",
    metadata: [
      { id: "wd:Q90", name: "Paris", score: 0.95, match: true, type: [{ id: "wd:Q515", name: "city" }] },
    ],
  },
  "r3$city": {
    id: "r3$city",
    metadata: [{ id: "wd:Q64", name: "Berlin", score: 0.5, match: false }],
  },
});

const done = (
  state: ReturnType<typeof plain>,
  data: any,
  over: Record<string, any> = {},
) =>
  reducer(
    state,
    reconcile.fulfilled(
      { data, reconciliator: wikidata, ...over } as any,
      "req",
      { items: [], reconciliator: wikidata, formValues: {} },
    ),
  );

const city = (state: ReturnType<typeof plain>): any => state.entities.columns.byId.city;

describe("reconcile.fulfilled: cells", () => {
  it("stores the candidates of each cell with their resolved links", () => {
    const next = done(plain(), cellResults());
    expect(colCells(next, "city").r1.metadata[0]).toEqual({
      id: "wd:Q220",
      name: { value: "Rome", uri: `${WD}Q220` },
      score: 1,
      match: true,
      type: [{ id: "wd:Q515", name: "city" }],
    });
    expect(colCells(next, "city").r1.metadata).toHaveLength(2);
    expect(colCells(next, "city").r1.reconciler).toBe("wikidata");
  });

  it("works out the annotation of each cell", () => {
    const next = done(plain(), cellResults());
    expect(colCells(next, "city").r1.annotationMeta).toEqual({
      annotated: true,
      match: { value: true, reason: "reconciliator" },
      lowestScore: 0.2,
      highestScore: 1,
    });
    expect(colCells(next, "city").r3.annotationMeta).toEqual({
      annotated: true,
      match: { value: false },
      lowestScore: 0.5,
      highestScore: 0.5,
    });
  });

  it("marks the column as reconciled by this reconciliator", () => {
    const next = done(plain(), cellResults());
    expect(city(next).reconciler).toBe("wikidata");
    expect(city(next).kind).toBe("entity");
  });

  it("counts the cells under the prefix of the reconciliator", () => {
    const next = done(plain(), cellResults());
    expect(city(next).context).toEqual({ wd: { uri: WD, total: 3, reconciliated: 2 } });
    expect(city(next).status).toBe("pending");
    expect(next.entities.tableInstance).toMatchObject({
      nCells: 6,
      nCellsReconciliated: 2,
      maxMetaScore: 1,
    });
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("a fully matched column is reconciliated", () => {
    const data = cellResults();
    data["r3$city"].metadata[0].match = true;
    expect(city(done(plain(), data)).status).toBe("reconciliated");
  });

  it("accepts the results as a list and skips empty entries", () => {
    const next = done(plain(), [...Object.values(cellResults()), null]);
    expect(city(next).context.wd.total).toBe(3);
  });

  it("keeps the annotations the service found in the text", () => {
    const data = cellResults();
    (data["r1$city"] as any).annotations = { a: [{ id: 1 }] };
    (data["r2$city"] as any).annotations = {};
    const next = done(plain(), data);
    expect(colCells(next, "city").r1.annotations).toEqual({ a: [{ id: 1 }] });
    expect(colCells(next, "city").r2.annotations).toBeUndefined();
  });

  it("derives which column types are matched from the matched cells", () => {
    const state = plain({
      metadata: [
        {
          type: [
            { id: "wd:Q515", name: "city", match: false },
            { id: "wd:Q999", name: "other", match: true },
          ],
        },
      ],
    });
    const next = done(state, cellResults());
    expect(city(next).metadata[0].type.map((t: any) => [t.id, t.match])).toEqual([
      ["wd:Q515", true],
      ["wd:Q999", false],
    ]);
  });

  it("leaves the column alone when it has no types to update", () => {
    const next = done(plain({ metadata: [{ entity: [] }] }), cellResults());
    expect(city(next).metadata).toEqual([{ entity: [] }]);
  });

  it("only touches the reconciled columns", () => {
    const state = plain();
    const next = done(state, cellResults());
    expect(next.entities.columns.byId.note).toEqual(state.entities.columns.byId.note);
  });

  it("is undoable", () => {
    const next = done(plain(), cellResults());
    const undone = reducer(next, undo(1));
    expect(colCells(undone, "city").r1.metadata).toEqual([]);
    expect(city(undone).context).toEqual({});
  });

  it("keeps the operation log next to the history step", () => {
    const log = { id: "op1" } as any;
    const next = done(plain(), cellResults(), { operationLog: log });
    expect(next._draft.operationRefs).toEqual([log]);
  });

  it("is not recorded in the history when undoable is false", () => {
    const next = done(plain(), cellResults(), { undoable: false });
    expect(next._draft.patches).toHaveLength(0);
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q220"]);
  });
});

describe("reconcile.fulfilled: in-table linker", () => {
  it("uses the reconciliator named in the results", () => {
    const linker = { id: "inTableLinker", prefix: "cr", uri: "" } as any;
    const effective = { id: "cr-city", prefix: "cr", uri: "https://t.example/" };
    const data = {
      reconciliator: effective,
      "r1$city": {
        id: "r1$city",
        metadata: [{ id: "cr:row1", name: "Rome", score: 1, match: true }],
      },
    };
    const next = reducer(
      plain(),
      reconcile.fulfilled({ data, reconciliator: linker } as any, "req", {
        items: [],
        reconciliator: linker,
        formValues: {},
      }),
    );
    expect(city(next).reconciler).toBe("cr-city");
    expect(city(next).context).toEqual({ cr: { uri: "https://t.example/", total: 1, reconciliated: 1 } });
    expect((colCells(next, "city").r1.metadata[0].name as any).uri).toBe("https://t.example/row1");
  });
});

describe("reconcile.fulfilled: columns", () => {
  const columnResult = (metadata: any[]) => ({ city: { id: "city", metadata } });

  it("creates the column annotation from the types and properties found", () => {
    const next = done(
      plain(),
      columnResult([
        {
          type: [{ id: "wd:Q515", name: "city" }],
          property: [{ id: "wd:P17", name: "country", obj: "note", score: 1 }],
        },
        { type: [{ id: "wd:Q486972", name: "settlement" }] },
      ]),
    );
    expect(city(next).metadata[0]).toEqual({
      id: "None:",
      match: true,
      score: 0,
      name: { value: "", uri: "" },
      // no cell matched these types, so they end up unmatched
      type: [
        { id: "wd:Q515", name: "city", match: false },
        { id: "wd:Q486972", name: "settlement", match: false },
      ],
      property: [{ id: "wd:P17", name: "country", obj: "note", score: 1, match: true }],
    });
    expect(city(next).annotationMeta).toEqual({
      annotated: true,
      match: { value: false },
      highestScore: 0,
      lowestScore: 0,
    });
    expect(city(next).reconciler).toBe("wikidata");
  });

  it("adds the properties found to a column that already has metadata", () => {
    const state = plain({ metadata: [{ property: [{ id: "wd:P1", obj: "x", match: false }] }] });
    const next = done(
      state,
      columnResult([{ property: [{ id: "wd:P17", name: "country", obj: "note" }] }, { type: [] }]),
    );
    expect(city(next).metadata[0].property.map((p: any) => [p.id, p.match])).toEqual([
      ["wd:P1", false],
      ["wd:P17", true],
    ]);
  });

  it("adds properties to a column whose metadata had none yet", () => {
    const state = plain({ metadata: [{ type: [] }] });
    const next = done(state, columnResult([{ property: [{ id: "wd:P17", obj: "note" }] }]));
    expect(city(next).metadata[0].property.map((p: any) => p.id)).toEqual(["wd:P17"]);
  });

  it("ignores results without properties for a column that has metadata", () => {
    const state = plain({ metadata: [{ type: [] }] });
    const next = done(state, columnResult([{ type: [{ id: "wd:Q1", name: "x" }] }]));
    expect(city(next).metadata).toEqual([{ type: [] }]);
  });

  it("ignores results for columns that do not exist", () => {
    const state = plain();
    const next = done(state, { ghost: { id: "ghost", metadata: [{ type: [] }] } });
    expect(next.entities.columns).toEqual(state.entities.columns);
  });
});
