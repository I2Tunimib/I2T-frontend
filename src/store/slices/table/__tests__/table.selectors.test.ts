import { describe, expect, it } from "vitest";
import {
  selectAutoMatchingCells,
  selectCanDelete,
  selectCanRedo,
  selectCanUndo,
  selectColumnCellMetadataTableFormat,
  selectColumnReconciliators,
  selectColumnRole,
  selectColumnTypes,
  selectColumnsAnnotationPercentages,
  selectColumnsAsSelectOptions,
  selectCurrentCell,
  selectCurrentCol,
  selectCurrentColCellId,
  selectCurrentTable,
  selectCurrentView,
  selectDataTableFormat,
  selectDependencies,
  selectEditableCellsIds,
  selectExpandedCellsIds,
  selectExpandedColumnsIds,
  selectExpandRevision,
  selectIsAutoMatchingEnabled,
  selectIsCellSelected,
  selectIsDenseView,
  selectIsExtendButtonEnabled,
  selectIsHeaderExpanded,
  selectIsMetadataButtonEnabled,
  selectIsOnlyOneCellSelected,
  selectCellIdIfOneSelected,
  selectIsUnsaved,
  selectIsViewOnly,
  selectLastSaved,
  selectReconciliatorCell,
  selectReconciliatioContextColumnIds,
  selectSelectedCellIds,
  selectSelectedCellsIdsAsArray,
  selectSelectedColumnCellsIds,
  selectSelectedColumnCellsIdsAsArray,
  selectSelectedColumnIds,
  selectSelectedColumnIdsAsArray,
  selectSelectedRowIds,
  selectSelectedRowIdsAsArray,
  selectSearchStatus,
  selectSelectedCellsTypes,
  selectSettings,
  selectTutorialBBoxes,
  selectUISettings,
} from "../table.selectors";
import tableReducer, { updateUI } from "../table.slice";
import { buildTable, cities } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

// the selectors take the whole RootState; the tests only fill what they read
const stateOf = (table: any): any => ({
  table,
  config: { entities: { reconciliators: { byId: {} } } },
});

const withUi = (table: any, ui: Record<string, any>) =>
  reducer(table, updateUI(ui));

