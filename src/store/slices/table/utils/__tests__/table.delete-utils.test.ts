import { describe, expect, it } from "vitest";
import { produce } from "immer";
import {
  deleteOneColumn,
  deleteOneRow,
  deleteSelectedColumns,
  deleteSelectedRows,
} from "../table.delete-utils";
import { buildTable, cities } from "../../__tests__/fixtures";

const change = (state: any, recipe: (draft: any) => void): any => (produce as any)(state, recipe);

describe("deleteOneColumn", () => {
  it("removes the column and its cells, and remembers its label", () => {
    const table = buildTable({ columns: [{ id: "a", label: "Alpha" }, "b"], rows: { r1: { a: "x", b: "y" } } });
    const next = change(table, (draft) => deleteOneColumn(draft, "a"));
    expect(next.entities.columns.allIds).toEqual(["b"]);
    expect(next.entities.columns.byId.a).toBeUndefined();
    expect(Object.keys(next.entities.rows.byId.r1.cells)).toEqual(["b"]);
    expect(next.ui.deletedColumnsIds).toEqual({ a: "Alpha" });
  });

  it("remembers the id when the column has no label", () => {
    const table = cities();
    table.entities.columns.byId.city.label = "";
    const next = change(table, (draft) => deleteOneColumn(draft, "city"));
    expect(next.ui.deletedColumnsIds).toEqual({ city: "city" });
  });

  it("forgets nothing for a column that does not exist", () => {
    const next = change(cities(), (draft) => deleteOneColumn(draft, "ghost"));
    expect(next.ui.deletedColumnsIds).toEqual({});
    expect(next.entities.columns.allIds).toEqual(["city", "note"]);
  });
});

describe("deleteOneRow", () => {
  it("removes the row", () => {
    const next = change(cities(), (draft) => deleteOneRow(draft, "r2"));
    expect(next.entities.rows.allIds).toEqual(["r1", "r3"]);
    expect(next.entities.rows.byId.r2).toBeUndefined();
  });
});

describe("selected", () => {
  it("deleteSelectedColumns removes every selected column", () => {
    const table = { ...cities(), ui: { ...cities().ui, selectedColumnsIds: { city: true, note: true } } };
    const next = change(table, (draft) => deleteSelectedColumns(draft));
    expect(next.entities.columns.allIds).toEqual([]);
    expect(Object.keys(next.ui.deletedColumnsIds)).toEqual(["city", "note"]);
  });

  it("deleteSelectedRows removes every selected row", () => {
    const table = { ...cities(), ui: { ...cities().ui, selectedRowsIds: { r1: true, r3: true } } };
    const next = change(table, (draft) => deleteSelectedRows(draft));
    expect(next.entities.rows.allIds).toEqual(["r2"]);
  });
});
