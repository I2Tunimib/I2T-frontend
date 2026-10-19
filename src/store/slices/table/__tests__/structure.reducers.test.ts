import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer, {
  clearColumnReconciliation,
  copyCell,
  deleteColumn,
  deleteRow,
  deleteSelected,
  pasteCell,
  redo,
  undo,
  updateCellLabel,
  updateColumnCellsLabels,
  updateCurrentTable,
  updateRowSelection,
  updateColumnSelection,
  updateSchema,
  updateTable,
} from "../table.slice";
import { buildTable, cities, colCells, NOW } from "./fixtures";


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

describe("updateCurrentTable", () => {
  it("merges into the table instance and stamps the modification date", () => {
    const next = reducer(cities(), updateCurrentTable({ name: "renamed" } as any));
    expect(next.entities.tableInstance.name).toBe("renamed");
    expect(next.entities.tableInstance.id).toBe("t1");
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });
});

describe("updateTable", () => {
  const payload = (over: Record<string, any> = {}) =>
    ({
      table: { id: "t2", idDataset: "d1", lastModifiedDate: "2025-02-02T00:00:00.000Z" },
      columns: { a: { id: "a", label: "A" }, b: { id: "b", label: "B" } },
      rows: { r1: { id: "r1", cells: {} }, r2: { id: "r2", cells: {} } },
      ...over,
    }) as any;

  it("replaces the entities and remembers the saved date", () => {
    const next = reducer(cities(), updateTable(payload()));
    expect(next.entities.tableInstance).toEqual(payload().table);
    expect(next.entities.columns.allIds).toEqual(["a", "b"]);
    expect(next.entities.rows.allIds).toEqual(["r1", "r2"]);
    expect(next.ui.lastSaved).toBe("2025-02-02T00:00:00.000Z");
  });

  it("forgets the deleted columns of the previous table", () => {
    const dirty = { ...cities(), ui: { ...cities().ui, deletedColumnsIds: { x: "X" } } };
    expect(reducer(dirty, updateTable(payload())).ui.deletedColumnsIds).toEqual({});
  });

  it("follows the saved column order, ignoring unknown columns", () => {
    const next = reducer(cities(), updateTable(payload({ columnOrder: ["b", "ghost", "a"] })));
    expect(next.entities.columns.allIds).toEqual(["b", "a"]);
  });

  it("appends columns missing from the saved order", () => {
    const next = reducer(cities(), updateTable(payload({ columnOrder: ["b"] })));
    expect(next.entities.columns.allIds).toEqual(["b", "a"]);
  });

  it("ignores a column order that is not a list", () => {
    const next = reducer(cities(), updateTable(payload({ columnOrder: "b,a" })));
    expect(next.entities.columns.allIds).toEqual(["a", "b"]);
  });
});

describe("updateSchema", () => {
  const schema = (over: Record<string, any> = {}) =>
    ({
      table: { id: "t1", idDataset: "d1" },
      result: {
        kind_classification: { city: "entity" },
        ner_classification: { city: "LOCATION" },
      },
      ...over,
    }) as any;

  it("stores the classification and marks the schema as done", () => {
    const next = reducer(cities(), updateSchema(schema()));
    expect(next.entities.tableInstance).toEqual({
      id: "t1",
      idDataset: "d1",
      schemaStatus: "DONE",
    });
    expect(next.entities.columns.byId.city.kind).toBe("entity");
    expect(next.entities.columns.byId.city.datatype).toBe("LOCATION");
  });

  it("keeps the previous classification, or unknown, when the result has none", () => {
    const table = buildTable({
      columns: [{ id: "a", kind: "literal", datatype: "NUMBER" }, "b"],
      rows: { r1: { a: "1", b: "x" } },
    });
    const next = reducer(table, updateSchema(schema({ result: { kind_classification: {}, ner_classification: {} } })));
    expect(next.entities.columns.byId.a.kind).toBe("literal");
    expect(next.entities.columns.byId.a.datatype).toBe("NUMBER");
    expect(next.entities.columns.byId.b.kind).toBe("unknown");
    expect(next.entities.columns.byId.b.datatype).toBe("unknown");
  });

  it("cleans byte-order marks and spaces from column ids and labels", () => {
    const table = buildTable({
      columns: [{ id: "﻿city", label: "﻿ City " }],
      rows: { r1: { "﻿city": "Rome" } },
    });
    const next = reducer(table, updateSchema(schema()));
    expect(next.entities.columns.allIds).toEqual(["city"]);
    expect(next.entities.columns.byId.city.id).toBe("city");
    expect(next.entities.columns.byId.city.label).toBe("City");
    expect(Object.keys(next.entities.rows.byId.r1.cells)).toEqual(["city"]);
    expect(next.entities.columns.byId.city.kind).toBe("entity");
  });

  it("falls back to the id when a column has no label", () => {
    const table = buildTable({ columns: ["a"], rows: { r1: { a: "x" } } });
    delete (table.entities.columns.byId.a as any).label;
    const next = reducer(table, updateSchema(schema()));
    expect(next.entities.columns.byId.a.label).toBe("a");
  });
});

