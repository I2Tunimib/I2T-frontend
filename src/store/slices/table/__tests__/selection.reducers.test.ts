import { describe, expect, it } from "vitest";
import tableReducer, {
  updateCellSelection,
  updateColumnCellsSelection,
  updateColumnSelection,
  updateRowSelection,
} from "../table.slice";
import { TableState } from "../interfaces/table";
import { buildTable, cities } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

/** The five selection maps, as sorted id lists. */
const sel = (state: TableState) => ({
  columns: Object.keys(state.ui.selectedColumnsIds).sort(),
  columnCells: Object.keys(state.ui.selectedColumnCellsIds).sort(),
  rows: Object.keys(state.ui.selectedRowsIds).sort(),
  cells: Object.keys(state.ui.selectedCellIds).sort(),
});

const CITY_CELLS = ["r1$city", "r2$city", "r3$city"];
const NOTE_CELLS = ["r1$note", "r2$note", "r3$note"];
const ALL_ROWS = ["r1", "r2", "r3"];

describe("column selection", () => {
  it("selecting a column selects its header and all its cells", () => {
    const next = reducer(cities(), updateColumnSelection({ id: "city" }));
    expect(sel(next)).toEqual({
      columns: ["city"],
      columnCells: [],
      rows: [],
      cells: CITY_CELLS,
    });
  });

  it("selecting the selected column again clears the selection", () => {
    const once = reducer(cities(), updateColumnSelection({ id: "city" }));
    const twice = reducer(once, updateColumnSelection({ id: "city" }));
    expect(sel(twice)).toEqual({ columns: [], columnCells: [], rows: [], cells: [] });
  });

  it("selecting another column replaces the selection", () => {
    const once = reducer(cities(), updateColumnSelection({ id: "city" }));
    const next = reducer(once, updateColumnSelection({ id: "note" }));
    expect(sel(next).columns).toEqual(["note"]);
    expect(sel(next).cells).toEqual(NOTE_CELLS);
  });

  it("selecting the only column also selects every row", () => {
    const single = buildTable({ columns: ["a"], rows: { r1: { a: "x" }, r2: { a: "y" } } });
    const next = reducer(single, updateColumnSelection({ id: "a" }));
    expect(sel(next).rows).toEqual(["r1", "r2"]);
  });

  describe("multi", () => {
    it("adds a column and keeps the cells of the other selected columns", () => {
      const once = reducer(cities(), updateColumnSelection({ id: "city" }));
      const next = reducer(once, updateColumnSelection({ id: "note", multi: true }));
      expect(sel(next).columns).toEqual(["city", "note"]);
      expect(sel(next).cells).toEqual([...CITY_CELLS, ...NOTE_CELLS].sort());
      // every column is selected now, so every row is too
      expect(sel(next).rows).toEqual(ALL_ROWS);
    });

    it("removes a selected column with its cells and any selected rows", () => {
      let state = reducer(cities(), updateColumnSelection({ id: "city" }));
      state = reducer(state, updateColumnSelection({ id: "note", multi: true }));
      const next = reducer(state, updateColumnSelection({ id: "note", multi: true }));
      expect(sel(next).columns).toEqual(["city"]);
      expect(sel(next).cells).toEqual(CITY_CELLS);
      expect(sel(next).rows).toEqual([]);
    });
  });
});

describe("column cells selection", () => {
  it("selects the column, its cells and marks it as a column-cells selection", () => {
    const next = reducer(cities(), updateColumnCellsSelection({ id: "city" }));
    expect(sel(next)).toEqual({
      columns: ["city"],
      columnCells: ["city"],
      rows: [],
      cells: CITY_CELLS,
    });
  });

  it("selecting it again clears everything", () => {
    const once = reducer(cities(), updateColumnCellsSelection({ id: "city" }));
    const twice = reducer(once, updateColumnCellsSelection({ id: "city" }));
    expect(sel(twice)).toEqual({ columns: [], columnCells: [], rows: [], cells: [] });
  });

  it("multi adds another column-cells selection", () => {
    const once = reducer(cities(), updateColumnCellsSelection({ id: "city" }));
    const next = reducer(once, updateColumnCellsSelection({ id: "note", multi: true }));
    expect(sel(next).columnCells).toEqual(["city", "note"]);
    expect(sel(next).columns).toEqual(["city", "note"]);
  });

  it("multi on a selected column-cells selection removes it", () => {
    let state = reducer(cities(), updateColumnCellsSelection({ id: "city" }));
    state = reducer(state, updateColumnCellsSelection({ id: "note", multi: true }));
    const next = reducer(state, updateColumnCellsSelection({ id: "note", multi: true }));
    expect(sel(next).columnCells).toEqual(["city"]);
    expect(sel(next).cells).toEqual(CITY_CELLS);
  });
});

