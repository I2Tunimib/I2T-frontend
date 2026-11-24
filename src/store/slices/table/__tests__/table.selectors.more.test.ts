import { headerWidth } from "@services/utils/header-width";
import { describe, expect, it } from "vitest";
import {
  selectAreCellReconciliated,
  selectCanDelete,
  selectCellMetadataTableFormat,
  selectCellRefinement,
  selectAutoMatchingCells,
  selectColumnCellMetadataTableFormat,
  selectColumnReconciliators,
  selectColumnDatatype,
  selectColumnForExtension,
  selectColumnForModification,
  selectColumnKind,
  selectColumnRole,
  selectColumnTypes,
  selectColumnsAnnotationPercentages,
  selectDataTableFormat,
  selectIsAutoMatchingEnabled,
  selectIsExtendButtonEnabled,
  selectIsMetadataButtonEnabled,
  selectIsModifyButtonEnabled,
  selectIsUnsaved,
  selectReconciliationCells,
  selectSelectedCellsTypes,
  selecteSelectedColumnId,
} from "../table.selectors";
import { floor } from "@services/utils/math";
import tableReducer, { updateUI } from "../table.slice";
import { buildTable, cities } from "./fixtures";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

const wikidata = { id: "wd", prefix: "wd", uri: "https://www.wikidata.org/wiki/" };

/** The whole store state, with only what the selectors read filled in. */
const rootOf = (table: any, reconciliators: Record<string, any> = {}): any => ({
  table,
  config: { entities: { reconciliators: { byId: reconciliators, allIds: Object.keys(reconciliators) } } },
});

/** A table state with some ui fields set, as the selectors see it. */
const ui = (fields: Record<string, any>, table = cities()) =>
  reducer(table, updateUI(fields as any));
const root = (fields: Record<string, any> = {}, table = cities(), recon = {}) =>
  rootOf(ui(fields, table), recon);

describe("selectIsMetadataButtonEnabled", () => {
  it("is enabled for one selected cell", () => {
    expect(selectIsMetadataButtonEnabled(root({ selectedCellIds: { "r1$city": true } }))).toEqual({
      status: true,
      type: "cell",
    });
  });
  it("is enabled for one selected column of cells", () => {
    expect(selectIsMetadataButtonEnabled(root({ selectedColumnCellsIds: { city: true } }))).toEqual({
      status: true,
      type: "column",
    });
  });
  it("is disabled otherwise", () => {
    expect(selectIsMetadataButtonEnabled(root())).toEqual({ status: false, type: null });
    expect(
      selectIsMetadataButtonEnabled(root({ selectedColumnCellsIds: { city: true, note: true } })),
    ).toEqual({ status: false, type: null });
  });
});

describe("selectIsUnsaved", () => {
  const unsaved = (lastSaved: string, lastModifiedDate?: string) =>
    selectIsUnsaved(
      rootOf(
        ui(
          { lastSaved },
          buildTable({ columns: ["a"], rows: { r1: { a: "x" } }, tableInstance: { lastModifiedDate } }),
        ),
      ),
    );

  it("is unsaved when nothing was saved or modified yet", () => {
    expect(unsaved("", "2025-01-01T00:00:00.000Z")).toBe(true);
    expect(unsaved("2025-01-01T00:00:00.000Z", undefined)).toBe(true);
  });
  it("is unsaved when modified after the last save", () => {
    expect(unsaved("2025-01-01T00:00:00.000Z", "2025-01-02T00:00:00.000Z")).toBe(true);
  });
  it("is saved when the last save is not older than the last modification", () => {
    expect(unsaved("2025-01-02T00:00:00.000Z", "2025-01-01T00:00:00.000Z")).toBe(false);
    expect(unsaved("2025-01-01T00:00:00.000Z", "2025-01-01T00:00:00.000Z")).toBe(false);
  });
});

describe("selectCanDelete", () => {
  it("needs selected cells", () => {
    expect(selectCanDelete(root())).toBe(false);
  });
  it("is true when every selected cell belongs to a selected row or column", () => {
    expect(
      selectCanDelete(
        root({ selectedRowsIds: { r1: true }, selectedCellIds: { "r1$city": true, "r1$note": true } }),
      ),
    ).toBe(true);
    expect(
      selectCanDelete(root({ selectedColumnsIds: { city: true }, selectedCellIds: { "r2$city": true } })),
    ).toBe(true);
  });
  it("is false when a selected cell is on its own", () => {
    expect(
      selectCanDelete(root({ selectedRowsIds: { r1: true }, selectedCellIds: { "r1$city": true, "r2$note": true } })),
    ).toBe(false);
  });
});

