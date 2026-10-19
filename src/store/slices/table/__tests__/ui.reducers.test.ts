import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer, {
  addTutorialBox,
  clearDeletedColumns,
  restoreInitialState,
  setGraphTutorialStart,
  setHelpStart,
  updateCellEditable,
  updateColumnEditable,
  updateColumnVisibility,
  updateDependencies,
  updateSelectedCellExpanded,
  updateUI,
} from "../table.slice";
import { buildTable, cities, initial, NOW } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("restoreInitialState", () => {
  it("resets entities, ui and history", () => {
    const dirty = reducer(cities(), updateUI({ denseView: false } as any));
    expect(reducer(dirty, restoreInitialState())).toEqual(initial());
  });
});

describe("updateUI", () => {
  it("merges the given fields into the ui state", () => {
    const next = reducer(initial(), updateUI({ denseView: false, view: "graph" }));
    expect(next.ui.denseView).toBe(false);
    expect(next.ui.view).toBe("graph");
    expect(next.ui.headerExpanded).toBe(false);
  });

  it("merges settings one level deep instead of replacing them", () => {
    const next = reducer(initial(), updateUI({ settings: { isViewOnly: true } }));
    expect(next.ui.settings).toEqual({
      isViewOnly: true,
      isScoreLowerBoundEnabled: true,
      scoreLowerBound: 0.35,
    });
  });

  it("drops the undoable flag", () => {
    const next = reducer(initial(), updateUI({ undoable: true, denseView: false } as any));
    expect(next.ui).not.toHaveProperty("undoable");
  });
});

describe("dialog and tutorial state", () => {
  it("setHelpStart", () => {
    expect(reducer(initial(), setHelpStart("tutorial")).ui.helpStart).toBe("tutorial");
  });

  it("setGraphTutorialStart", () => {
    expect(reducer(initial(), setGraphTutorialStart("tutorial")).ui.graphTutorialStart).toBe(
      "tutorial",
    );
  });

  it("addTutorialBox stores a bounding box by id", () => {
    const bbox = { height: 1, width: 2, x: 3, y: 4, bottom: 5, left: 6, right: 7, top: 8 };
    const next = reducer(initial(), addTutorialBox({ id: "box", bbox }));
    expect(next.ui.tutorialBBoxes).toEqual({ box: bbox });
  });

  it("updateColumnVisibility", () => {
    const next = reducer(initial(), updateColumnVisibility({ id: "city", isVisible: false }));
    expect(next.ui.columnVisibility).toEqual({ city: false });
  });

  it("updateDependencies stores and clears the dependency graph", () => {
    const graph = { nodes: {} } as any;
    const set = reducer(initial(), updateDependencies(graph));
    expect(set.dependencies).toBe(graph);
    expect(reducer(set, updateDependencies(null)).dependencies).toBeNull();
  });
});

describe("clearDeletedColumns", () => {
  it("empties the deleted columns", () => {
    const dirty = reducer(initial(), updateUI({ deletedColumnsIds: { c1: "A" } }));
    expect(reducer(dirty, clearDeletedColumns()).ui.deletedColumnsIds).toEqual({});
  });
});

describe("editable cells and columns", () => {
  it("updateCellEditable toggles a cell", () => {
    const on = reducer(cities(), updateCellEditable({ cellId: "r1$city" }));
    expect(on.ui.editableCellsIds).toEqual({ "r1$city": true });
    expect(reducer(on, updateCellEditable({ cellId: "r1$city" })).ui.editableCellsIds).toEqual({});
  });

  it("updateColumnEditable toggles a column", () => {
    const on = reducer(cities(), updateColumnEditable({ colId: "city" }));
    expect(on.ui.editableCellsIds).toEqual({ city: true });
    expect(reducer(on, updateColumnEditable({ colId: "city" })).ui.editableCellsIds).toEqual({});
  });
});

describe("updateSelectedCellExpanded", () => {
  const selected = (ui: Record<string, any>) => reducer(cities(), updateUI(ui as any));

  it("expands the columns of selected cells, columns and column cells", () => {
    const next = reducer(
      selected({
        selectedCellIds: { "r1$city": true },
        selectedColumnsIds: { note: true },
        selectedColumnCellsIds: { other: true },
      }),
      updateSelectedCellExpanded({}),
    );
    expect(Object.keys(next.ui.expandedColumnsIds).sort()).toEqual(["city", "note", "other"]);
  });

  it("collapses columns that were already expanded", () => {
    const opened = reducer(
      selected({ selectedColumnsIds: { city: true } }),
      updateSelectedCellExpanded({}),
    );
    const closed = reducer(opened, updateSelectedCellExpanded({}));
    expect(closed.ui.expandedColumnsIds).toEqual({});
  });

  it("counts every expansion so views can redraw", () => {
    const state = selected({ selectedColumnsIds: { city: true } });
    const first = reducer(state, updateSelectedCellExpanded({}));
    const second = reducer(first, updateSelectedCellExpanded({}));
    expect([first.ui.expandRevision, second.ui.expandRevision]).toEqual([1, 2]);
  });

  it("does nothing to the columns when nothing is selected", () => {
    const next = reducer(buildTable({ columns: ["a"], rows: { r1: { a: "x" } } }), updateSelectedCellExpanded({}));
    expect(next.ui.expandedColumnsIds).toEqual({});
    expect(next.ui.expandRevision).toBe(1);
  });
});