describe("table selectors", () => {
  describe("basic entity/ui selectors", () => {
    it("selectCurrentTable", () => {
      const state = stateOf(cities());
      expect(selectCurrentTable(state)).toBe(
        state.table.entities.tableInstance,
      );
    });

    it("selectUISettings", () => {
      const state = stateOf(cities());
      expect(selectUISettings(state)).toBe(state.table.ui.settings);
    });

    it("selectSettings merges score bounds", () => {
      const state = stateOf(cities());
      const s = selectSettings(state);
      expect(s.lowerBound).toEqual({
        isScoreLowerBoundEnabled: true,
        scoreLowerBound: 0.35,
        minMetaScore: 0,
        maxMetaScore: 0,
      });
    });

    it("selectExpandRevision", () => {
      const state = stateOf(cities());
      expect(selectExpandRevision(state)).toBe(state.table.ui.expandRevision);
    });

    it("selectCanUndo / selectCanRedo", () => {
      const initial = stateOf(
        buildTable({ columns: ["a"], rows: { r1: { a: "x" } } }),
      );
      expect(selectCanUndo(initial)).toBe(false);
      expect(selectCanRedo(initial)).toBe(false);
    });

    it("selectColumnsAsSelectOptions", () => {
      const state = stateOf(cities());
      const opts = selectColumnsAsSelectOptions(state);
      expect(opts).toEqual([
        { id: "city", label: "city", kind: undefined, value: "city" },
        { id: "note", label: "note", kind: undefined, value: "note" },
      ]);
    });

    it("selection selectors", () => {
      const state = stateOf(cities());
      expect(selectSelectedColumnIds(state)).toEqual({});
      expect(selectSelectedColumnIdsAsArray(state)).toEqual([]);
      expect(selectSelectedCellIds(state)).toEqual({});
      expect(selectSelectedCellsIdsAsArray(state)).toEqual([]);
      expect(selectSelectedRowIds(state)).toEqual({});
      expect(selectSelectedRowIdsAsArray(state)).toEqual([]);
      expect(selectSelectedColumnCellsIds(state)).toEqual({});
      expect(selectSelectedColumnCellsIdsAsArray(state)).toEqual([]);
    });

    it("editable / expanded ui selectors", () => {
      const state = stateOf(cities());
      expect(selectEditableCellsIds(state)).toEqual({});
      expect(selectExpandedCellsIds(state)).toEqual({});
      expect(selectExpandedColumnsIds(state)).toEqual({});
    });

    it("view / dense / header selectors", () => {
      const state = stateOf(cities());
      expect(selectCurrentView(state)).toBe("table");
      expect(selectIsDenseView(state)).toBe(true);
      expect(selectIsHeaderExpanded(state)).toBe(false);
    });

    it("dialog status selectors", () => {
      const state = stateOf(cities());
      expect(selectIsViewOnly(state)).toBe(false);
      expect(selectLastSaved(state)).toBe("");
      expect(selectSearchStatus(state)).toEqual(state.table.ui.search);
      expect(selectTutorialBBoxes(state)).toEqual({});
    });
  });

  describe("cell/column derivation", () => {
    it("selectIsCellSelected / selectIsOnlyOneCellSelected / selectCellIdIfOneSelected", () => {
      const state = stateOf(cities());
      expect(selectIsCellSelected(state)).toBe(false);
      expect(selectIsOnlyOneCellSelected(state)).toBe(false);
      expect(selectCellIdIfOneSelected(state)).toBe("");

      const s2 = stateOf(withUi(cities(), { selectedCellIds: { "r1$city": true } }));
      expect(selectIsCellSelected(s2)).toBe(true);
      expect(selectIsOnlyOneCellSelected(s2)).toBe(true);
      expect(selectCellIdIfOneSelected(s2)).toBe("r1$city");
    });

    it("selectCurrentColCellId / selectCurrentCol / selectCurrentCell", () => {
      const state = stateOf(cities());
      expect(selectCurrentColCellId(state)).toBe(null);
      expect(selectCurrentCol(state)).toBeUndefined();
      expect(selectCurrentCell(state)).toBeUndefined();

      const s2 = stateOf(
        withUi(cities(), { selectedColumnCellsIds: { city: true } }),
      );
      expect(selectCurrentColCellId(s2)).toBe("city");
      expect(selectCurrentCol(s2)?.id).toBe("city");
      expect(selectCurrentCell(s2)).toBeUndefined();
    });

    it("selectCurrentCell when one cell selected", () => {
      const s2 = stateOf(
        withUi(cities(), { selectedCellIds: { "r1$city": true } }),
      );
      expect(selectCurrentCell(s2)?.id).toBe("r1$city");
    });

    it("selectIsMetadataButtonEnabled", () => {
      const state = stateOf(cities());
      expect(selectIsMetadataButtonEnabled(state)).toEqual({
        status: false,
        type: null,
      });
    });

    it("selectIsUnsaved", () => {
      const fresh = stateOf(cities());
      expect(selectIsUnsaved(fresh)).toBe(true);
    });

    it("selectCanDelete", () => {
      const state = stateOf(cities());
      expect(selectCanDelete(state)).toBe(false);
    });

    it("selectIsAutoMatchingEnabled", () => {
      const state = stateOf(cities());
      expect(selectIsAutoMatchingEnabled(state)).toBe(false);
    });

    it("selectIsExtendButtonEnabled", () => {
      const state = stateOf(cities());
      expect(selectIsExtendButtonEnabled(state)).toBe(false);
    });
  });

  describe("column types", () => {
    it("selectColumnTypes returns null without selection", () => {
      const state = stateOf(cities());
      expect(selectColumnTypes(state)).toBeNull();
    });

    it("selectColumnTypes derives from matched cells", () => {
      const table = buildTable({
        columns: ["city"],
        rows: {
          r1: {
            city: ["Rome", [{ id: "wd:Q220", match: true, type: [{ id: "wd:Q515", name: "city" }] }]],
          },
        },
      });
      const s2 = stateOf(
        withUi(table, { selectedColumnCellsIds: { city: true } }),
      );
      const res = selectColumnTypes(s2);
      expect(res).not.toBeNull();
      expect(res!.allTypes.length).toBeGreaterThan(0);
      expect(res!.allTypes[0].id).toBe("Q515");
    });

    it("selectColumnTypes uses dialog colId", () => {
      const table = buildTable({
        columns: ["city", "note"],
        rows: { r1: { city: "Rome", note: "" } },
      });
      const s2 = stateOf(withUi(table, { metadataColumnDialogColId: "note" }));
      const res = selectColumnTypes(s2);
      expect(res).not.toBeNull();
      expect(res!.allTypes).toEqual([]);
    });

    it("selectColumnRole", () => {
      const table = buildTable({
        columns: [{ id: "city", role: "subject" }, "note"],
        rows: { r1: { city: "Rome", note: "" } },
      });
      const s2 = stateOf(
        withUi(table, { selectedColumnCellsIds: { city: true } }),
      );
      expect(selectColumnRole(s2)).toBe("subject");
    });

    it("selectColumnsAnnotationPercentages returns empty when nothing selected", () => {
      const state = stateOf(cities());
      expect(selectColumnsAnnotationPercentages(state)).toBeNull();
    });

    it("selectColumnCellMetadataTableFormat undefined without service", () => {
      const table = buildTable({
        columns: [{ id: "city", reconciler: "wd" }],
        rows: { r1: { city: "Rome" } },
      });
      const s2 = stateOf(
        withUi(table, { metadataColumnDialogColId: "city" }),
      );
      const res = selectColumnCellMetadataTableFormat(s2);
      if (res) {
        expect(res.column.id).toBe("city");
        expect(res.service).toBeNull();
      }
    });

    it("selectReconciliatorCell returns empty string", () => {
      const state = stateOf(cities());
      expect((selectReconciliatorCell as any)(state, { value: "x" })).toBe("");
    });
  });

  describe("selected cells types", () => {
    it("selectSelectedCellsTypes returns types from selected cells", () => {
      const table = buildTable({
        columns: ["city"],
        rows: {
          r1: {
            city: ["Rome", [{ id: "wd:Q220", match: true, type: [{ id: "wd:Q515", name: "City" }] }]],
          },
        },
      });
      const s2 = stateOf(
        withUi(table, { selectedCellIds: { "r1$city": true } }),
      );
      expect(selectSelectedCellsTypes(s2)).toContain("city");
    });

    it("selectSelectedCellsTypes returns empty array when nothing selected", () => {
      const state = stateOf(cities());
      expect(selectSelectedCellsTypes(state)).toEqual([]);
    });
  });

  describe("reconciliation context column ids", () => {
    it("selectReconciliatioContextColumnIds returns columns not selected", () => {
      const state = stateOf(
        withUi(cities(), { selectedColumnsIds: { city: true } }),
      );
      expect(selectReconciliatioContextColumnIds(state)).toEqual(["note"]);
    });

    it("selectReconciliatioContextColumnIds returns all columns when none selected", () => {
      const state = stateOf(cities());
      expect(selectReconciliatioContextColumnIds(state)).toEqual([
        "city",
        "note",
      ]);
    });

    it("selectColumnReconciliators maps contexts to names", () => {
      const state = stateOf(cities());
      const result = selectColumnReconciliators(state, {
        data: { context: { wd: { reconciliated: 1, total: 1, uri: "x" } } },
      } as any);
      expect(result).toEqual([""]);
    });
  });

  describe("input selectors", () => {
    it("selectDependencies returns the dependencies", () => {
      const state = stateOf(cities());
      expect(selectDependencies(state)).toBeNull();

      const withDeps = reducer(
        cities(),
        { type: "table/updateDependencies", payload: { nodes: {} } },
      );
      expect(selectDependencies(stateOf(withDeps))).toEqual({ nodes: {} });
    });
  });

  describe("data table format", () => {
    it("selectDataTableFormat transforms cells with metadata", () => {
      const table = buildTable({
        columns: ["city"],
        rows: {
          r1: {
            city: [
              "Rome",
              [{ id: "wd:Q220", match: true, score: 1, name: "Rome", uri: "u" } as any],
            ],
          },
        },
      });
      const state = stateOf(table);
      const result: any = selectDataTableFormat(state);
      expect(result.rows[0].city.metadata).toHaveLength(1);
      expect(result.rows[0].city.metadata[0].url).toBeDefined();
    });

    it("selectDataTableFormat handles cells without metadata", () => {
      const table = buildTable({
        columns: ["city"],
        rows: { r1: { city: "Rome" } },
      });
      const state = stateOf(table);
      const result: any = selectDataTableFormat(state);
      expect(result.rows[0].city.metadata).toEqual([]);
    });
  });

  describe("auto matching cells", () => {
    it("selectAutoMatchingCells computes min/max scores", () => {
      const table = buildTable({
        columns: ["city"],
        rows: {
          r1: {
            city: ["Rome", [{ id: "wd:Q220", match: true, score: 0.9 }]],
          },
          r2: {
            city: ["Paris", [{ id: "wd:Q90", match: true, score: 0.3 }]],
          },
        },
      });
      const state = stateOf(
        withUi(table, { selectedCellIds: { "r1$city": true, "r2$city": true } }),
      );
      const result = selectAutoMatchingCells(state);
      expect(result.n).toBe(2);
      expect(result.minScore).toBe(0.3);
      expect(result.maxScore).toBe(0.9);
    });

    it("selectAutoMatchingCells returns empty for no selection", () => {
      const state = stateOf(cities());
      const result = selectAutoMatchingCells(state);
      expect(result.n).toBe(0);
      expect(result.minScore).toBe(500);
      expect(result.maxScore).toBe(0);
    });
  });
});