describe("cell labels", () => {
  it("updateColumnCellsLabels sets many labels and stamps the date", () => {
    const next = reducer(
      cities(),
      updateColumnCellsLabels({
        updates: [
          { cellId: "r1$city", value: "Roma" },
          { cellId: "r2$city", value: "Parigi" },
          { cellId: "r2$ghost", value: "skipped" },
        ],
      }),
    );
    expect(colCells(next, "city").r1.label).toBe("Roma");
    expect(colCells(next, "city").r2.label).toBe("Parigi");
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("is undoable", () => {
    const next = reducer(
      cities(),
      updateColumnCellsLabels({ updates: [{ cellId: "r1$city", value: "Roma" }] }),
    );
    expect(colCells(reducer(next, undo(1)), "city").r1.label).toBe("Rome");
  });
});

describe("copy and paste", () => {
  it("pastes the copied label, metadata and annotation into another cell", () => {
    const copied = reducer(cities(), copyCell({ cellId: "r1$city" }));
    expect(copied.ui.tmpCell?.label).toBe("Rome");
    const pasted = reducer(copied, pasteCell({ cellId: "r3$city" }));
    const cell = colCells(pasted, "city").r3;
    expect(cell.id).toBe("r3$city");
    expect(cell.label).toBe("Rome");
    expect(cell.metadata.map((m: any) => m.id)).toEqual(["wd:Q220", "wd:Q1"]);
    expect(cell.annotationMeta.match.value).toBe(true);
    expect(pasted.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("pasting without a copied cell changes nothing", () => {
    const state = cities();
    const next = reducer(state, pasteCell({ cellId: "r3$city" }));
    expect(next.entities.rows).toEqual(state.entities.rows);
  });

  it("paste is undoable", () => {
    const pasted = reducer(reducer(cities(), copyCell({ cellId: "r1$city" })), pasteCell({ cellId: "r3$city" }));
    expect(colCells(reducer(pasted, undo(1)), "city").r3.label).toBe("Berlin");
  });
});

describe("deleteRow", () => {
  it("removes the row and clears row and cell selection", () => {
    const selected = reducer(cities(), updateRowSelection({ id: "r2" }));
    const next = reducer(selected, deleteRow({ rowId: "r2" }));
    expect(next.entities.rows.allIds).toEqual(["r1", "r3"]);
    expect(next.entities.rows.byId.r2).toBeUndefined();
    expect(next.ui.selectedRowsIds).toEqual({});
    expect(next.ui.selectedCellIds).toEqual({});
  });

  it("is undoable", () => {
    const next = reducer(cities(), deleteRow({ rowId: "r2" }));
    expect(reducer(next, undo(1)).entities.rows.allIds).toEqual(["r1", "r2", "r3"]);
  });
});

describe("deleteColumn", () => {
  it("removes the column, its cells, and remembers it was deleted", () => {
    const selected = reducer(cities(), updateColumnSelection({ id: "city" }));
    const next = reducer(selected, deleteColumn({ colId: "city" }));
    expect(next.entities.columns.allIds).toEqual(["note"]);
    expect(next.entities.columns.byId.city).toBeUndefined();
    expect(Object.keys(next.entities.rows.byId.r1.cells)).toEqual(["note"]);
    expect(next.ui.deletedColumnsIds).toEqual({ city: "city" });
    expect(next.ui.selectedColumnsIds).toEqual({});
    expect(next.ui.selectedCellIds).toEqual({});
  });

  it("remembers the label of the deleted column", () => {
    const table = buildTable({ columns: [{ id: "c", label: "City" }, "d"], rows: { r1: { c: "x", d: "y" } } });
    expect(reducer(table, deleteColumn({ colId: "c" })).ui.deletedColumnsIds).toEqual({ c: "City" });
  });

  it("tolerates a column that does not exist", () => {
    const next = reducer(cities(), deleteColumn({ colId: "ghost" }));
    expect(next.entities.columns.allIds).toEqual(["city", "note"]);
    expect(next.ui.deletedColumnsIds).toEqual({});
  });

  it("is undoable", () => {
    const next = reducer(cities(), deleteColumn({ colId: "city" }));
    expect(reducer(next, undo(1)).entities.columns.allIds).toEqual(["city", "note"]);
  });
});

describe("deleteSelected", () => {
  it("deletes the selected rows and their cells from the counters", () => {
    const selected = reducer(cities(), updateRowSelection({ id: "r1" }));
    const next = reducer(selected, deleteSelected({}));
    expect(next.entities.rows.allIds).toEqual(["r2", "r3"]);
    // the matched Rome row is gone: Paris is the only annotated city left
    expect(next.entities.columns.byId.city.context.wd).toMatchObject({ total: 1, reconciliated: 0 });
    expect(next.entities.columns.byId.city.status).toBe("pending");
    expect(next.entities.columns.byId.note.status).toBe("empty");
    expect(next.entities.tableInstance).toMatchObject({ nCells: 4, nCellsReconciliated: 0 });
    expect(next.ui.selectedRowsIds).toEqual({});
    expect(next.ui.selectedCellIds).toEqual({});
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("deletes the selected columns and remembers them", () => {
    const selected = reducer(cities(), updateColumnSelection({ id: "city" }));
    const next = reducer(selected, deleteSelected({}));
    expect(next.entities.columns.allIds).toEqual(["note"]);
    expect(next.ui.deletedColumnsIds).toEqual({ city: "city" });
    expect(next.entities.tableInstance).toMatchObject({ nCells: 3, nCellsReconciliated: 0 });
  });

  it("deletes columns and rows together when both are selected", () => {
    let state = reducer(cities(), updateColumnSelection({ id: "city" }));
    state = reducer(state, updateRowSelection({ id: "r1", multi: true }));
    const next = reducer(state, deleteSelected({}));
    expect(next.entities.columns.allIds).toEqual(["note"]);
    expect(next.entities.rows.allIds).toEqual(["r2", "r3"]);
  });

  it("deletes nothing when single cells are selected", () => {
    const state = {
      ...cities(),
      ui: { ...cities().ui, selectedCellIds: { "r1$city": true } },
    };
    const next = reducer(state, deleteSelected({}));
    expect(next.entities.rows.allIds).toEqual(["r1", "r2", "r3"]);
    expect(next.entities.columns.allIds).toEqual(["city", "note"]);
  });

  it("is undoable", () => {
    const selected = reducer(cities(), updateRowSelection({ id: "r1" }));
    const next = reducer(selected, deleteSelected({}));
    expect(reducer(next, undo(1)).entities.rows.allIds).toEqual(["r1", "r2", "r3"]);
  });
});

describe("clearColumnReconciliation", () => {
  it("removes all reconciliation from the column and its cells", () => {
    const next = reducer(cities(), clearColumnReconciliation({ colId: "city" }));
    const column = next.entities.columns.byId.city;
    expect(column.context).toEqual({});
    expect(column.status).toBe("empty");
    expect(column.annotationMeta).toEqual({
      annotated: false,
      match: { value: false },
      highestScore: 0,
      lowestScore: 0,
    });
    Object.values(colCells(next, "city")).forEach((cell: any) => {
      expect(cell.metadata).toEqual([]);
      expect(cell.annotationMeta.annotated).toBe(false);
    });
    expect(next.entities.tableInstance).toMatchObject({
      nCellsReconciliated: 0,
      minMetaScore: 0,
      maxMetaScore: 0,
    });
  });

  it("forgets which reconciler annotated the column", () => {
    const table = buildTable({ columns: [{ id: "a", reconciler: "wikidata" }], rows: { r1: { a: "x" } } });
    const next = reducer(table, clearColumnReconciliation({ colId: "a" }));
    expect(next.entities.columns.byId.a).not.toHaveProperty("reconciler");
  });

  it("is not undoable", () => {
    const next = reducer(cities(), clearColumnReconciliation({ colId: "city" }));
    expect(next._draft.patches).toHaveLength(0);
  });
});

describe("undo and redo", () => {
  const relabel = (state: any, value: string) =>
    reducer(state, updateCellLabel({ cellId: "r1$city", value }));
  const label = (state: any) => colCells(state, "city").r1.label;

  it("undo reverts one step by default and redo re-applies it", () => {
    const state = relabel(relabel(cities(), "A"), "B");
    const undone = reducer(state, undo(0));
    expect(label(undone)).toBe("A");
    expect(label(reducer(undone, redo()))).toBe("B");
  });

  it("undo can revert several steps at once", () => {
    const state = relabel(relabel(cities(), "A"), "B");
    expect(label(reducer(state, undo(2)))).toBe("Rome");
  });

  it("undo clears the selection and stamps the modification date", () => {
    const state = { ...relabel(cities(), "A") };
    const selected = reducer(state, updateColumnSelection({ id: "city" }));
    const undone = reducer(selected, undo(1));
    expect(undone.ui.selectedColumnsIds).toEqual({});
    expect(undone.ui.selectedCellIds).toEqual({});
    expect(undone.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("undo with nothing to undo changes nothing", () => {
    const state = cities();
    expect(reducer(state, undo(1))).toEqual(state);
  });

  it("redo with nothing to redo changes nothing", () => {
    const state = relabel(cities(), "A");
    expect(reducer(state, redo())).toEqual(state);
  });

  it("a new change after an undo discards the redo history", () => {
    const undone = reducer(relabel(cities(), "A"), undo(1));
    const changed = relabel(undone, "C");
    expect(label(reducer(changed, redo()))).toBe("C");
  });
});