describe("selectIsAutoMatchingEnabled", () => {
  it("is enabled when every selected cell has candidates", () => {
    expect(selectIsAutoMatchingEnabled(root({ selectedCellIds: { "r1$city": true, "r2$city": true } }))).toBe(true);
  });
  it("is disabled when a selected cell has none, or nothing is selected", () => {
    expect(selectIsAutoMatchingEnabled(root({ selectedCellIds: { "r1$city": true, "r3$city": true } }))).toBe(false);
    expect(selectIsAutoMatchingEnabled(root())).toBe(false);
  });
});

describe("selectIsExtendButtonEnabled", () => {
  it("needs a selected column or cell", () => {
    expect(selectIsExtendButtonEnabled(root())).toBe(false);
  });
  it("accepts a selected column and its cells", () => {
    expect(
      selectIsExtendButtonEnabled(root({ selectedColumnsIds: { city: true }, selectedCellIds: { "r1$city": true } })),
    ).toBe(true);
  });
  it("accepts cells of a single column when no column header is selected", () => {
    expect(selectIsExtendButtonEnabled(root({ selectedCellIds: { "r1$city": true, "r2$city": true } }))).toBe(true);
  });
  it("rejects cells outside the selected columns", () => {
    expect(
      selectIsExtendButtonEnabled(root({ selectedColumnsIds: { city: true }, selectedCellIds: { "r1$note": true } })),
    ).toBe(false);
  });
});

describe("selectIsModifyButtonEnabled", () => {
  it("needs a selected column", () => {
    expect(selectIsModifyButtonEnabled(root({ selectedCellIds: { "r1$city": true } }))).toBe(false);
  });
  it("accepts a selected column and its cells", () => {
    expect(
      selectIsModifyButtonEnabled(root({ selectedColumnsIds: { city: true }, selectedCellIds: { "r1$city": true } })),
    ).toBe(true);
  });
  it("rejects cells outside the selected columns", () => {
    expect(
      selectIsModifyButtonEnabled(root({ selectedColumnsIds: { city: true }, selectedCellIds: { "r1$note": true } })),
    ).toBe(false);
  });
});

describe("selectAreCellReconciliated", () => {
  it("is true when a selected column has a matched cell", () => {
    expect(selectAreCellReconciliated(root({ selectedColumnsIds: { city: true } }))).toBe(true);
    expect(selectAreCellReconciliated(root({ selectedCellIds: { "r1$city": true } }))).toBe(true);
    expect(selectAreCellReconciliated(root({ selectedColumnCellsIds: { city: true } }))).toBe(true);
  });
  it("is false for columns without a matched cell, unknown columns or no selection", () => {
    expect(selectAreCellReconciliated(root({ selectedColumnsIds: { note: true } }))).toBe(false);
    expect(selectAreCellReconciliated(root({ selectedColumnsIds: { ghost: true } }))).toBe(false);
    expect(selectAreCellReconciliated(root())).toBe(false);
  });
});

describe("selectDataTableFormat", () => {
  it("lists the matched candidate first and resolves its link", () => {
    const { rows } = selectDataTableFormat(rootOf(cities(), { wd: wikidata }));
    const rome = (rows[0] as any).city;
    expect(rome.rowId).toBe("r1");
    expect(rome.metadata.map((m: any) => m.id)).toEqual(["wd:Q220", "wd:Q1"]);
    expect(rome.metadata[0].url).toBe("https://www.wikidata.org/wiki/Q220");
  });

  it("keeps the order of candidates when the cell has no match information", () => {
    const table = cities();
    delete (table.entities.rows.byId.r2.cells.city.annotationMeta as any).match;
    const { rows } = selectDataTableFormat(rootOf(table, {}));
    expect((rows[1] as any).city.metadata.map((m: any) => m.id)).toEqual(["wd:Q90", "wd:Q2"]);
  });

  it("describes the columns for the table component", () => {
    const table = buildTable({
      columns: [{ id: "a", width: 200, minWidth: 10, maxWidth: 300 }, "b"],
      rows: { r1: { a: "x", b: "y" } },
    });
    const { columns } = selectDataTableFormat(rootOf(table, {}));
    expect(columns[0]).toMatchObject({ header: "a", accessorKey: "a", size: 200, minSize: 10, maxSize: 300 });
    // no saved width: sized to fit the header label
    expect(columns[1].size).toBe(headerWidth("b", {}));
    expect(columns[1]).toMatchObject({ minSize: 80, maxSize: 800, enableResizing: true });
  });
});