describe("cell selection", () => {
  it("selecting a cell replaces every other selection", () => {
    const column = reducer(cities(), updateColumnCellsSelection({ id: "city" }));
    const next = reducer(column, updateCellSelection({ id: "r2$note" }));
    expect(sel(next)).toEqual({ columns: [], columnCells: [], rows: [], cells: ["r2$note"] });
  });

  describe("multi", () => {
    it("adds cells to the selection", () => {
      let state = reducer(cities(), updateCellSelection({ id: "r1$city" }));
      state = reducer(state, updateCellSelection({ id: "r2$city", multi: true }));
      expect(sel(state).cells).toEqual(["r1$city", "r2$city"]);
      expect(sel(state).columns).toEqual([]);
    });

    it("selecting the last cell of a column selects the column", () => {
      let state = reducer(cities(), updateCellSelection({ id: "r1$city" }));
      state = reducer(state, updateCellSelection({ id: "r2$city", multi: true }));
      state = reducer(state, updateCellSelection({ id: "r3$city", multi: true }));
      expect(sel(state).columns).toEqual(["city"]);
    });

    it("does not mistake a column whose id ends with another column id", () => {
      // cell "r1$ba" ends with "a" but belongs to column "ba"
      const table = buildTable({
        columns: ["ba", "a"],
        rows: { r1: { ba: "y", a: "x" } },
      });
      const next = reducer(table, updateRowSelection({ id: "r1" }));
      expect(sel(next).columns).toEqual(["a", "ba"]);
    });

    it("deselecting a cell also deselects its column and row", () => {
      let state = reducer(cities(), updateColumnSelection({ id: "city" }));
      state = reducer(state, updateRowSelection({ id: "r1", multi: true }));
      expect(sel(state).rows).toEqual(["r1"]);
      const next = reducer(state, updateCellSelection({ id: "r1$city", multi: true }));
      expect(sel(next).cells).not.toContain("r1$city");
      expect(sel(next).columns).not.toContain("city");
      expect(sel(next).rows).not.toContain("r1");
    });

    it("deselecting a cell keeps unrelated columns and rows", () => {
      let state = reducer(cities(), updateCellSelection({ id: "r1$city" }));
      state = reducer(state, updateCellSelection({ id: "r2$note", multi: true }));
      const next = reducer(state, updateCellSelection({ id: "r1$city", multi: true }));
      expect(sel(next).cells).toEqual(["r2$note"]);
    });
  });
});

describe("row selection", () => {
  it("selecting a row selects all its cells", () => {
    const next = reducer(cities(), updateRowSelection({ id: "r1" }));
    expect(sel(next)).toEqual({
      columns: [],
      columnCells: [],
      rows: ["r1"],
      cells: ["r1$city", "r1$note"],
    });
  });

  it("selecting a row in a one-row table also selects its columns", () => {
    const single = buildTable({ columns: ["a", "b"], rows: { r1: { a: "x", b: "y" } } });
    const next = reducer(single, updateRowSelection({ id: "r1" }));
    expect(sel(next).columns).toEqual(["a", "b"]);
  });

  it("selecting another row replaces the selection", () => {
    const once = reducer(cities(), updateRowSelection({ id: "r1" }));
    const next = reducer(once, updateRowSelection({ id: "r2" }));
    expect(sel(next).rows).toEqual(["r2"]);
    expect(sel(next).cells).toEqual(["r2$city", "r2$note"]);
  });

  describe("multi", () => {
    it("adds a row and its cells", () => {
      const once = reducer(cities(), updateRowSelection({ id: "r1" }));
      const next = reducer(once, updateRowSelection({ id: "r2", multi: true }));
      expect(sel(next).rows).toEqual(["r1", "r2"]);
      expect(sel(next).cells).toEqual(["r1$city", "r1$note", "r2$city", "r2$note"]);
    });

    it("selecting every row selects every column", () => {
      let state = reducer(cities(), updateRowSelection({ id: "r1" }));
      state = reducer(state, updateRowSelection({ id: "r2", multi: true }));
      state = reducer(state, updateRowSelection({ id: "r3", multi: true }));
      expect(sel(state).columns).toEqual(["city", "note"]);
    });

    it("removes a selected row, its cells and the columns it completed", () => {
      let state = reducer(cities(), updateRowSelection({ id: "r1" }));
      state = reducer(state, updateRowSelection({ id: "r2", multi: true }));
      state = reducer(state, updateRowSelection({ id: "r3", multi: true }));
      const next = reducer(state, updateRowSelection({ id: "r2", multi: true }));
      expect(sel(next).rows).toEqual(["r1", "r3"]);
      expect(sel(next).columns).toEqual([]);
      expect(sel(next).cells).toEqual(["r1$city", "r1$note", "r3$city", "r3$note"]);
    });
  });
});
