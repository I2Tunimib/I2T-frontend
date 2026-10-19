import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer, { undo } from "../table.slice";
import { extend, modify } from "../table.thunk";
import { buildTable, cities, colCells, NOW } from "./fixtures";


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
const extender = { id: "wikidataPropertySPARQL" } as any;
const modifier = { id: "modifier" } as any;

const extended = (
  state: ReturnType<typeof cities>,
  data: any,
  over: Record<string, any> = {},
) =>
  reducer(
    state,
    extend.fulfilled(
      { data: { meta: {}, originalColMeta: undefined, ...data }, extender, selectedColumnId: "city", ...over } as any,
      "req",
      { extender, formValues: {} },
    ),
  );

const modified = (
  state: ReturnType<typeof cities>,
  data: any,
  over: Record<string, any> = {},
) =>
  reducer(
    state,
    modify.fulfilled(
      { data, modifier, selectedColumnId: "city", ...over } as any,
      "req",
      { modifier, formValues: {} },
    ),
  );

const newColumn = (over: Record<string, any> = {}) => ({
  label: "Region",
  metadata: [],
  cells: {
    r1: { label: "Lazio", metadata: [{ id: "wd:Q1282", name: "Lazio", score: 1, match: true }] },
    r2: { label: "Ile-de-France", metadata: [] },
    r3: null,
  },
  ...over,
});

