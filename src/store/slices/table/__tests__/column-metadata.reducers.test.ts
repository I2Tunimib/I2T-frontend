import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer, {
  addColumnMetadata,
  addColumnType,
  deleteColumnMetadata,
  undo,
  updateColumnDatatype,
  updateColumnKind,
  updateColumnMetadata,
  updateColumnPropertyMetadata,
  updateColumnRole,
  updateColumnTypeMatches,
  updateUI,
} from "../table.slice";
import { buildTable, NOW } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const entity = (id: string, match = false) => ({
  id,
  match,
  score: 0.5,
  name: { value: id, uri: `http://kg/${id}` },
});
const property = (id: string, obj: string, match = false) => ({ ...entity(id, match), obj });

const table = (over: Record<string, any> = {}) =>
  buildTable({
    columns: [
      { id: "city", ...over },
      { id: "country", role: "subject" },
    ],
    rows: { r1: { city: "Rome", country: "Italy" } },
  });
const column = (state: ReturnType<typeof table>, id = "city"): any => state.entities.columns.byId[id];

describe("updateColumnKind / updateColumnDatatype", () => {
  it("sets the kind and stamps the date", () => {
    const next = reducer(table(), updateColumnKind({ colId: "city", kind: "entity" }));
    expect(column(next).kind).toBe("entity");
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("sets the datatype", () => {
    const next = reducer(table(), updateColumnDatatype({ colId: "city", datatype: "LOCATION" }));
    expect(column(next).datatype).toBe("LOCATION");
  });

  it("are undoable", () => {
    const kind = reducer(table(), updateColumnKind({ colId: "city", kind: "entity" }));
    expect(column(reducer(kind, undo(1))).kind).toBeUndefined();
    const dt = reducer(table(), updateColumnDatatype({ colId: "city", datatype: "LOCATION" }));
    expect(column(reducer(dt, undo(1))).datatype).toBeUndefined();
  });
});

describe("updateColumnRole", () => {
  it("gives the role to one column and takes it from the others", () => {
    const next = reducer(table(), updateColumnRole({ colId: "city", role: "subject" }));
    expect(column(next, "city").role).toBe("subject");
    expect(column(next, "country").role).toBeUndefined();
  });

  it('"none" clears one column without touching the others', () => {
    const next = reducer(table(), updateColumnRole({ colId: "country", role: "none" }));
    expect(column(next, "country").role).toBe("none");
    expect(column(next, "city").role).toBeUndefined();
  });

  it("is undoable", () => {
    const next = reducer(table(), updateColumnRole({ colId: "city", role: "subject" }));
    expect(column(reducer(next, undo(1)), "country").role).toBe("subject");
  });
});

describe("addColumnMetadata: entity", () => {
  const value = (over: Record<string, any> = {}) => ({
    id: "wd:Q220",
    name: "Rome",
    uri: "http://www.wikidata.org/entity/Q220",
    score: 1,
    match: "true",
    description: "city",
    ...over,
  });
  const add = (state: ReturnType<typeof table>, v = value()) =>
    reducer(state, addColumnMetadata({ colId: "city", type: "entity", prefix: "wd", value: v } as any));

  it("adds the entity and creates the context of its prefix", () => {
    const next = add(table());
    expect(column(next).metadata[0].entity).toEqual([
      {
        id: "wd:Q220",
        match: true,
        name: { value: "Rome", uri: "http://www.wikidata.org/entity/Q220" },
        score: 1,
        description: "city",
      },
    ]);
    expect(column(next).context.wd).toEqual({
      reconciliated: 0,
      total: 0,
      uri: "http://www.wikidata.org/entity/",
    });
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("keeps an existing context", () => {
    const state = table({ context: { wd: { reconciliated: 3, total: 5, uri: "x" } } });
    expect(column(add(state)).context.wd).toEqual({ reconciliated: 3, total: 5, uri: "x" });
  });

  it("a matching entity unmatches the previous ones", () => {
    const state = add(table(), value({ id: "wd:Q1", match: "true" }));
    const next = add(state, value({ id: "wd:Q2", match: "true" }));
    expect(column(next).metadata[0].entity.map((e: any) => [e.id, e.match])).toEqual([
      ["wd:Q1", false],
      ["wd:Q2", true],
    ]);
  });

  it("a non matching entity leaves the previous ones alone", () => {
    const state = add(table(), value({ id: "wd:Q1", match: "true" }));
    const next = add(state, value({ id: "wd:Q2", match: "false" }));
    expect(column(next).metadata[0].entity.map((e: any) => [e.id, e.match])).toEqual([
      ["wd:Q1", true],
      ["wd:Q2", false],
    ]);
  });

  it("is undoable", () => {
    expect(column(reducer(add(table()), undo(1))).metadata).toEqual([]);
  });
});

describe("addColumnMetadata: property", () => {
  const value = (over: Record<string, any> = {}) => ({
    id: "wd:P17",
    name: "country",
    uri: "http://www.wikidata.org/entity/P17",
    obj: "country",
    subj: "city",
    prefix: "wd",
    score: 1,
    match: "true",
    description: "the country",
    ...over,
  });
  const add = (state: ReturnType<typeof table>, v = value()) =>
    reducer(state, addColumnMetadata({ colId: "city", type: "property", value: v } as any));

  it("adds the property to the subject column and makes it the subject", () => {
    const next = add(table());
    expect(column(next).role).toBe("subject");
    expect(column(next, "country").role).toBeUndefined();
    expect(column(next).metadata[0].property).toEqual([
      {
        id: "wd:P17",
        name: "country",
        obj: "country",
        match: true,
        score: 1,
        decider: "human",
      },
    ]);
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("creates the property context, pointing at the property namespace on wiki urls", () => {
    const wiki = add(table(), value({ uri: "https://www.wikidata.org/wiki/Property:P17" }));
    expect(column(wiki).context.wd.uri).toBe("https://www.wikidata.org/wiki/Property:");
    const other = add(table(), value({ uri: "http://kg.example/props/P17" }));
    expect(column(other).context.wd.uri).toBe("http://kg.example/props/");
  });

  it("keeps an existing property context", () => {
    const state = table({ context: { wd: { reconciliated: 1, total: 2, uri: "keep" } } });
    expect(column(add(state)).context.wd.uri).toBe("keep");
  });

  it("a matching property matches the existing ones", () => {
    const state = table({ metadata: [{ property: [property("wd:P1", "x", false)] }] });
    const next = add(state);
    expect(column(next).metadata[0].property.map((p: any) => [p.id, p.match])).toEqual([
      ["wd:P1", true],
      ["wd:P17", true],
    ]);
  });

  it("a non matching property leaves the existing ones alone", () => {
    const state = table({ metadata: [{ property: [property("wd:P1", "x", false)] }] });
    const next = add(state, value({ match: "false" }));
    expect(column(next).metadata[0].property.map((p: any) => [p.id, p.match])).toEqual([
      ["wd:P1", false],
      ["wd:P17", false],
    ]);
  });

  it("is undoable", () => {
    expect(column(reducer(add(table()), undo(1))).metadata).toEqual([]);
  });
});

describe("addColumnMetadata: other types", () => {
  it("does nothing for an unknown type", () => {
    const state = table();
    const next = reducer(state, addColumnMetadata({ colId: "city", type: "type", value: {} } as any));
    expect(next.entities).toEqual(state.entities);
  });
});

describe("deleteColumnMetadata", () => {
  it("removes an entity by id", () => {
    const state = table({ metadata: [{ entity: [entity("wd:Q1"), entity("wd:Q2")] }] });
    const next = reducer(state, deleteColumnMetadata({ colId: "city", type: "entity", metadataId: "wd:Q1" }));
    expect(column(next).metadata[0].entity.map((e: any) => e.id)).toEqual(["wd:Q2"]);
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("does nothing when the column has no entities", () => {
    const state = table({ metadata: [{ entity: [] }] });
    const next = reducer(state, deleteColumnMetadata({ colId: "city", type: "entity", metadataId: "x" }));
    expect(next.entities).toEqual(state.entities);
  });

  it("removes a property by id and target column", () => {
    const state = table({
      metadata: [{ property: [property("wd:P1", "a"), property("wd:P1", "b")] }],
    });
    const next = reducer(
      state,
      deleteColumnMetadata({ colId: "city", type: "property", metadataId: "wd:P1", obj: "a" }),
    );
    expect(column(next).metadata[0].property.map((p: any) => p.obj)).toEqual(["b"]);
    expect(column(next).role).toBeUndefined();
  });

  it("removing the last property clears the column role", () => {
    const state = table({ role: "subject", metadata: [{ property: [property("wd:P1", "a")] }] });
    const next = reducer(
      state,
      deleteColumnMetadata({ colId: "city", type: "property", metadataId: "wd:P1", obj: "a" }),
    );
    expect(column(next).metadata[0].property).toEqual([]);
    expect(column(next).role).toBe("");
  });

  it("does nothing when the column has no property list", () => {
    const state = table({ metadata: [] });
    const next = reducer(
      state,
      deleteColumnMetadata({ colId: "city", type: "property", metadataId: "x", obj: "y" }),
    );
    expect(next.entities).toEqual(state.entities);
  });

  it("is undoable", () => {
    const state = table({ metadata: [{ entity: [entity("wd:Q1")] }] });
    const next = reducer(state, deleteColumnMetadata({ colId: "city", type: "entity", metadataId: "wd:Q1" }));
    expect(column(reducer(next, undo(1))).metadata[0].entity).toHaveLength(1);
  });
});

describe("updateColumnMetadata (entities)", () => {
  const state = () => table({ metadata: [{ entity: [entity("wd:Q1", true), entity("wd:Q2")] }] });

  it("matches an entity and unmatches the others", () => {
    const next = reducer(state(), updateColumnMetadata({ colId: "city", metadataId: "wd:Q2" }));
    expect(column(next).metadata[0].entity.map((e: any) => e.match)).toEqual([false, true]);
    expect(column(next).annotationMeta.match).toEqual({ value: true, reason: "manual" });
  });

  it("unmatches a matched entity when toggled", () => {
    const next = reducer(state(), updateColumnMetadata({ colId: "city", metadataId: "wd:Q1" }));
    expect(column(next).metadata[0].entity.map((e: any) => e.match)).toEqual([false, false]);
    expect(column(next).annotationMeta.match).toEqual({ value: false });
  });

  it("does nothing when the column has no entities", () => {
    const empty = table({ metadata: [] });
    const next = reducer(empty, updateColumnMetadata({ colId: "city", metadataId: "x" }));
    expect(next.entities).toEqual(empty.entities);
  });

  it("is undoable", () => {
    const next = reducer(state(), updateColumnMetadata({ colId: "city", metadataId: "wd:Q2" }));
    expect(column(reducer(next, undo(1))).metadata[0].entity.map((e: any) => e.match)).toEqual([true, false]);
  });
});

describe("updateColumnPropertyMetadata", () => {
  const state = () =>
    table({ metadata: [{ property: [property("wd:P1", "a", true), property("wd:P1", "b")] }] });

  it("toggles one property, identified by id and target column", () => {
    const next = reducer(state(), updateColumnPropertyMetadata({ colId: "city", metadataId: "wd:P1", obj: "b" }));
    expect(column(next).metadata[0].property.map((p: any) => p.match)).toEqual([true, true]);
    expect(column(next).annotationMeta.match).toEqual({ value: true, reason: "manual" });
  });

  it("unmatches a matched property", () => {
    const next = reducer(state(), updateColumnPropertyMetadata({ colId: "city", metadataId: "wd:P1", obj: "a" }));
    expect(column(next).metadata[0].property.map((p: any) => p.match)).toEqual([false, false]);
    expect(column(next).annotationMeta.match).toEqual({ value: false });
  });

  it("does nothing when the column has no properties", () => {
    const empty = table({ metadata: [{ property: [] }] });
    const next = reducer(empty, updateColumnPropertyMetadata({ colId: "city", metadataId: "x", obj: "y" }));
    expect(next.entities).toEqual(empty.entities);
  });

  it("is undoable", () => {
    const next = reducer(state(), updateColumnPropertyMetadata({ colId: "city", metadataId: "wd:P1", obj: "b" }));
    expect(column(reducer(next, undo(1))).metadata[0].property.map((p: any) => p.match)).toEqual([true, false]);
  });
});

describe("column types", () => {
  const dialog = (state: ReturnType<typeof table>) => reducer(state, updateUI({ metadataColumnDialogColId: "city" }));

  it("adds a type to the column open in the dialog, matched and human decided", () => {
    const next = reducer(
      dialog(table()),
      addColumnType({
        colId: "city",
        newTypes: [{ id: "wd:Q515", name: "city", uri: "http://x/Q515" }],
      } as any),
    );
    expect(column(next).metadata[0].type).toEqual([
      { match: true, id: "Q515", name: "city", score: 0, decider: "human" },
    ]);
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("keeps ids without a prefix and replaces a type that is added twice", () => {
    const state = dialog(table());
    const first = reducer(state, addColumnType({ colId: "city", newTypes: [{ id: "Q515", name: "city" }] } as any));
    const second = reducer(first, addColumnType({ colId: "city", newTypes: [{ id: "Q515", name: "town" }] } as any));
    expect(column(second).metadata[0].type).toHaveLength(1);
    expect(column(second).metadata[0].type[0].name).toBe("town");
  });

  it("adds to an existing list of types", () => {
    const state = dialog(table({ metadata: [{ type: [{ id: "Q1", name: "a", match: false, score: 5 }] }] }));
    const next = reducer(state, addColumnType({ colId: "city", newTypes: [{ id: "Q2", name: "b" }] } as any));
    expect(column(next).metadata[0].type.map((t: any) => t.id)).toEqual(["Q1", "Q2"]);
  });

  it("creates the type list of a column whose metadata has none", () => {
    const state = dialog(table({ metadata: [{}] }));
    const next = reducer(state, addColumnType({ colId: "city", newTypes: [{ id: "Q2", name: "b" }] } as any));
    expect(column(next).metadata[0].type.map((t: any) => t.id)).toEqual(["Q2"]);
  });

  it("falls back to the first column-cells selection without a dialog", () => {
    const state = reducer(table(), updateUI({ selectedColumnCellsIds: { city: true } }));
    const next = reducer(state, addColumnType({ colId: "city", newTypes: [{ id: "Q2", name: "b" }] } as any));
    expect(column(next).metadata[0].type.map((t: any) => t.id)).toEqual(["Q2"]);
  });

  describe("updateColumnTypeMatches", () => {
    const withTypes = () =>
      dialog(
        table({
          metadata: [
            {
              type: [
                { id: "Q1", name: "a", match: true, score: 0 },
                { id: "Q2", name: "b", match: false, score: 40 },
                { id: "Q3", name: "c", match: false, score: 0 },
              ],
            },
          ],
        }),
      );

    it("matches the given types and unmatches the rest", () => {
      const next = reducer(withTypes(), updateColumnTypeMatches({ typeIds: ["Q2", "Q3"] }));
      expect(column(next).metadata[0].type.map((t: any) => [t.id, t.match, t.score])).toEqual([
        ["Q1", false, 0],
        ["Q2", true, 40],
        ["Q3", true, 0],
      ]);
    });

    it("gives a selected type without a score the default score", () => {
      const state = dialog(table({ metadata: [{ type: [{ id: "Q1", name: "a" }] }] }));
      const next = reducer(state, updateColumnTypeMatches({ typeIds: ["Q1"] }));
      expect(column(next).metadata[0].type[0]).toMatchObject({ match: true, score: 100 });
    });

    it("creates the type list when the column has none", () => {
      const next = reducer(dialog(table()), updateColumnTypeMatches({ typeIds: ["Q1"] }));
      expect(column(next).metadata[0].type).toEqual([]);
      const noType = reducer(dialog(table({ metadata: [{}] })), updateColumnTypeMatches({ typeIds: [] }));
      expect(column(noType).metadata[0].type).toEqual([]);
    });

    it("is undoable", () => {
      const next = reducer(withTypes(), updateColumnTypeMatches({ typeIds: ["Q2"] }));
      expect(column(reducer(next, undo(1))).metadata[0].type[0].match).toBe(true);
    });
  });
});
