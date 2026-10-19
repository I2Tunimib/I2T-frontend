import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer, {
  addCellMetadata,
  clearDeletedColumns,
  redo,
  restoreInitialState,
  undo,
  updateSelectedCellExpanded,
  updateCellLabel,
  updateUI,
} from "../table.slice";
import { TableState } from "../interfaces/table";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

// Characterization tests: they pin the CURRENT behaviour of the table
// reducers so the refactor (see the plan) can be verified against them.
// If a test here fails after a refactor step, behaviour changed.

const NOW = "2026-01-01T00:00:00.000Z";

const initial = (): TableState => reducer(undefined, { type: "@@init" });

/** One column (c1) and two rows (r1, r2) with an empty cell each. */
const withTable = (): TableState => {
  const state = initial();
  const cell = (rowId: string, label: string) => ({
    id: `${rowId}$c1`,
    label,
    metadata: [],
    annotationMeta: {
      annotated: false,
      match: { value: false },
      highestScore: 0,
      lowestScore: 0,
    },
  });
  return {
    ...state,
    entities: {
      ...state.entities,
      columns: {
        byId: {
          c1: {
            id: "c1",
            label: "Name",
            status: "empty",
            context: {},
            annotationMeta: {
              annotated: false,
              match: { value: false },
              highestScore: 0,
              lowestScore: 0,
            },
            metadata: [],
          },
        },
        allIds: ["c1"],
      },
      rows: {
        byId: {
          r1: { id: "r1", cells: { c1: cell("r1", "Rome") } },
          r2: { id: "r2", cells: { c1: cell("r2", "Paris") } },
        },
        allIds: ["r1", "r2"],
      },
    },
  } as unknown as TableState;
};

const cellOf = (state: TableState, rowId: string) =>
  state.entities.rows.byId[rowId].cells.c1;

const manualMatch = {
  cellId: "r1$c1",
  metadataId: "wd:Q220",
  prefix: "wd",
  value: {
    id: "wd:Q220",
    name: "Rome",
    score: 1,
    match: "true",
    uri: "http://www.wikidata.org/entity/Q220",
  },
};

describe("table slice (characterization)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
    // the reducers log a lot; keep test output readable
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("simple reducers", () => {
    it("has the expected initial state", () => {
      expect(initial()).toMatchSnapshot();
    });

    it("restoreInitialState resets everything", () => {
      const dirty = reducer(initial(), updateUI({ denseView: false } as any));
      expect(reducer(dirty, restoreInitialState())).toEqual(initial());
    });

    it("clearDeletedColumns empties deletedColumnsIds", () => {
      const dirty = reducer(
        initial(),
        updateUI({ deletedColumnsIds: { c1: true } } as any),
      );
      expect(
        reducer(dirty, clearDeletedColumns()).ui.deletedColumnsIds,
      ).toEqual({});
    });
  });

  describe("updateSelectedCellExpanded", () => {
    it("toggles the expanded columns and bumps expandRevision each time", () => {
      const selected = reducer(
        withTable(),
        updateUI({ selectedColumnsIds: { c1: true } } as any),
      );
      const open = reducer(selected, updateSelectedCellExpanded({}));
      expect(open.ui.expandedColumnsIds).toEqual({ c1: true });
      expect(open.ui.expandRevision).toBe(1);
      const closed = reducer(open, updateSelectedCellExpanded({}));
      expect(closed.ui.expandedColumnsIds).toEqual({});
      expect(closed.ui.expandRevision).toBe(2);
    });
  });

  describe("updateCellLabel", () => {
    it("changes the label, stops editing and stamps lastModifiedDate", () => {
      const start = reducer(withTable(), updateUI({
        editableCellsIds: { "r1$c1": true },
      } as any));
      const next = reducer(
        start,
        updateCellLabel({ cellId: "r1$c1", value: "Roma" }),
      );
      expect(cellOf(next, "r1").label).toBe("Roma");
      expect(next.ui.editableCellsIds).toEqual({});
      expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
    });

    it("only stops editing when the value is unchanged", () => {
      const start = reducer(withTable(), updateUI({
        editableCellsIds: { "r1$c1": true },
      } as any));
      const next = reducer(
        start,
        updateCellLabel({ cellId: "r1$c1", value: "Rome" }),
      );
      expect(cellOf(next, "r1").label).toBe("Rome");
      expect(next.ui.editableCellsIds).toEqual({});
      expect(next._draft.patches).toHaveLength(0);
    });
  });

  describe("addCellMetadata", () => {
    it("adds a matching metadata item and marks the cell annotated", () => {
      const next = reducer(withTable(), addCellMetadata(manualMatch));
      const cell = cellOf(next, "r1");
      expect(cell.metadata).toEqual([
        {
          id: "wd:Q220",
          match: true,
          name: {
            value: "Rome",
            uri: "http://www.wikidata.org/entity/Q220",
          },
          score: 1,
        },
      ]);
      expect(cell.annotationMeta.annotated).toBe(true);
      expect(cell.annotationMeta.match).toEqual({
        value: true,
        reason: "manual",
      });
      expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
    });

    it("replaces (does not duplicate) metadata with an existing id", () => {
      const once = reducer(withTable(), addCellMetadata(manualMatch));
      const twice = reducer(
        once,
        addCellMetadata({
          ...manualMatch,
          value: { ...manualMatch.value, name: "Roma", match: "false" },
        }),
      );
      const { metadata } = cellOf(twice, "r1");
      expect(metadata).toHaveLength(1);
      expect(metadata[0].match).toBe(false);
      expect(metadata[0].name).toEqual({
        value: "Roma",
        uri: "http://www.wikidata.org/entity/Q220",
      });
    });

    it("un-matches previous items when a new matching one is added", () => {
      const once = reducer(withTable(), addCellMetadata(manualMatch));
      const twice = reducer(
        once,
        addCellMetadata({
          ...manualMatch,
          metadataId: "wd:Q1",
          value: { ...manualMatch.value, id: "wd:Q1", name: "Italy" },
        }),
      );
      const { metadata } = cellOf(twice, "r1");
      expect(metadata.map((m) => [m.id, m.match])).toEqual([
        ["wd:Q220", false],
        ["wd:Q1", true],
      ]);
    });

    it("updates the column context and status", () => {
      const next = reducer(withTable(), addCellMetadata(manualMatch));
      expect(next.entities.columns.byId.c1).toMatchSnapshot();
    });
  });

  describe("undo / redo", () => {
    it("undo reverts an undoable change and redo re-applies it", () => {
      const changed = reducer(
        withTable(),
        updateCellLabel({ cellId: "r1$c1", value: "Roma" }),
      );
      expect(cellOf(changed, "r1").label).toBe("Roma");

      const undone = reducer(changed, undo(1));
      expect(cellOf(undone, "r1").label).toBe("Rome");

      const redone = reducer(undone, redo());
      expect(cellOf(redone, "r1").label).toBe("Roma");
    });

    it("does not record history when undoable is false", () => {
      const changed = reducer(
        withTable(),
        updateCellLabel({
          cellId: "r1$c1",
          value: "Roma",
          undoable: false,
        } as any),
      );
      expect(changed._draft.patches).toHaveLength(0);
      expect(changed._draft.inversePatches).toHaveLength(0);
    });

    it("undo of a metadata add removes it again", () => {
      const added = reducer(withTable(), addCellMetadata(manualMatch));
      const undone = reducer(added, undo(1));
      expect(cellOf(undone, "r1").metadata).toEqual([]);
    });
  });
});