describe("selectReconciliationCells", () => {
  it("lists selected columns, then selected cells", () => {
    const state = root({
      selectedColumnsIds: { city: true },
      selectedColumnCellsIds: { note: true },
      selectedCellIds: { "r1$city": true },
    });
    expect(selectReconciliationCells(state)).toEqual([
      { id: "note", label: "note" },
      { id: "city", label: "city" },
      { id: "r1$city", label: "Rome" },
    ]);
  });
  it("lists only cells when no column is selected", () => {
    expect(selectReconciliationCells(root({ selectedCellIds: { "r2$city": true } }))).toEqual([
      { id: "r2$city", label: "Paris" },
    ]);
  });
  it("leaves out unknown columns", () => {
    const list = selectReconciliationCells(root({ selectedColumnsIds: { ghost: true } }));
    expect(list).toEqual([null]);
  });
});

describe("selectCellMetadataTableFormat", () => {
  it("gives the cell, its column context and its reconciliator", () => {
    const state = root({ selectedCellIds: { "r1$city": true } }, cities(), { wd: wikidata });
    const result: any = selectCellMetadataTableFormat(state);
    expect(result.cell.id).toBe("r1$city");
    expect(result.service).toBe(wikidata);
    expect(result.columnContext.wd).toBeDefined();
  });
  it("leaves out the service when it is unknown", () => {
    const result: any = selectCellMetadataTableFormat(root({ selectedCellIds: { "r1$city": true } }));
    expect(result.cell.id).toBe("r1$city");
    expect(result).not.toHaveProperty("service");
  });
  it("is undefined unless exactly one cell is selected", () => {
    expect(selectCellMetadataTableFormat(root())).toBeUndefined();
  });
});

describe("selectColumnCellMetadataTableFormat", () => {
  const withColumn = (over: Record<string, any>, recon = { wd: wikidata }) =>
    root(
      { metadataColumnDialogColId: "city" },
      buildTable({ columns: [{ id: "city", ...over }], rows: { r1: { city: "Rome" } } }),
      recon,
    );

  it("is null without an open column dialog", () => {
    expect(selectColumnCellMetadataTableFormat(root())).toBeNull();
  });
  it("uses the reconciliator that annotated the column", () => {
    const result: any = selectColumnCellMetadataTableFormat(
      withColumn({ reconciler: "wd", metadata: [{ type: [] }] }),
    );
    expect(result.service).toBe(wikidata);
  });
  it("falls back to the reconciliator named by the first property", () => {
    const result: any = selectColumnCellMetadataTableFormat(
      withColumn({ metadata: [{ property: [{ id: "wd:P17" }] }] }),
    );
    expect(result.service).toBe(wikidata);
  });
  it("gives an empty annotation when no reconciliator is found", () => {
    const noMetadata: any = selectColumnCellMetadataTableFormat(withColumn({}));
    expect(noMetadata.service).toBeNull();
    expect(noMetadata.column.metadata).toEqual([{ property: [] }]);
    const unknownProperty: any = selectColumnCellMetadataTableFormat(
      withColumn({ metadata: [{ property: [{ id: "zz:P1" }] }] }),
    );
    expect(unknownProperty.service).toBeNull();
    const emptyProperties: any = selectColumnCellMetadataTableFormat(withColumn({ metadata: [{ property: [] }] }));
    expect(emptyProperties.service).toBeNull();
  });
});

describe("selectColumnForExtension / selectColumnForModification", () => {
  const selected = { selectedColumnsIds: { city: true }, selectedCellIds: { "r1$city": true } };

  it("map each row to the matched candidate of the selected column", () => {
    expect(selectColumnForExtension(root(selected))).toEqual({ r1: "wd:Q220" });
    expect(selectColumnForModification(root(selected))).toEqual({ r1: "wd:Q220" });
  });
  it("are empty lists while the action is disabled", () => {
    expect(selectColumnForExtension(root())).toEqual([]);
    expect(selectColumnForModification(root())).toEqual([]);
  });
});

