import { describe, expect, it, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import tableReducer from "../table.slice";
import {
  getTable,
  saveTable,
  reconcile,
  extend,
  modify,
  automaticAnnotation,
  tableCompliance,
  suggest,
  filterTable,
  exportTable,
  getChallengeTable,
  updateTableSocket,
  updateSchemaSocket,
  downloadComplianceReport,
  getOperationDownstreamDeps,
  deleteOperationAndRedo,
  redoOperationFromLog,
  undoWithSync,
  redoWithSync,
} from "../table.thunk";
import {
  checkEditAccess,
  releaseTableLock,
  forceUnlockTable,
} from "../table.access.thunk";
import { cities, initial, buildTable } from "./fixtures";

const tableApi = vi.hoisted(() => vi.fn());
const datasetApi = vi.hoisted(() => vi.fn());

vi.mock("@services/api/table", () => ({
  default: {
    getTable: tableApi,
    saveTable: tableApi,
    reconcile: tableApi,
    extend: tableApi,
    modify: tableApi,
    automaticAnnotation: tableApi,
    makeCompliance: tableApi,
    suggest: tableApi,
    filterTable: tableApi,
    exportTable: tableApi,
    getChallengeTable: tableApi,
    downloadComplianceReport: tableApi,
    getOperationDownstreamDeps: tableApi,
    deleteOperation: tableApi,
    redoOperation: tableApi,
    restoreLoggedOperation: tableApi,
    removeLoggedOperation: tableApi,
    getDependencies: tableApi,
  },
}));
vi.mock("@services/api/datasets", () => ({
  default: {
    getDatasetInfo: datasetApi,
    getTableAcl: datasetApi,
    acquireTableLock: datasetApi,
    releaseTableLock: datasetApi,
    forceReleaseTableLock: datasetApi,
  },
}));

const tableResponse = () => ({
  table: { id: "t1", idDataset: "d1", lastModifiedDate: "2025-01-01T00:00:00.000Z" },
  columns: {},
  rows: {},
});

let store: any; // partial stores are built per test

beforeEach(() => {
  vi.clearAllMocks();
  store = configureStore({
    reducer: { table: tableReducer },
    preloadedState: { table: cities() },
  });
});

describe("table thunks", () => {
  it("getTable calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: tableResponse() });
    await store.dispatch(getTable({ id: "t1" }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("saveTable calls the API and clears deleted columns", async () => {
    tableApi.mockResolvedValueOnce({ data: {} });
    const tableWithDeleted = {
      ...cities(),
      ui: { ...cities().ui, deletedColumnsIds: { x: "X" } },
    };
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: tableWithDeleted },
    });
    await store.dispatch(saveTable({}));
    expect(tableApi).toHaveBeenCalled();
    expect(store.getState().table.ui.deletedColumnsIds).toEqual({});
  });

  it("reconcile calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: { dependencies: [], operationLog: {} } });
    const reconciliator = {
      id: "wikidata",
      relativeUrl: "/reconcile",
      formParams: [{ id: "city", inputType: "selectColumns" }],
    } as any;
    store.dispatch({ type: "table/updateColumnSelection", payload: { id: "city" } });
    await store.dispatch(reconcile({ items: {}, reconciliator, formValues: { city: "city" } }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("extend calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: { columns: {}, meta: {}, originalColMeta: undefined } });
    const extender = { id: "ext", relativeUrl: "/extend", formParams: [] } as any;
    store.dispatch({ type: "table/updateColumnSelection", payload: { id: "city" } });
    await store.dispatch(extend({ extender, formValues: {} }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("modify calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: { columns: {}, meta: {}, originalColMeta: undefined } });
    const modifier = {
      id: "mod",
      relativeUrl: "/modify",
      formParams: [{ id: "city", inputType: "selectColumns" }],
    } as any;
    store.dispatch({ type: "table/updateColumnSelection", payload: { id: "city" } });
    await store.dispatch(modify({ modifier, formValues: { city: "city" } }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("automaticAnnotation calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: { table: { id: "t1" }, result: { kind_classification: {}, ner_classification: {} } } });
    await store.dispatch(automaticAnnotation({
      datasetId: "d1", tableId: "t1", target: "schema", method: "alligator",
    }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("tableCompliance calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: {} });
    await store.dispatch(tableCompliance({ datasetId: "d1", tableId: "t1" }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("suggest calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: { data: [] } });
    const metaTable = buildTable({
      columns: ["city"],
      rows: {
        r1: { city: ["Rome", [{ id: "wd:Q1", match: true }]] },
        r2: { city: ["Paris", [{ id: "wd:Q2", match: true }]] },
      },
    });
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: metaTable },
    });
    store.dispatch({ type: "table/updateColumnSelection", payload: { id: "city" } });
    await store.dispatch(suggest({ suggester: "sugg" }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("filterTable computes labels from state", async () => {
    const result = await store.dispatch(filterTable({ value: "r", tag: "label" }));
    expect(result.payload).toEqual([{ label: "Rome" }]);
  });

  it("filterTable computes meta names from state", async () => {
    const result = await store.dispatch(filterTable({ value: "wd:Q", tag: "metaName" }));
    expect(result.payload).toContainEqual({ label: "wd:Q220" });
  });

  it("filterTable computes meta types from state", async () => {
    const metaTable = buildTable({
      columns: ["city"],
      rows: {
        r1: { city: ["Rome", [{ id: "wd:Q1", match: true, type: [{ id: "wd:Q515", name: "City" }] }]] },
      },
    });
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: metaTable },
    });
    const result = await store.dispatch(filterTable({ value: "City", tag: "metaType" }));
    expect(result.payload).toEqual([{ label: "City" }]);
  });

  it("exportTable calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: {} });
    await store.dispatch(exportTable({ format: "csv", params: {}, payload: undefined }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("getChallengeTable calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: {} });
    await store.dispatch(getChallengeTable({ datasetName: "d", tableName: "t" }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("updateTableSocket updates when ids match", async () => {
    await store.dispatch(updateTableSocket({
      table: { id: "t1", name: "renamed", lastModifiedDate: "2025-01-01" },
      columns: cities().entities.columns.byId,
      rows: cities().entities.rows.byId,
    } as any));
    expect(store.getState().table.entities.tableInstance.name).toBe("renamed");
  });

  it("updateTableSocket skips when ids differ", async () => {
    await store.dispatch(updateTableSocket({ table: { id: "other", name: "x" } } as any));
    expect(store.getState().table.entities.tableInstance.name).toBe("table");
  });

  it("updateSchemaSocket sets schema status when ids match", async () => {
    await store.dispatch(updateSchemaSocket({
      table: { id: "t1" },
      result: { kind_classification: {}, ner_classification: {} },
    } as any));
    expect(store.getState().table.entities.tableInstance.schemaStatus).toBe("DONE");
  });

  it("downloadComplianceReport calls the API", async () => {
    tableApi.mockResolvedValueOnce({ data: { report: [] } });
    await store.dispatch(downloadComplianceReport({
      datasetId: "d1", tableId: "t1", reportIndex: 0, format: "json",
    }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("getOperationDownstreamDeps calls the API and returns downstream deps", async () => {
    tableApi.mockResolvedValueOnce({ data: { downstreamDeps: ["op2"] } });
    const result = await store.dispatch(getOperationDownstreamDeps({
      datasetId: "d1", tableId: "t1", opId: "op1",
    }));
    expect(tableApi).toHaveBeenCalled();
    expect(result.payload).toEqual(["op2"]);
  });

  it("deleteOperationAndRedo calls deleteOperation and dispatches reconcile.fulfilled", async () => {
    tableApi.mockResolvedValueOnce({ data: { deleted: ["op1"], reconResults: [], dependencies: null } });
    const stateWithDraft = {
      ...cities(),
      _draft: {
        patches: [],
        inversePatches: [],
        operationRefs: [{ id: "op1", operationType: "RECONCILIATION" }],
        redoOperationRefs: [],
        undoPointer: 0,
        redoPointer: -1,
      },
    };
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: stateWithDraft },
    });
    await store.dispatch(deleteOperationAndRedo({ opId: "op1" }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("redoOperationFromLog calls redoOperation and dispatches reconcile.fulfilled", async () => {
    tableApi.mockResolvedValueOnce({ data: { serviceId: "wikidata", reconcileData: {} } });
    const stateWithDraft = {
      ...cities(),
      _draft: {
        patches: [],
        inversePatches: [],
        operationRefs: [],
        redoOperationRefs: [{ id: "op1", operationType: "RECONCILIATION" }],
        undoPointer: -1,
        redoPointer: 0,
      },
    };
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: stateWithDraft },
    });
    await store.dispatch(redoOperationFromLog({ opId: "op1" }));
    expect(tableApi).toHaveBeenCalled();
  });

  it("undoWithSync with nothing to undo just dispatches undo", async () => {
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: cities() },
    });
    await store.dispatch(undoWithSync(1));
    // No API calls when nothing to undo
    expect(tableApi).not.toHaveBeenCalled();
  });

  it("redoWithSync with nothing to redo just dispatches redo", async () => {
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: cities() },
    });
    await store.dispatch(redoWithSync());
    expect(tableApi).not.toHaveBeenCalled();
  });
});

describe("access thunks", () => {
  beforeEach(() => {
    store = configureStore({
      reducer: { table: tableReducer },
      preloadedState: { table: initial() },
    });
  });

  it("checkEditAccess sets view-only when user cannot edit", async () => {
    datasetApi.mockResolvedValueOnce({ data: {} });
    datasetApi.mockResolvedValueOnce({ data: null });
    await store.dispatch(checkEditAccess({ datasetId: "d1", tableId: "t1" }));
    expect(store.getState().table.ui.settings.isViewOnly).toBe(true);
  });

  it("checkEditAccess handles tableAcl fetch failure", async () => {
    datasetApi.mockResolvedValueOnce({ data: { userId: "u1" } });
    datasetApi.mockRejectedValueOnce(new Error("acl down"));
    await store.dispatch(checkEditAccess({ datasetId: "d1", tableId: "t1", userId: "u1" }));
    expect(store.getState().table.ui.settings.isViewOnly).toBe(true);
  });

  it("checkEditAccess handles dataset fetch failure", async () => {
    datasetApi.mockRejectedValueOnce(new Error("dataset down"));
    await store.dispatch(checkEditAccess({ datasetId: "d1", tableId: "t1", userId: "u1" }));
    expect(store.getState().table.ui.settings.isViewOnly).toBe(true);
  });

  it("checkEditAccess acquires lock when user can edit", async () => {
    datasetApi.mockResolvedValueOnce({ data: { userId: "u1" } });
    datasetApi.mockResolvedValueOnce({ data: { editors: ["u1"] } });
    datasetApi.mockResolvedValueOnce({ data: { acquired: true } });
    await store.dispatch(checkEditAccess({ datasetId: "d1", tableId: "t1", userId: "u1" }));
    expect(store.getState().table.ui.settings.isViewOnly).toBe(false);
  });

  it("releaseTableLock calls the API", async () => {
    await store.dispatch(releaseTableLock({ tableId: "t1" }));
    expect(datasetApi).toHaveBeenCalled();
  });

  it("releaseTableLock ignores API failure", async () => {
    datasetApi.mockRejectedValueOnce(new Error("lock down"));
    await store.dispatch(releaseTableLock({ tableId: "t1" }));
    expect(datasetApi).toHaveBeenCalled();
  });

  it("forceUnlockTable releases and re-acquires the lock", async () => {
    datasetApi.mockResolvedValueOnce({ data: {} });
    datasetApi.mockResolvedValueOnce({ data: { acquired: true } });
    await store.dispatch(forceUnlockTable({ tableId: "t1" }));
    expect(store.getState().table.ui.settings.isViewOnly).toBe(false);
  });
});
