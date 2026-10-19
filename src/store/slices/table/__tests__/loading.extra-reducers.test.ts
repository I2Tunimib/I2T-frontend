import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tableReducer from "../table.slice";

// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;
import {
  automaticAnnotation,
  getDependencies,
  getTable,
  saveTable,
  tableCompliance,
} from "../table.thunk";
import { buildTable, cities, initial } from "./fixtures";

vi.mock("@services/api/table", () => ({ default: {} }));

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

/** What the backend sends for a table. */
const loaded = (over: Record<string, any> = {}) => {
  const state = cities();
  return {
    table: { ...state.entities.tableInstance, lastModifiedDate: "2025-03-03T00:00:00.000Z" },
    columns: state.entities.columns.byId,
    rows: state.entities.rows.byId,
    ...over,
  } as any;
};
const getTableDone = (payload: any, from = initial()) =>
  reducer(from, getTable.fulfilled(payload, "req", {}));

describe("getTable.fulfilled", () => {
  it("loads the table and remembers when it was saved", () => {
    const next = getTableDone(loaded());
    expect(next.entities.tableInstance.id).toBe("t1");
    expect(next.entities.columns.allIds).toEqual(["city", "note"]);
    expect(next.entities.rows.allIds).toEqual(["r1", "r2", "r3"]);
    expect(next.ui.lastSaved).toBe("2025-03-03T00:00:00.000Z");
  });

  it("follows the saved column order", () => {
    const next = getTableDone(loaded({ columnOrder: ["note", "ghost", "city"] }));
    expect(next.entities.columns.allIds).toEqual(["note", "city"]);
  });

  it("appends columns missing from the saved order", () => {
    const next = getTableDone(loaded({ columnOrder: ["note"] }));
    expect(next.entities.columns.allIds).toEqual(["note", "city"]);
  });

  it("works out the status of every column", () => {
    const stale = loaded();
    Object.values<any>(stale.columns).forEach((c) => {
      c.status = "empty";
    });
    const next = getTableDone(stale);
    // Rome matched, Paris and Berlin not: city is pending; note has nothing
    expect(next.entities.columns.byId.city.status).toBe("pending");
    expect(next.entities.columns.byId.note.status).toBe("empty");
  });

  it("marks a fully matched column as reconciliated", () => {
    const table = buildTable({
      columns: ["a"],
      rows: {
        r1: { a: ["x", [{ id: "wd:Q1", match: true }]] },
        r2: { a: ["y", [{ id: "wd:Q2", match: true }]] },
      },
    });
    const next = getTableDone({
      table: table.entities.tableInstance,
      columns: table.entities.columns.byId,
      rows: table.entities.rows.byId,
    });
    expect(next.entities.columns.byId.a.status).toBe("reconciliated");
  });

  it("recounts the reconciled cells and the score range", () => {
    const next = getTableDone(loaded());
    expect(next.entities.tableInstance).toMatchObject({
      nCells: 6,
      nCellsReconciliated: 1,
      minMetaScore: 0,
      maxMetaScore: 1,
    });
  });

  it("restores the default score lower bound when it was zero", () => {
    const zero = { ...initial(), ui: { ...initial().ui, settings: { ...initial().ui.settings, scoreLowerBound: 0 } } };
    expect(getTableDone(loaded(), zero).ui.settings.scoreLowerBound).toBe(0.35);
  });

  it("keeps a custom score lower bound", () => {
    const custom = { ...initial(), ui: { ...initial().ui, settings: { ...initial().ui.settings, scoreLowerBound: 0.6 } } };
    expect(getTableDone(loaded(), custom).ui.settings.scoreLowerBound).toBe(0.6);
  });
});

describe("saveTable.fulfilled", () => {
  it("remembers the save date", () => {
    const next = reducer(
      cities(),
      saveTable.fulfilled({ lastModifiedDate: "2025-04-04T00:00:00.000Z" } as any, "req", {}),
    );
    expect(next.ui.lastSaved).toBe("2025-04-04T00:00:00.000Z");
  });
});