describe("selected column attributes", () => {
  const table = () =>
    buildTable({
      columns: [{ id: "city", kind: "entity", datatype: "LOCATION", role: "subject" }, "note"],
      rows: { r1: { city: "Rome", note: "" } },
    });

  it("come from the column open in the dialog", () => {
    const state = root({ metadataColumnDialogColId: "city" }, table());
    expect(selectColumnKind(state)).toBe("entity");
    expect(selectColumnDatatype(state)).toBe("LOCATION");
    expect(selectColumnRole(state)).toBe("subject");
  });
  it("else from the first selected column of cells", () => {
    const state = root({ selectedColumnCellsIds: { city: true } }, table());
    expect(selectColumnKind(state)).toBe("entity");
    expect(selecteSelectedColumnId(state)).toBe("city");
  });
  it("are undefined without a column", () => {
    expect(selectColumnKind(root({}, table()))).toBeUndefined();
    expect(selecteSelectedColumnId(root({}, table()))).toBeUndefined();
  });
});

describe("selectColumnTypes: declared types", () => {
  it("add declared types no cell matched, with a zero count, and share the percentages", () => {
    const table = buildTable({
      columns: [
        {
          id: "city",
          metadata: [
            {
              type: [
                { id: "wd:Q515", name: "city", match: true },
                { id: "wd:Q999", name: "other", match: false, uri: "u", decider: "human" },
              ],
            },
          ],
        },
      ],
      rows: {
        r1: { city: ["Rome", [{ id: "wd:Q220", match: true, type: [{ id: "wd:Q515", name: "city" }] }]] },
      },
    });
    const result: any = selectColumnTypes(root({ metadataColumnDialogColId: "city" }, table));
    expect(result.allTypes.map((t: any) => [t.id, t.count, t.match, t.percentage])).toEqual([
      ["Q515", 1, true, "100.00"],
      ["Q999", 0, false, "0.00"],
    ]);
    expect(result.selectedType.map((t: any) => t.id)).toEqual(["Q515"]);
  });

  it("has zero percentages when no cell has a type", () => {
    const table = buildTable({
      columns: [{ id: "city", metadata: [{ type: [{ id: "Q1", name: "x", match: false }] }] }],
      rows: { r1: { city: "Rome" } },
    });
    const result: any = selectColumnTypes(root({ metadataColumnDialogColId: "city" }, table));
    expect(result.allTypes).toHaveLength(1);
    expect(result.allTypes[0].percentage).toBe(0);
  });

  it("is null without a column", () => {
    expect(selectColumnTypes(root())).toBeNull();
  });

  it("takes the match of a type from the column when it declares one", () => {
    const table = buildTable({
      columns: [{ id: "city", metadata: [{ type: [{ id: "wd:Q515", name: "city", match: false }] }] }],
      rows: { r1: { city: ["Rome", [{ id: "wd:Q220", match: true, type: [{ id: "wd:Q515", name: "city" }] }]] } },
    });
    const result: any = selectColumnTypes(root({ metadataColumnDialogColId: "city" }, table));
    expect(result.allTypes[0].match).toBe(false);
    expect(result.selectedType).toEqual([]);
  });
});

describe("selectColumnsAnnotationPercentages", () => {
  it("is null without selected columns", () => {
    expect(selectColumnsAnnotationPercentages(root())).toBeNull();
  });
  it("counts matches, pending and missed cells of the selected columns", () => {
    const table = buildTable({
      columns: ["a"],
      rows: {
        r1: { a: ["x", [{ id: "wd:Q1", match: true, score: 1 }]] },
        r2: { a: ["y", [{ id: "wd:Q2", score: 0.9 }]] },
        r3: { a: ["z", [{ id: "wd:Q3", score: 0.1 }]] },
        r4: { a: "w" },
      },
    });
    const result: any = selectColumnsAnnotationPercentages(
      root({ selectedColumnsIds: { a: true }, settings: { scoreLowerBound: 0.5 } }, table),
    );
    expect(result).toEqual({
      match: { n: 1, percentage: "25.00" },
      pending: { n: 1, percentage: "25.00" },
      miss: { n: 1, percentage: "25.00" },
    });
  });
});