describe("extend.fulfilled", () => {
  it("inserts the new column right after the extended one", () => {
    const next = extended(cities(), { columns: { region: newColumn() } });
    expect(next.entities.columns.allIds).toEqual(["city", "region", "note"]);
    expect(next.entities.columns.byId.region).toMatchObject({ id: "region", label: "Region" });
  });

  it("inserts several new columns in order", () => {
    const next = extended(cities(), {
      columns: { a: newColumn({ label: "A" }), b: newColumn({ label: "B" }) },
    });
    expect(next.entities.columns.allIds).toEqual(["city", "a", "b", "note"]);
  });

  it("creates a cell in every row, from the service answer", () => {
    const next = extended(cities(), { columns: { region: newColumn() } });
    const cells = colCells(next, "region");
    expect(cells.r1).toEqual({
      id: "r1$region",
      label: "Lazio",
      metadata: [
        { id: "wd:Q1282", name: { value: "Lazio", uri: `${WD}Q1282` }, score: 1, match: true },
      ],
      annotationMeta: {
        annotated: true,
        match: { value: true, reason: "reconciliator" },
        lowestScore: 1,
        highestScore: 1,
      },
    });
    expect(cells.r2.annotationMeta).toEqual({ annotated: false, match: { value: false } });
    expect(cells.r3).toMatchObject({ id: "r3$region", label: "null", metadata: [] });
    expect(cells.r3.annotationMeta).toEqual({ annotated: false, match: { value: false } });
  });

  it("drops candidates whose id has no prefix or is already a link", () => {
    const column = newColumn({
      cells: {
        r1: {
          label: "x",
          metadata: [
            { id: "plain", name: "a", score: 1, match: false },
            { id: "https://x.example/1", name: "b", score: 1, match: false },
            { id: "wd:Q1", name: "c", score: 1, match: false },
          ],
        },
        r2: null,
        r3: null,
      },
    });
    const next = extended(cities(), { columns: { region: column } });
    expect(colCells(next, "region").r1.metadata.map((m: any) => m.id)).toEqual(["wd:Q1"]);
  });

  it("keeps the annotations found in the text of a cell", () => {
    const column = newColumn({
      cells: { r1: { label: "x", metadata: [], annotations: { a: [{ id: 1 }] } }, r2: null, r3: null },
    });
    const next = extended(cities(), { columns: { region: column } });
    expect(colCells(next, "region").r1.annotations).toEqual({ a: [{ id: 1 }] });
  });

  it("counts the new column's candidates and works out its status", () => {
    const next = extended(cities(), { columns: { region: newColumn() } });
    const region = next.entities.columns.byId.region;
    expect(region.context).toEqual({ wd: { uri: WD, total: 1, reconciliated: 1 } });
    expect(region.status).toBe("pending");
    expect(next.entities.tableInstance).toMatchObject({ nCells: 9, nCellsReconciliated: 2 });
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("gives the new column the metadata the service found for it", () => {
    const column = newColumn({
      metadata: [{ entity: [{ id: "wd:Q1282", name: "Lazio", score: 0.9, match: false }] }],
      kind: "entity",
    });
    const region = extended(cities(), { columns: { region: column } }).entities.columns.byId.region;
    expect(region.metadata[0].entity[0].name).toEqual({ value: "Lazio", uri: `${WD}Q1282` });
    expect(region.annotationMeta).toMatchObject({ annotated: true, lowestScore: 0.9, highestScore: 0.9 });
    expect(region.kind).toBe("entity");
  });

  it("adds the types and properties the service found to the extended column", () => {
    const state = buildTable({
      columns: [{ id: "city", metadata: [{}] }, "note"],
      rows: { r1: { city: "Rome", note: "" } },
    });
    const next = extended(
      state,
      {
        columns: { region: { label: "R", metadata: [], cells: { r1: null } } },
        originalColMeta: {
          originalColName: "city",
          types: [{ id: "wd:Q515", name: "city" }],
          properties: [{ id: "wd:P1082", obj: "region", name: "population" }],
        },
      },
    );
    const city = next.entities.columns.byId.city;
    expect(city.context.wd).toEqual({ reconciliated: 0, total: 0, uri: `${WD}Property:` });
    expect(city.metadata[0].type).toEqual([{ id: "wd:Q515", name: "city", uri: `${WD}Q515` }]);
    expect(city.metadata[0].property).toEqual([
      { id: "wd:P1082", obj: "region", name: "population", uri: `${WD}Property:P1082` },
    ]);
  });

  it("does not add a type or property the column already has", () => {
    const state = buildTable({
      columns: [
        {
          id: "city",
          context: { wd: { uri: "keep", total: 1, reconciliated: 0 } },
          metadata: [{ type: [{ id: "wd:Q515", name: "city" }], property: [{ id: "wd:P1082", obj: "region" }] }],
        },
      ],
      rows: { r1: { city: "Rome" } },
    });
    const next = extended(state, {
      columns: { region: { label: "R", metadata: [], cells: { r1: null } } },
      originalColMeta: {
        originalColName: "city",
        types: [{ id: "wd:Q515", name: "city" }],
        properties: [{ id: "wd:P1082", obj: "region" }, { id: "wd:P1082", obj: "other" }],
      },
    });
    const city = next.entities.columns.byId.city;
    expect(city.context.wd.uri).toBe("keep");
    expect(city.metadata[0].type).toHaveLength(1);
    expect(city.metadata[0].property.map((p: any) => p.obj)).toEqual(["region", "other"]);
  });

  it("adds types to a column that had no type list", () => {
    const state = buildTable({
      columns: [{ id: "city", metadata: [{}] }],
      rows: { r1: { city: "Rome" } },
    });
    const next = extended(state, {
      columns: { region: { label: "R", metadata: [], cells: { r1: null } } },
      originalColMeta: { originalColName: "city", types: [{ id: "Q5", name: "human" }], properties: [] },
    });
    expect(next.entities.columns.byId.city.metadata[0].type[0].uri).toBe(`${WD}Q5`);
  });

  it("is undoable and keeps the operation log", () => {
    const log = { id: "op" } as any;
    const next = extended(cities(), { columns: { region: newColumn() } }, { operationLog: log });
    expect(next._draft.operationRefs).toEqual([log]);
    expect(reducer(next, undo(1)).entities.columns.allIds).toEqual(["city", "note"]);
  });

  it("is not recorded in the history when undoable is false", () => {
    const next = extended(cities(), { columns: { region: newColumn() } }, { undoable: false });
    expect(next._draft.patches).toHaveLength(0);
    expect(next.entities.columns.allIds).toContain("region");
  });
});

describe("modify.fulfilled: replacing the rows", () => {
  const rowsData = () => ({
    rows: {
      r1: { cells: { city: { label: "ROME", metadata: [] }, note: { label: "n1", metadata: [] } } },
      r9: { cells: { city: { label: "NEW", metadata: [] } } },
    },
  });

  it("rebuilds the rows with a cell for every column", () => {
    const next = modified(cities(), rowsData());
    expect(next.entities.rows.allIds).toEqual(["r1", "r9"]);
    expect(next.entities.rows.byId.r1.cells.city).toMatchObject({ id: "r1$city", label: "ROME", metadata: [] });
    // r9 has no "note" cell in the answer: it gets an empty one
    expect(next.entities.rows.byId.r9.cells.note).toMatchObject({ id: "r9$note", label: "", metadata: [] });
    expect(next.entities.rows.byId.r2).toBeUndefined();
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("selects the modified column and all its cells", () => {
    const next = modified(cities(), rowsData());
    expect(next.ui.selectedColumnsIds).toEqual({ city: true });
    expect(Object.keys(next.ui.selectedCellIds).sort()).toEqual(["r1$city", "r9$city"]);
    expect(Object.keys(next.ui.selectedColumnCellsIds).sort()).toEqual(["r1$city", "r9$city"]);
  });

  it("leaves the selection alone when the modified column is unknown", () => {
    const next = modified(cities(), rowsData(), { selectedColumnId: "ghost" });
    expect(next.ui.selectedColumnsIds).toEqual({});
  });

  it("leaves the selection alone when no column was selected", () => {
    const next = modified(cities(), rowsData(), { selectedColumnId: undefined });
    expect(next.ui.selectedColumnsIds).toEqual({});
  });

  it("is undoable and keeps the operation log", () => {
    const log = { id: "op" } as any;
    const next = modified(cities(), rowsData(), { operationLog: log });
    expect(next._draft.operationRefs).toEqual([log]);
    expect(reducer(next, undo(1)).entities.rows.allIds).toEqual(["r1", "r2", "r3"]);
  });
});

describe("modify.fulfilled: adding columns", () => {
  const columnsData = (over: Record<string, any> = {}) => ({
    columns: { region: newColumn() },
    meta: {},
    ...over,
  });

  it("inserts the new columns after the modified one", () => {
    const next = modified(cities(), columnsData());
    expect(next.entities.columns.allIds).toEqual(["city", "region", "note"]);
    expect(colCells(next, "region").r1.label).toBe("Lazio");
    expect(next.entities.columns.byId.region.context.wd).toEqual({ uri: WD, total: 1, reconciliated: 1 });
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("appends the new columns when the modified column is unknown", () => {
    const next = modified(cities(), columnsData(), { selectedColumnId: "ghost" });
    expect(next.entities.columns.allIds).toEqual(["city", "note", "region"]);
  });

  it("keeps the metadata of the cells of a column it replaces", () => {
    const answer = {
      columns: {
        note: { label: "note", metadata: [], cells: { r1: { label: "changed", metadata: [] }, r2: null, r3: null } },
      },
    };
    const state = cities();
    const next = modified(state, answer);
    expect(colCells(next, "note").r1.label).toBe("changed");
    expect(next.entities.columns.allIds).toEqual(["city", "note"]);
  });

  it("keeps the matches of the cells of a column it replaces", () => {
    const answer = {
      columns: {
        city: { label: "city", metadata: [], cells: { r1: { label: "Roma", metadata: [] }, r2: null, r3: null } },
      },
    };
    const next = modified(cities(), answer, { selectedColumnId: "note" });
    expect(colCells(next, "city").r1.label).toBe("Roma");
    expect(colCells(next, "city").r1.metadata.map((m: any) => m.id)).toEqual(["wd:Q220", "wd:Q1"]);
    expect(colCells(next, "city").r1.annotationMeta.match.value).toBe(true);
  });

  it("adds the properties found to the modified column", () => {
    const state = buildTable({
      columns: [{ id: "city", metadata: [{}] }],
      rows: { r1: { city: "Rome" } },
    });
    const next = modified(state, {
      columns: { region: { label: "R", metadata: [], cells: { r1: null } } },
      originalColMeta: { originalColName: "city", properties: [{ id: "wd:P1", obj: "region" }] },
    });
    expect(next.entities.columns.byId.city.metadata[0].property).toEqual([{ id: "wd:P1", obj: "region" }]);
    const again = modified(next, {
      columns: { other: { label: "O", metadata: [], cells: { r1: null } } },
      originalColMeta: { originalColName: "city", properties: [{ id: "wd:P2", obj: "other" }] },
    });
    expect(again.entities.columns.byId.city.metadata[0].property.map((p: any) => p.id)).toEqual(["wd:P1", "wd:P2"]);
  });

  it("is not recorded in the history when undoable is false", () => {
    const next = modified(cities(), columnsData(), { undoable: false });
    expect(next._draft.patches).toHaveLength(0);
  });
});