describe("automatic annotation", () => {
  const args = (target: "fullTable" | "schema") => ({
    datasetId: "d1",
    tableId: "t1",
    target,
    method: "alligator" as const,
  });

  it("pending: a schema annotation sets the schema status and locks the table", () => {
    const next = reducer(cities(), automaticAnnotation.pending("req", args("schema")));
    expect(next.entities.tableInstance.schemaStatus).toBe("PENDING");
    expect(next.entities.tableInstance.mantisStatus).toBeUndefined();
    expect(next.ui.settings.isViewOnly).toBe(true);
  });

  it("pending: a full table annotation sets the mantis status and locks the table", () => {
    const next = reducer(cities(), automaticAnnotation.pending("req", args("fullTable")));
    expect(next.entities.tableInstance.mantisStatus).toBe("PENDING");
    expect(next.ui.settings.isViewOnly).toBe(true);
  });

  it("fulfilled: stores the statuses and stays locked while one is pending", () => {
    const next = reducer(
      cities(),
      automaticAnnotation.fulfilled(
        { datasetId: "d1", tableId: "t1", mantisStatus: "PENDING", schemaStatus: "DONE" },
        "req",
        args("fullTable"),
      ),
    );
    expect(next.entities.tableInstance).toMatchObject({ mantisStatus: "PENDING", schemaStatus: "DONE" });
    expect(next.ui.settings.isViewOnly).toBe(true);
  });

  it("fulfilled: unlocks the table once nothing is pending", () => {
    const locked = reducer(cities(), automaticAnnotation.pending("req", args("schema")));
    const next = reducer(
      locked,
      automaticAnnotation.fulfilled(
        { datasetId: "d1", tableId: "t1", schemaStatus: "DONE" },
        "req",
        args("schema"),
      ),
    );
    expect(next.entities.tableInstance.schemaStatus).toBe("DONE");
    expect(next.ui.settings.isViewOnly).toBe(false);
  });

  it("fulfilled: leaves a status alone when the answer does not carry it", () => {
    const next = reducer(
      cities({ tableInstance: { mantisStatus: "DONE", schemaStatus: "DONE" } }),
      automaticAnnotation.fulfilled({ datasetId: "d1", tableId: "t1" }, "req", args("schema")),
    );
    expect(next.entities.tableInstance).toMatchObject({ mantisStatus: "DONE", schemaStatus: "DONE" });
  });
});

describe("compliance", () => {
  const args = { datasetId: "d1", tableId: "t1" };

  it("pending and rejected", () => {
    const pending = reducer(cities(), tableCompliance.pending("req", args));
    expect(pending.entities.tableInstance.complianceStatus).toBe("PENDING");
    const rejected = reducer(pending, tableCompliance.rejected(new Error("x"), "req", args));
    expect(rejected.entities.tableInstance.complianceStatus).toBe("ERROR");
  });

  it("fulfilled: the check runs on in the background", () => {
    const next = reducer(cities(), tableCompliance.fulfilled({ response: {} }, "req", args));
    expect(next.entities.tableInstance.complianceStatus).toBe("PENDING");
  });

  it("fulfilled: does not undo a result the socket already delivered", () => {
    const next = reducer(
      cities({ tableInstance: { complianceStatus: "DONE" } }),
      tableCompliance.fulfilled({ response: {} }, "req", args),
    );
    expect(next.entities.tableInstance.complianceStatus).toBe("DONE");
  });
});

describe("getDependencies.fulfilled", () => {
  it("stores the dependency graph, or null when there is none", () => {
    const graph = { nodes: {} } as any;
    const next = reducer(cities(), getDependencies.fulfilled(graph, "req", {}));
    expect(next.dependencies).toBe(graph);
    const none = reducer(next, getDependencies.fulfilled(undefined as any, "req", {}));
    expect(none.dependencies).toBeNull();
  });
});