describe("selectCellRefinement", () => {
  it("groups the selected cells by how they were matched", () => {
    const table = cities();
    const cells = table.entities.rows.byId;
    cells.r1.cells.note.annotationMeta = { annotated: true, match: { value: true, reason: "manual" } } as any;
    cells.r2.cells.note.annotationMeta = { annotated: true, match: { value: true, reason: "refinement" } } as any;
    cells.r3.cells.note.annotationMeta = { annotated: true, match: { value: true, reason: "other" } } as any;
    const result = selectCellRefinement(
      root({
        selectedCellIds: { "r1$city": true, "r1$note": true, "r2$note": true, "r3$note": true, "r2$city": true },
      }, table),
    );
    expect(result.matchingReconciliator.map((c) => c.id)).toEqual(["r1$city"]);
    expect(result.matchingManual.map((c) => c.id)).toEqual(["r1$note"]);
    expect(result.matchingRefinement.map((c) => c.id)).toEqual(["r2$note"]);
    expect(result.notMatching.map((c) => c.id)).toEqual(["r2$city"]);
  });
  it("ignores cells that were not annotated", () => {
    const result = selectCellRefinement(root({ selectedCellIds: { "r3$note": true } }));
    expect(result.notMatching).toEqual([]);
  });
});

describe("selectSelectedCellsTypes", () => {
  const typed = () =>
    buildTable({
      columns: [{ id: "a", annotationMeta: { annotated: true }, metadata: [{ entity: [{ id: "wd:Q1", type: [{ id: "T", name: "Human" }, { id: "U" }] }, { id: "wd:Q2" }] }] }, "b"],
      rows: {
        r1: { a: ["x", [{ id: "wd:Q9", type: [{ id: "T1", name: "City" }, { id: "T2", name: "" }] }, { id: "wd:Q8" }]], b: "" },
      },
    });

  it("lists the distinct lowercased type names of selected cells and columns", () => {
    const state = root({ selectedCellIds: { "r1$a": true }, selectedColumnsIds: { a: true } }, typed());
    expect(selectSelectedCellsTypes(state)).toEqual(["city", "human"]);
  });
  it("is empty when nothing is annotated", () => {
    expect(selectSelectedCellsTypes(root({ selectedCellIds: { "r1$note": true } }))).toEqual([]);
  });
  it("skips columns without entities", () => {
    const table = buildTable({
      columns: [{ id: "a", annotationMeta: { annotated: true }, metadata: [{ entity: [] }] }, { id: "b", annotationMeta: { annotated: true }, metadata: [] }],
      rows: { r1: { a: "x", b: "y" } },
    });
    expect(selectSelectedCellsTypes(root({ selectedColumnsIds: { a: true, b: true } }, table))).toEqual([]);
  });
});

describe("selectColumnReconciliators", () => {
  const data = { context: { wd: { reconciliated: 2 }, geo: { reconciliated: 0 }, zz: { reconciliated: 1 } } };

  it("names the reconciliators of the contexts with reconciliated cells", () => {
    const state = rootOf(cities(), { wd: { ...wikidata, name: "Wikidata" } });
    // "zz" has reconciliated cells but no known reconciliator: empty name
    expect(selectColumnReconciliators(state, { data })).toEqual(["Wikidata", ""]);
  });
  it("is empty without column data", () => {
    expect(selectColumnReconciliators(rootOf(cities()), { data: undefined })).toEqual([]);
  });
});

describe("selectDataTableFormat: order of candidates", () => {
  it("puts matched candidates first and keeps the order of the others", () => {
    const table = buildTable({
      columns: ["a"],
      rows: {
        r1: { a: ["x", [{ id: "wd:Q1" }, { id: "wd:Q2", match: true }, { id: "wd:Q3" }, { id: "wd:Q4" }]] },
      },
    });
    const { rows } = selectDataTableFormat(rootOf(table, {}));
    expect((rows[0] as any).a.metadata.map((m: any) => m.id)).toEqual(["wd:Q2", "wd:Q1", "wd:Q3", "wd:Q4"]);
  });
});

describe("selectAutoMatchingCells", () => {
  it("gives the lowest and highest score across all selected cells", () => {
    const table = buildTable({
      columns: ["a"],
      rows: {
        r1: { a: ["x", [{ id: "wd:Q1", score: 20 }, { id: "wd:Q2", score: 90 }]] },
        r2: { a: ["y", [{ id: "wd:Q3", score: 50 }, { id: "wd:Q4", score: 60 }]] },
      },
    });
    const result = selectAutoMatchingCells(root({ selectedCellIds: { "r1$a": true, "r2$a": true } }, table));
    expect(result.n).toBe(2);
    expect(result.minScore).toBe(floor(20));
    expect(result.maxScore).toBe(floor(90));
  });
});

describe("selectColumnDatatype", () => {
  it("is undefined without a column", () => {
    expect(selectColumnDatatype(root())).toBeUndefined();
  });
});
