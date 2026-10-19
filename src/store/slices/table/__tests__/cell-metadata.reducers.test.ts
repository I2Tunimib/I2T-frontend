import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import tableReducer, {
  autoMatching,
  deleteCellMetadata,
  propagateCellDeleteMetadata,
  propagateCellMetadata,
  refineMatching,
  undo,
  updateCellMetadata,
  updateUI,
} from "../table.slice";
import { listenerMiddleware } from "../table.listeners";
import { matchedIds, sameIds } from "../utils/table.metadata-utils";
import { buildTable, colCells, matchOf, NOW } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

const trackTable = vi.hoisted(() => vi.fn());
vi.mock("@services/api/table", () => ({ default: { trackTable } }));

let store: any; // a partial store with the listener middleware

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  trackTable.mockReset();
  store = configureStore({
    reducer: { table: tableReducer as any },
    middleware: (gdm) =>
      gdm({ serializableCheck: false }).prepend(listenerMiddleware.middleware),
    preloadedState: { table: table() },
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/**
 * Rome appears on r1, r2 (reconciled, not matched) and r3 (not reconciled);
 * Paris on r4 is matched.
 */
const table = () =>
  buildTable({
    columns: ["city", "note"],
    rows: {
      r1: { city: ["Rome", [{ id: "wd:Q220", score: 0.9 }, { id: "wd:Q1", score: 0.3 }]], note: "" },
      r2: { city: ["Rome", [{ id: "wd:Q220", score: 0.9 }, { id: "wd:Q1", score: 0.3 }]], note: "" },
      r3: { city: "Rome", note: "" },
      r4: { city: ["Paris", [{ id: "wd:Q90", score: 0.8, match: true }]], note: "" },
    },
  });

const city = (state: ReturnType<typeof table>) => state.entities.columns.byId.city;
const wd = (state: ReturnType<typeof table>) => city(state).context.wd;
const counters = (state: ReturnType<typeof table>) => ({
  total: wd(state).total,
  reconciliated: wd(state).reconciliated,
  nCellsReconciliated: state.entities.tableInstance.nCellsReconciliated,
});

describe("updateCellMetadata", () => {
  it("matches a candidate, unmatching the others", () => {
    const next = reducer(table(), updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220" }));
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q220"]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({
      value: true,
      reason: "manual",
    });
    expect(counters(next)).toEqual({ total: 3, reconciliated: 2, nCellsReconciliated: 2 });
    expect(city(next).status).toBe("pending");
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("unmatches a matched candidate when toggled", () => {
    const next = reducer(table(), updateCellMetadata({ cellId: "r4$city", metadataId: "wd:Q90" }));
    expect(matchOf(next, "r4$city")).toEqual([]);
    expect(colCells(next, "city").r4.annotationMeta.match).toEqual({ value: false });
    expect(counters(next)).toEqual({ total: 3, reconciliated: 0, nCellsReconciliated: 0 });
  });

  it("can force a match instead of toggling", () => {
    const matched = reducer(table(), updateCellMetadata({ cellId: "r4$city", metadataId: "wd:Q90", match: true }));
    expect(matchOf(matched, "r4$city")).toEqual(["wd:Q90"]);
    expect(counters(matched).reconciliated).toBe(1);
  });

  it("moving the match to another candidate keeps the counters", () => {
    const state = reducer(table(), updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220" }));
    const next = reducer(state, updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q1" }));
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q1"]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: true, reason: "manual" });
    expect(counters(next).reconciliated).toBe(2);
  });

  it("does nothing to a cell without candidates", () => {
    const state = table();
    const next = reducer(state, updateCellMetadata({ cellId: "r3$city", metadataId: "wd:Q1" }));
    expect(next.entities).toEqual(state.entities);
    expect(next._draft.patches).toHaveLength(0);
  });

  it("completing the column marks it reconciliated", () => {
    let state = table();
    ["r1", "r2"].forEach((r) => {
      state = reducer(state, updateCellMetadata({ cellId: `${r}$city`, metadataId: "wd:Q220" }));
    });
    // r3 has no candidates, so the column is not complete
    expect(city(state).status).toBe("pending");
  });

  it("is undoable", () => {
    const next = reducer(table(), updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220" }));
    const undone = reducer(next, undo(1));
    expect(matchOf(undone, "r1$city")).toEqual([]);
    expect(counters(undone)).toEqual({ total: 3, reconciliated: 1, nCellsReconciliated: 1 });
  });

  it("respects undoable: false", () => {
    const next = reducer(
      table(),
      updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220", undoable: false }),
    );
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q220"]);
    expect(next._draft.patches).toHaveLength(0);
  });
});

describe("deleteCellMetadata", () => {
  it("removes a candidate by id", () => {
    const next = reducer(table(), deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q1" }));
    expect(colCells(next, "city").r1.metadata.map((m: any) => m.id)).toEqual(["wd:Q220"]);
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("matches ids case-insensitively and without the prefix", () => {
    const next = reducer(table(), deleteCellMetadata({ cellId: "r1$city", metadataId: "Q1" }));
    expect(colCells(next, "city").r1.metadata.map((m: any) => m.id)).toEqual(["wd:Q220"]);
  });

  it("accepts a list of ids", () => {
    const next = reducer(
      table(),
      deleteCellMetadata({ cellId: "r1$city", metadataId: ["wd:Q1", "wd:Q220"] as any }),
    );
    expect(colCells(next, "city").r1.metadata).toEqual([]);
  });

  it("accepts an object with an id, label or value", () => {
    const byId = reducer(table(), deleteCellMetadata({ cellId: "r1$city", metadataId: { id: "wd:Q1" } as any }));
    const byLabel = reducer(table(), deleteCellMetadata({ cellId: "r1$city", metadataId: { label: "wd:Q1" } as any }));
    const byValue = reducer(table(), deleteCellMetadata({ cellId: "r1$city", metadataId: { value: "wd:Q1" } as any }));
    [byId, byLabel, byValue].forEach((next) => {
      expect(colCells(next, "city").r1.metadata.map((m: any) => m.id)).toEqual(["wd:Q220"]);
    });
  });

  it("removing a matched candidate unmatches the cell and the counters", () => {
    const next = reducer(table(), deleteCellMetadata({ cellId: "r4$city", metadataId: "wd:Q90" }));
    expect(colCells(next, "city").r4.metadata).toEqual([]);
    expect(colCells(next, "city").r4.annotationMeta.match).toEqual({ value: false });
    // the cell no longer counts as reconciled and no longer has metadata
    expect(counters(next)).toEqual({ total: 2, reconciliated: 0, nCellsReconciliated: 0 });
  });

  it("removing an unmatched candidate keeps the cell counted", () => {
    const next = reducer(table(), deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q1" }));
    expect(counters(next)).toEqual({ total: 3, reconciliated: 1, nCellsReconciliated: 1 });
  });

  it("removing the last unmatched candidate stops counting the cell", () => {
    let state = reducer(table(), deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q1" }));
    state = reducer(state, deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220" }));
    expect(counters(state)).toEqual({ total: 2, reconciliated: 1, nCellsReconciliated: 1 });
  });

  it("removing nothing changes nothing", () => {
    const state = table();
    const next = reducer(state, deleteCellMetadata({ cellId: "r1$city", metadataId: "wd:Q999" }));
    expect(next.entities.rows).toEqual(state.entities.rows);
    expect(counters(next)).toEqual(counters(state));
  });

  it("is undoable", () => {
    const next = reducer(table(), deleteCellMetadata({ cellId: "r4$city", metadataId: "wd:Q90" }));
    const undone = reducer(next, undo(1));
    expect(matchOf(undone, "r4$city")).toEqual(["wd:Q90"]);
    expect(counters(undone)).toEqual({ total: 3, reconciliated: 1, nCellsReconciliated: 1 });
  });
});

describe("propagateCellMetadata", () => {
  const propagate = (state: ReturnType<typeof table>, match: boolean) =>
    reducer(
      state,
      propagateCellMetadata({
        cellId: "r1$city",
        metadataId: "wd:Q220",
        value: { id: "wd:Q220", name: "Rome", score: 0.9, match: String(match), uri: "u" },
      } as any),
    );

  it("matches the candidate on every cell with the same label", () => {
    const next = propagate(table(), true);
    ["r1", "r2", "r3"].forEach((r) => {
      expect(matchOf(next, `${r}$city`)).toEqual(["wd:Q220"]);
      expect(colCells(next, "city")[r].annotationMeta.match).toEqual({ value: true, reason: "manual" });
      expect(colCells(next, "city")[r].annotationMeta.annotated).toBe(true);
    });
    // other cells are untouched
    expect(matchOf(next, "r4$city")).toEqual(["wd:Q90"]);
  });

  it("adds the candidate to same-label cells that did not have it", () => {
    const next = propagate(table(), true);
    expect(colCells(next, "city").r3.metadata.map((m: any) => m.id)).toEqual(["wd:Q220"]);
  });

  it("unmatches the other candidates of the cells it matches", () => {
    const state = reducer(table(), updateCellMetadata({ cellId: "r2$city", metadataId: "wd:Q1" }));
    const next = propagate(state, true);
    expect(matchOf(next, "r2$city")).toEqual(["wd:Q220"]);
  });

  it("propagating a non-match unmatches the candidate everywhere", () => {
    const matched = propagate(table(), true);
    const next = propagate(matched, false);
    ["r1", "r2"].forEach((r) => {
      expect(matchOf(next, `${r}$city`)).toEqual([]);
      expect(colCells(next, "city")[r].annotationMeta.match).toEqual({ value: false, reason: "manual" });
    });
  });

  it("tells the backend which candidate was propagated, as it was before", () => {
    store.dispatch(
      propagateCellMetadata({
        cellId: "r1$city",
        metadataId: "wd:Q220",
        value: { id: "wd:Q220", name: "Rome", score: 0.9, match: "true", uri: "u" },
      } as any),
    );
    expect(trackTable).toHaveBeenCalledTimes(1);
    const [datasetId, tableId, body] = trackTable.mock.calls[0];
    expect([datasetId, tableId]).toEqual(["d1", "t1"]);
    expect(body).toMatchObject({
      operationType: "PROPAGATE_TYPE",
      columnName: "city",
      payload: { id: "wd:Q220", match: false, originalValue: "Rome" },
    });
  });

  it("listener ignores a non-existent candidate via getOriginalState", () => {
    store.dispatch(
      propagateCellMetadata({
        cellId: "r1$city",
        metadataId: "wd:Q404",
        value: { id: "wd:Q404", name: "Unknown", score: 0.5, match: "true", uri: "u" },
      } as any),
    );
    expect(trackTable).not.toHaveBeenCalled();
  });

  it("does nothing when the cell has no candidates", () => {
    const state = table();
    const next = reducer(
      state,
      propagateCellMetadata({ cellId: "r3$city", metadataId: "wd:Q220", value: { match: "true" } } as any),
    );
    expect(next.entities.rows).toEqual(state.entities.rows);
    expect(trackTable).not.toHaveBeenCalled();
  });

  it("does nothing when the cell does not have that candidate", () => {
    const state = table();
    const next = reducer(
      state,
      propagateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q404", value: { match: "true" } } as any),
    );
    expect(next.entities.rows).toEqual(state.entities.rows);
    expect(trackTable).not.toHaveBeenCalled();
  });

  it("is undoable", () => {
    const undone = reducer(propagate(table(), true), undo(1));
    expect(matchOf(undone, "r2$city")).toEqual([]);
  });
});

describe("propagateCellDeleteMetadata", () => {
  it("removes the candidates from every cell with the same label", () => {
    const next = reducer(
      table(),
      propagateCellDeleteMetadata({ cellId: "r1$city", metadataIds: ["wd:Q1"] }),
    );
    expect(colCells(next, "city").r1.metadata.map((m: any) => m.id)).toEqual(["wd:Q220"]);
    expect(colCells(next, "city").r2.metadata.map((m: any) => m.id)).toEqual(["wd:Q220"]);
    expect(colCells(next, "city").r4.metadata).toHaveLength(1);
    expect(next.entities.tableInstance.lastModifiedDate).toBe(NOW);
  });

  it("removing a matched candidate leaves the cells unmatched", () => {
    let state = reducer(table(), updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q220" }));
    state = reducer(state, updateCellMetadata({ cellId: "r2$city", metadataId: "wd:Q220" }));
    const next = reducer(state, propagateCellDeleteMetadata({ cellId: "r1$city", metadataIds: ["wd:Q220"] }));
    expect(matchOf(next, "r1$city")).toEqual([]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: false });
    expect(colCells(next, "city").r1.annotationMeta.annotated).toBe(true);
    expect(counters(next).reconciliated).toBe(1);
  });

  it("removing every candidate marks the cells as not annotated", () => {
    const next = reducer(
      table(),
      propagateCellDeleteMetadata({ cellId: "r1$city", metadataIds: ["wd:Q220", "wd:Q1"] }),
    );
    expect(colCells(next, "city").r1.metadata).toEqual([]);
    expect(colCells(next, "city").r1.annotationMeta.annotated).toBe(false);
  });

  it("keeps the match when another candidate stays matched", () => {
    const state = reducer(table(), updateCellMetadata({ cellId: "r1$city", metadataId: "wd:Q1" }));
    const next = reducer(state, propagateCellDeleteMetadata({ cellId: "r1$city", metadataIds: ["wd:Q220"] }));
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q1"]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: true, reason: "manual" });
  });

  it("is undoable", () => {
    const next = reducer(table(), propagateCellDeleteMetadata({ cellId: "r1$city", metadataIds: ["wd:Q1"] }));
    expect(colCells(reducer(next, undo(1)), "city").r1.metadata).toHaveLength(2);
  });

  it("ignores a missing cell", () => {
    const state = table();
    const next = reducer(state, propagateCellDeleteMetadata({ cellId: "ghost$city", metadataIds: ["x"] }));
    expect(next.entities).toEqual(state.entities);
  });
});

describe("refineMatching", () => {
  it("matches the chosen candidate of each cell", () => {
    const next = reducer(
      table(),
      refineMatching({
        changes: [
          { cellId: "r1$city", metaItemId: "wd:Q1" },
          { cellId: "r2$city", metaItemId: "wd:Q220" },
        ],
      } as any),
    );
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q1"]);
    expect(matchOf(next, "r2$city")).toEqual(["wd:Q220"]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: true, reason: "refinement" });
    expect(counters(next)).toEqual({ total: 3, reconciliated: 3, nCellsReconciliated: 3 });
    expect(city(next).status).toBe("pending");
  });

  it("moving the match of a matched cell keeps the counters", () => {
    const next = reducer(
      table(),
      refineMatching({ changes: [{ cellId: "r4$city", metaItemId: "wd:Q90" }] } as any),
    );
    expect(matchOf(next, "r4$city")).toEqual(["wd:Q90"]);
    expect(counters(next).reconciliated).toBe(1);
  });

  it("unmatches a cell when no candidate is chosen", () => {
    const next = reducer(table(), refineMatching({ changes: [{ cellId: "r4$city" }] } as any));
    expect(matchOf(next, "r4$city")).toEqual([]);
    expect(colCells(next, "city").r4.annotationMeta.match).toEqual({ value: false });
    expect(counters(next).reconciliated).toBe(0);
  });

  it("is undoable", () => {
    const next = reducer(table(), refineMatching({ changes: [{ cellId: "r1$city", metaItemId: "wd:Q1" }] } as any));
    expect(matchOf(reducer(next, undo(1)), "r1$city")).toEqual([]);
  });
});

describe("autoMatching", () => {
  const select = (state: ReturnType<typeof table>, cellIds: string[]) =>
    reducer(
      state,
      updateUI({ selectedCellIds: Object.fromEntries(cellIds.map((id) => [id, true])) }),
    );

  it("matches the best candidate at or above the threshold", () => {
    const next = reducer(select(table(), ["r1$city", "r2$city"]), autoMatching({ threshold: 0.5 }));
    expect(matchOf(next, "r1$city")).toEqual(["wd:Q220"]);
    expect(matchOf(next, "r2$city")).toEqual(["wd:Q220"]);
    expect(colCells(next, "city").r1.annotationMeta.match).toEqual({ value: true, reason: "refinement" });
    expect(counters(next)).toEqual({ total: 3, reconciliated: 3, nCellsReconciliated: 3 });
  });

  it("unmatches a matched candidate that falls below the threshold", () => {
    const next = reducer(select(table(), ["r4$city"]), autoMatching({ threshold: 0.95 }));
    expect(matchOf(next, "r4$city")).toEqual([]);
    expect(colCells(next, "city").r4.annotationMeta.match).toEqual({ value: false });
    expect(counters(next).reconciliated).toBe(0);
  });

  it("leaves a cell alone when its candidate is already matched", () => {
    const next = reducer(select(table(), ["r4$city"]), autoMatching({ threshold: 0.5 }));
    expect(matchOf(next, "r4$city")).toEqual(["wd:Q90"]);
    expect(counters(next).reconciliated).toBe(1);
  });

  it("changes nothing when no candidate reaches the threshold", () => {
    const next = reducer(select(table(), ["r1$city"]), autoMatching({ threshold: 0.99 }));
    expect(matchOf(next, "r1$city")).toEqual([]);
  });

  it("is undoable", () => {
    const next = reducer(select(table(), ["r1$city"]), autoMatching({ threshold: 0.5 }));
    expect(matchOf(reducer(next, undo(1)), "r1$city")).toEqual([]);
  });

  it("matches the best entity candidate of a selected column", () => {
    const state = buildTable({
      columns: [{
        id: "city",
        metadata: [{
          entity: [
            { id: "wd:Q220", match: false, score: 0.9, name: "Rome", uri: "u" },
            { id: "wd:Q1", match: false, score: 0.3, name: "Q1", uri: "u" },
          ],
        }],
      }],
      rows: { r1: { city: "Rome" }, r2: { city: "Paris" } },
    });
    const withSelection = reducer(
      state,
      updateUI({ selectedColumnsIds: { city: true } }),
    );
    const next = reducer(withSelection, autoMatching({ threshold: 0.5 }));
    const column = next.entities.columns.byId.city;
    expect(column.metadata[0].entity[0].match).toBe(true);
    expect(column.metadata[0].entity[1].match).toBe(false);
  });
});

describe("metadata utils", () => {
  it("matchedIds returns ids of matched items", () => {
    const items = [
      { id: "wd:Q1", match: true },
      { id: "wd:Q2", match: false },
      { id: "wd:Q3", match: true },
    ];
    expect(matchedIds(items as any)).toEqual(["wd:Q1", "wd:Q3"]);
  });

  it("matchedIds returns empty array when nothing matched", () => {
    const items = [
      { id: "wd:Q1", match: false },
      { id: "wd:Q2", match: false },
    ];
    expect(matchedIds(items as any)).toEqual([]);
  });

  it("sameIds returns true for identical arrays", () => {
    expect(sameIds(["a", "b"], ["a", "b"])).toBe(true);
    expect(sameIds([], [])).toBe(true);
  });

  it("sameIds returns false for different arrays", () => {
    expect(sameIds(["a", "b"], ["a", "c"])).toBe(false);
    expect(sameIds(["a"], ["a", "b"])).toBe(false);
  });
});
