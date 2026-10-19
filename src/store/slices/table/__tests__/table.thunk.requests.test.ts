import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import tableReducer, {
  updateUI,
} from "../table.slice";
import {
  automaticAnnotation,
  deleteOperationAndRedo,
  exportTable,
  extend,
  filterTable,
  modify,
  reconcile,
  redoOperationFromLog,
  redoWithSync,
  saveTable,
  suggest,
  undoWithSync,
  updateSchemaSocket,
  updateTableSocket,
} from "../table.thunk";
import { getOperationDownstreamDeps } from "../table.thunk";
import { buildTable, cities } from "./fixtures";

const api = vi.hoisted(() => ({
  reconcile: vi.fn(),
  extend: vi.fn(),
  modify: vi.fn(),
  suggest: vi.fn(),
  saveTable: vi.fn(),
  exportTable: vi.fn(),
  automaticAnnotation: vi.fn(),
  getDependencies: vi.fn(),
  deleteOperation: vi.fn(),
  getOperationDownstreamDeps: vi.fn(),
  redoOperation: vi.fn(),
  removeLoggedOperation: vi.fn(),
  restoreLoggedOperation: vi.fn(),
}));
vi.mock("@services/api/table", () => ({ default: api }));

const wikidata = { id: "wikidata", prefix: "wd", uri: "https://www.wikidata.org/wiki/" };

const makeStore = (table: any = cities(), reconciliators: Record<string, any> = { wikidata }) =>
  configureStore({
    reducer: {
      table: tableReducer,
      config: (state: any = { entities: { reconciliators: { byId: reconciliators } } }) => state,
    },
    preloadedState: { table, config: { entities: { reconciliators: { byId: reconciliators } } } } as any,
    middleware: (getDefault) => getDefault({ serializableCheck: false, immutableCheck: false }),
  });

type Store = ReturnType<typeof makeStore>;
let store: Store;
const table = () => (store.getState() as any).table;

// not a toggle: selecting twice keeps the column selected
const selectCity = () => store.dispatch(updateUI({ selectedColumnsIds: { city: true } }));

beforeEach(() => {
  vi.clearAllMocks();
  api.getDependencies.mockResolvedValue({ data: { operations: [] } });
  store = makeStore();
});

describe("exportTable", () => {
  it("returns the file and flags it when the response is a blob", async () => {
    api.exportTable.mockResolvedValueOnce({ config: { responseType: "blob" }, data: "BLOB" });
    const result: any = await store.dispatch(exportTable({ format: "csv", params: { tableId: "t1" } }));
    expect(result.payload).toEqual({ data: "BLOB", isBlob: true });
    expect(api.exportTable).toHaveBeenCalledWith("csv", { tableId: "t1" }, undefined);
  });

  it("returns the data for other responses", async () => {
    api.exportTable.mockResolvedValueOnce({ config: {}, data: { a: 1 } });
    const result: any = await store.dispatch(exportTable({ format: "json", params: {}, payload: { x: 1 } }));
    expect(result.payload).toEqual({ a: 1 });
    expect(api.exportTable).toHaveBeenCalledWith("json", {}, { x: 1 });
  });
});

describe("saveTable", () => {
  it("sends the table with its column order and the deleted columns", async () => {
    store = makeStore({ ...cities(), ui: { ...cities().ui, deletedColumnsIds: { gone: "Gone" } } });
    api.saveTable.mockResolvedValueOnce({ data: { lastModifiedDate: "2025-05-05" } });
    const result: any = await store.dispatch(saveTable({ a: 1 }));
    const [data, params, tableId, datasetId, deleted] = api.saveTable.mock.calls[0];
    expect(data.columnOrder).toEqual(["city", "note"]);
    expect(data.rows.allIds).toEqual(["r1", "r2", "r3"]);
    expect([params, tableId, datasetId, deleted]).toEqual([{ a: 1 }, "t1", "d1", ["Gone"]]);
    expect(result.payload).toEqual({ lastModifiedDate: "2025-05-05" });
    expect(table().ui.deletedColumnsIds).toEqual({});
    expect(table().ui.lastSaved).toBe("2025-05-05");
  });

  it("keeps the deleted columns and reports the error when saving fails", async () => {
    store = makeStore({ ...cities(), ui: { ...cities().ui, deletedColumnsIds: { gone: "Gone" } } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    api.saveTable.mockRejectedValueOnce(new Error("offline"));
    const result: any = await store.dispatch(saveTable({}));
    expect(result.type).toBe("table/saveTable/rejected");
    expect(result.error.message).toBe("offline");
    expect(table().ui.deletedColumnsIds).toEqual({ gone: "Gone" });
    expect(console.error).toHaveBeenCalled();
  });

  it("reports an error that is not an Error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    api.saveTable.mockRejectedValueOnce("boom");
    const result: any = await store.dispatch(saveTable({}));
    expect(result.type).toBe("table/saveTable/rejected");
  });
});

describe("filterTable", () => {
  const filter = async (tag: string, value: string) =>
    ((await store.dispatch(filterTable({ tag, value }))) as any).payload;

  it("suggests labels starting with the text, case insensitive", async () => {
    expect(await filter("label", "pa")).toEqual([{ label: "Paris" }]);
  });
  it("suggests candidate names and types", async () => {
    expect(await filter("metaName", "wd:q2")).toEqual([{ label: "wd:Q220" }, { label: "wd:Q2" }]);
    const typed = buildTable({
      columns: ["a"],
      rows: { r1: { a: ["x", [{ id: "wd:Q1", type: [{ id: "T", name: "Human" }] }, { id: "wd:Q2" }]] } },
    });
    store = makeStore(typed);
    expect(await filter("metaType", "h")).toEqual([{ label: "Human" }]);
  });
  it("suggests numeric labels and skips empty ones", async () => {
    store = makeStore(buildTable({ columns: ["a"], rows: { r1: { a: "12" }, r2: { a: "" } } }));
    store.getState().table.entities.rows.byId.r1.cells.a.label = 12 as any;
    const labels = (await filter("label", "1")).map((l: any) => l.label);
    expect(labels).toEqual(["12"]);
  });
  it("suggests at most ten distinct labels", async () => {
    const rows = Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`r${i}`, { a: `x${i}` }]));
    store = makeStore(buildTable({ columns: ["a"], rows }));
    expect(await filter("label", "x")).toHaveLength(10);
  });
  it("accepts names that are plain text", async () => {
    const named = cities();
    named.entities.rows.byId.r1.cells.city.metadata[0].name = "Plain" as any;
    store = makeStore(named);
    expect(await filter("metaName", "plain")).toEqual([{ label: "Plain" }]);
  });
});

describe("reconcile", () => {
  const reconciliator: any = {
    id: "wikidata",
    relativeUrl: "/wikidata",
    formParams: [{ id: "extra", inputType: "text" }],
  };
  const args = (over: Record<string, any> = {}) => ({
    items: [{ id: "r1$city", label: "Rome" }],
    reconciliator,
    formValues: { extra: "x" },
    ...over,
  });

  it("sends the items and the form values for the selected column", async () => {
    selectCity();
    api.reconcile.mockResolvedValueOnce({ data: { "r1$city": { id: "r1$city", metadata: [] }, operationLog: { id: "op" } } });
    const result: any = await store.dispatch(reconcile(args({ silent: true })));
    const [url, data, tableId, datasetId, columnName, token, silent] = api.reconcile.mock.calls[0];
    expect(url).toBe("/wikidata");
    expect(data).toMatchObject({
      serviceId: "wikidata",
      items: args().items,
      tableId: "t1",
      datasetId: "d1",
      columnName: "city",
      extra: "x",
    });
    expect([tableId, datasetId, columnName, silent]).toEqual(["t1", "d1", "city", true]);
    expect(token).toBeDefined();
    expect(result.payload.operationLog).toEqual({ id: "op" });
    expect(Object.keys(result.payload.data)).toEqual(["r1$city"]);
    expect(api.getDependencies).toHaveBeenCalledWith({ tableId: "t1", datasetId: "d1" });
  });

  it("uses an empty column name when no column is selected", async () => {
    api.reconcile.mockResolvedValueOnce({ data: {} });
    await store.dispatch(reconcile(args()));
    expect(api.reconcile.mock.calls[0][4]).toBe("");
  });

  it("cancels the request when the thunk is aborted", async () => {
    api.reconcile.mockReturnValueOnce(new Promise(() => {}));
    const promise = store.dispatch(reconcile(args()));
    await Promise.resolve();
    const token = api.reconcile.mock.calls[0][5];
    promise.abort();
    expect(token.reason.message).toBe("Aborted by user");
  });
});

describe("suggest", () => {
  it("sends the matched candidate of each row, and can be cancelled", async () => {
    selectCity();
    api.suggest.mockReturnValueOnce(new Promise(() => {}));
    const promise = store.dispatch(suggest({ suggester: "/s" }));
    await Promise.resolve();
    const [suggester, metadata, token] = api.suggest.mock.calls[0];
    expect(suggester).toBe("/s");
    expect(metadata.map((m: any) => m.id)).toEqual(["wd:Q220"]);
    promise.abort();
    expect(token.reason.message).toBe("Aborted by user");
  });

  it("returns the suggestions", async () => {
    selectCity();
    api.suggest.mockResolvedValueOnce({ data: { data: [1, 2] } });
    const result: any = await store.dispatch(suggest({ suggester: "/s" }));
    expect(result.payload).toEqual({ suggester: "/s", data: [1, 2] });
  });
});

describe("extend", () => {
  const extender = (over: Record<string, any> = {}): any => ({
    id: "ext",
    relativeUrl: "/ext",
    formParams: [],
    ...over,
  });
  const run = async (e: any, formValues: Record<string, any> = {}, selected = true) => {
    if (selected) selectCity();
    api.extend.mockResolvedValueOnce({
      data: { columns: {}, meta: {}, dependencies: {}, operationLog: { id: "op" } },
    });
    return (await store.dispatch(extend({ extender: e, formValues }))) as any;
  };

  it("sends the matched candidates of the selected column", async () => {
    const result = await run(extender());
    const [url, data, tableId, datasetId, columnName, token] = api.extend.mock.calls[0];
    expect(url).toBe("/ext");
    expect(data).toMatchObject({ serviceId: "ext", items: { city: { r1: "wd:Q220" } } });
    expect([tableId, datasetId, columnName]).toEqual(["t1", "d1", "city"]);
    expect(token).toBeDefined();
    expect(result.payload).toMatchObject({ selectedColumnId: "city", operationLog: { id: "op" } });
    expect(result.payload.data).toEqual({ columns: {}, meta: {} });
    expect(api.getDependencies).toHaveBeenCalled();
  });

  it("sends every row to services that want rich objects or all values", async () => {
    await run(extender({ id: "llmClassifier" }));
    expect(Object.keys(api.extend.mock.calls[0][1].items.city)).toEqual(["r1", "r2", "r3"]);
    api.extend.mockClear();
    await run(extender({ allValues: true }));
    expect(api.extend.mock.calls[0][1].items.city.r1.matchingType).toBe("exact");
  });

  it("sends every row as plain ids when filtering is skipped", async () => {
    await run(extender({ skipFiltering: true }));
    expect(api.extend.mock.calls[0][1].items.city).toEqual({ r1: "wd:Q220", r2: "", r3: "" });
  });

  it("takes the selected columns from the form, else from the service", async () => {
    await run(extender({ selectedColumns: ["note"] }), { selectedColumns: ["city"] });
    expect(api.extend.mock.calls[0][1].selectedColumns).toEqual(["city"]);
    await run(extender({ selectedColumns: ["note"] }));
    expect(api.extend.mock.calls[1][1].selectedColumns).toEqual(["note"]);
    await run(extender());
    expect(api.extend.mock.calls[2][1].selectedColumns).toBeUndefined();
  });

  it("works from the columns of the form when none is selected", async () => {
    await run(extender(), { selectedColumns: ["city"] }, false);
    expect(Object.keys(api.extend.mock.calls[0][1].items)).toEqual(["city"]);
    expect(api.extend.mock.calls[0][4]).toBe("");
  });

  it("cancels the request when the thunk is aborted", async () => {
    selectCity();
    api.extend.mockReturnValueOnce(new Promise(() => {}));
    const promise = store.dispatch(extend({ extender: extender(), formValues: {} }));
    await Promise.resolve();
    const token = api.extend.mock.calls[0][5];
    promise.abort();
    expect(token.reason.message).toBe("Aborted by user");
  });
});

describe("modify", () => {
  const modifier = (over: Record<string, any> = {}): any => ({
    id: "mod",
    relativeUrl: "/mod",
    formParams: [],
    ...over,
  });
  const run = async (m: any, formValues: Record<string, any> = {}) => {
    selectCity();
    api.modify.mockResolvedValueOnce({ data: { columns: {}, dependencies: {}, operationLog: { id: "op" } } });
    return (await store.dispatch(modify({ modifier: m, formValues }))) as any;
  };

  it("sends the cells of the selected column and the modifier options", async () => {
    const result = await run(modifier(), {
      joinColumns: ["a"],
      selectedColumns: ["city"],
      columnType: "t",
      separator: ",",
      splitDatetime: true,
    });
    const [url, data, tableId, datasetId, columnName] = api.modify.mock.calls[0];
    expect(url).toBe("/mod");
    expect(data).toMatchObject({
      serviceId: "mod",
      joinColumns: ["a"],
      selectedColumns: ["city"],
      columnType: "t",
      separator: ",",
      splitDatetime: true,
    });
    expect(data.items.city.r1[0]).toBe("Rome");
    expect([tableId, datasetId, columnName]).toEqual(["t1", "d1", "city"]);
    expect(result.payload).toMatchObject({ selectedColumnId: "city", operationLog: { id: "op" } });
  });

  it("sends every column when filtering is skipped, as objects when all values are wanted", async () => {
    await run(modifier({ skipFiltering: true, allValues: true }));
    const { items } = api.modify.mock.calls[0][1];
    expect(Object.keys(items)).toEqual(["city", "note"]);
    expect(items.city.r2).toMatchObject({ matchingType: "none" });
  });
});

describe("automaticAnnotation", () => {
  const args = { datasetId: "d1", tableId: "t1", target: "fullTable" as const, method: "alligator" as const };

  it("sends the whole table, and the llm choice when given", async () => {
    api.automaticAnnotation.mockResolvedValueOnce({ data: { mantisStatus: "PENDING" } });
    const result: any = await store.dispatch(automaticAnnotation({ ...args, useLLM: false }));
    const [params, data] = api.automaticAnnotation.mock.calls[0];
    expect(params).toEqual({ datasetId: "d1", tableId: "t1", target: "fullTable", method: "alligator" });
    expect(data).toMatchObject({ target: "fullTable", method: "alligator", useLLM: false });
    expect(Object.keys(data.rows)).toEqual(["r1", "r2", "r3"]);
    expect(data.table.id).toBe("t1");
    expect(result.payload).toEqual({ mantisStatus: "PENDING" });
    expect(table().entities.tableInstance.mantisStatus).toBe("PENDING");
  });

  it("omits the llm choice when not given", async () => {
    api.automaticAnnotation.mockResolvedValueOnce({ data: {} });
    await store.dispatch(automaticAnnotation(args));
    expect(api.automaticAnnotation.mock.calls[0][1]).not.toHaveProperty("useLLM");
  });

  it("applies the schema when the answer carries one", async () => {
    api.automaticAnnotation.mockResolvedValueOnce({
      data: {
        table: { id: "t1" },
        result: { kind_classification: { city: "entity" }, ner_classification: {} },
        schemaStatus: "DONE",
      },
    });
    await store.dispatch(automaticAnnotation({ ...args, target: "schema" }));
    expect(table().entities.columns.byId.city.kind).toBe("entity");
  });
});

describe("socket updates", () => {
  const backend = (id = "t1") => ({
    table: { id, idDataset: "d1", lastModifiedDate: "2025-06-06", minMetaScore: 0, maxMetaScore: 0.9 },
    columns: table().entities.columns.byId,
    rows: table().entities.rows.byId,
  });

  it("updateTableSocket applies the table of the current table, keeping the column order", async () => {
    store.dispatch(updateUI({ settings: { isViewOnly: true } } as any));
    await store.dispatch(updateTableSocket({ ...backend(), columnOrder: ["note", "city"] } as any));
    expect(table().entities.columns.allIds).toEqual(["city", "note"]);
    expect(table().entities.tableInstance.lastModifiedDate).toBe("2025-06-06");
    expect(table().ui.settings.isViewOnly).toBe(false);
    expect(table().ui.settings.scoreLowerBound).toBeCloseTo(0.3);
  });

  it("updateTableSocket ignores another table, or an empty store", async () => {
    await store.dispatch(updateTableSocket(backend("other") as any));
    expect(table().entities.tableInstance.lastModifiedDate).not.toBe("2025-06-06");
    store = makeStore({ ...cities(), entities: { ...cities().entities, tableInstance: {} } });
    await store.dispatch(updateTableSocket(backend() as any));
    expect(table().entities.tableInstance).toEqual({});
  });

  it("updateSchemaSocket applies the schema of the current table and unlocks it", async () => {
    store.dispatch(updateUI({ settings: { isViewOnly: true } } as any));
    await store.dispatch(
      updateSchemaSocket({
        table: { id: "t1" },
        result: { kind_classification: { city: "entity" }, ner_classification: {} },
      } as any),
    );
    expect(table().entities.columns.byId.city.kind).toBe("entity");
    expect(table().ui.settings.isViewOnly).toBe(false);
  });

  it("updateSchemaSocket ignores another table, or an empty store", async () => {
    const schema: any = {
      table: { id: "other" },
      result: { kind_classification: { city: "entity" }, ner_classification: {} },
    };
    await store.dispatch(updateSchemaSocket(schema));
    expect(table().entities.columns.byId.city.kind).toBeUndefined();
    store = makeStore({ ...cities(), entities: { ...cities().entities, tableInstance: {} } });
    await store.dispatch(updateSchemaSocket(schema));
    expect(table().entities.columns.byId.city.kind).toBeUndefined();
  });
});

describe("deleteOperationAndRedo", () => {
  const withDependencies = (dependencies: any) => {
    store.dispatch({ type: "table/updateDependencies", payload: dependencies });
  };

  it("does nothing for a table that was never loaded", async () => {
    store = makeStore({ ...cities(), entities: { ...cities().entities, tableInstance: {} } });
    await store.dispatch(deleteOperationAndRedo({ opId: "op" }));
    expect(api.deleteOperation).not.toHaveBeenCalled();
  });

  it("deletes the operation, the columns it created and the reconciliation it made", async () => {
    const base = cities();
    store = makeStore({
      ...base,
      entities: {
        ...base.entities,
        rows: {
          ...base.entities.rows,
          byId: {
            ...base.entities.rows.byId,
            r1: {
              ...base.entities.rows.byId.r1,
              cells: {
                ...base.entities.rows.byId.r1.cells,
                note: { ...base.entities.rows.byId.r1.cells.note, metadata: [{ id: "wd:Q7", match: false }] },
              },
            },
          },
        },
      },
    } as any);
    withDependencies({
      columns: { city: { createdBy: "op-ext" }, note: { createdBy: "other" }, ghost: { createdBy: "op-ext" }, plain: {} },
      operations: [
        { id: "op-rec", operationType: "RECONCILIATION", columnName: "note" },
        { id: "op-rec", operationType: "RECONCILIATION", columnName: "ghost" },
        { id: "op-rec2", operationType: "RECONCILIATION", columnName: "note" },
        { id: "op-rec", operationType: "EXTENSION", columnName: "note" },
        { id: "op-rec", operationType: "RECONCILIATION" },
      ],
    });
    api.deleteOperation.mockResolvedValueOnce({
      data: { deleted: ["op-ext", "op-rec"], reconResults: [], dependencies: { operations: ["fresh"] } },
    });
    await store.dispatch(deleteOperationAndRedo({ opId: "op-ext" }));
    expect(api.deleteOperation).toHaveBeenCalledWith({ datasetId: "d1", tableId: "t1", opId: "op-ext" });
    expect(table().entities.columns.allIds).toEqual(["note"]);
    expect(table().entities.rows.byId.r1.cells.note.metadata).toEqual([]);
    // the graph the backend returned is stored right away; a refresh is requested
    expect(table().dependencies).toEqual({ operations: ["fresh"] });
    expect(api.getDependencies).toHaveBeenCalledWith({ tableId: "t1", datasetId: "d1" });
  });

  it("stores the dependency graph the backend sent", async () => {
    api.getDependencies.mockResolvedValue({ data: undefined });
    api.deleteOperation.mockResolvedValueOnce({ data: { dependencies: { operations: ["fresh"] } } });
    await store.dispatch(deleteOperationAndRedo({ opId: "op" }));
    expect(table().ui).not.toHaveProperty("key");
  });

  it("applies the reconciliations the backend redid", async () => {
    api.deleteOperation.mockResolvedValueOnce({
      data: {
        deleted: ["op"],
        reconResults: [
          {
            serviceId: "wikidata",
            reconData: { "r3$city": { id: "r3$city", metadata: [{ id: "wd:Q64", name: "Berlin", score: 1, match: true }] } },
          },
        ],
      },
    });
    await store.dispatch(deleteOperationAndRedo({ opId: "op" }));
    expect(table().entities.rows.byId.r3.cells.city.metadata[0].id).toBe("wd:Q64");
    // a redone reconciliation is not an undo step
    expect(table()._draft.patches).toHaveLength(0);
  });

  it("assumes the operation was deleted when the backend says nothing", async () => {
    api.deleteOperation.mockResolvedValueOnce({ data: undefined });
    await store.dispatch(deleteOperationAndRedo({ opId: "op" }));
    expect(api.getDependencies).toHaveBeenCalled();
  });
});

describe("redoOperationFromLog", () => {
  it("does nothing for a table that was never loaded", async () => {
    store = makeStore({ ...cities(), entities: { ...cities().entities, tableInstance: {} } });
    await store.dispatch(redoOperationFromLog({ opId: "op" }));
    expect(api.redoOperation).not.toHaveBeenCalled();
  });

  it("applies the redone reconciliation with the reconciliator of its service", async () => {
    api.redoOperation.mockResolvedValueOnce({
      data: {
        serviceId: "wikidata",
        dependencies: {},
        "r3$city": { id: "r3$city", metadata: [{ id: "wd:Q64", name: "Berlin", score: 1, match: true }] },
      },
    });
    await store.dispatch(redoOperationFromLog({ opId: "op" }));
    expect(api.redoOperation).toHaveBeenCalledWith({ datasetId: "d1", tableId: "t1", opId: "op" });
    expect(table().entities.rows.byId.r3.cells.city.metadata[0].id).toBe("wd:Q64");
    expect(api.getDependencies).toHaveBeenCalled();
  });
});

describe("undoWithSync / redoWithSync", () => {
  const relabel = (value: string) =>
    store.dispatch({ type: "table/updateCellLabel", payload: { cellId: "r1$city", value } });
  const reconciled = (opId: string) =>
    store.dispatch(
      reconcile.fulfilled(
        { data: {}, reconciliator: wikidata as any, operationLog: { id: opId } as any },
        "req",
        { items: [], reconciliator: wikidata as any, formValues: {} },
      ),
    );
  const label = () => table().entities.rows.byId.r1.cells.city.label;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("undo with nothing to undo only dispatches undo", async () => {
    await store.dispatch(undoWithSync(undefined));
    expect(api.removeLoggedOperation).not.toHaveBeenCalled();
  });

  it("undoes a plain change locally", async () => {
    relabel("A");
    await store.dispatch(undoWithSync(1));
    expect(label()).toBe("Rome");
    expect(api.removeLoggedOperation).not.toHaveBeenCalled();
  });

  it("removes the logged operations of the steps it undoes, and refreshes the dependencies", async () => {
    reconciled("op1");
    relabel("A");
    reconciled("op2");
    api.removeLoggedOperation.mockResolvedValue({});
    await store.dispatch(undoWithSync(3));
    expect(api.removeLoggedOperation.mock.calls.map(([arg]) => arg.opId)).toEqual(["op2", "op1"]);
    expect(api.removeLoggedOperation.mock.calls[0][0]).toMatchObject({ datasetId: "d1", tableId: "t1" });
    expect(api.getDependencies).toHaveBeenCalled();
  });

  it("undoes one step by default", async () => {
    reconciled("op1");
    reconciled("op2");
    api.removeLoggedOperation.mockResolvedValue({});
    await store.dispatch(undoWithSync(undefined));
    expect(api.removeLoggedOperation).toHaveBeenCalledTimes(1);
  });

  it("keeps going when removing a logged operation fails", async () => {
    reconciled("op1");
    api.removeLoggedOperation.mockRejectedValueOnce(new Error("x"));
    await store.dispatch(undoWithSync(1));
    expect(console.error).toHaveBeenCalled();
    expect(api.getDependencies).toHaveBeenCalled();
  });

  it("does not call the backend for a table that was never loaded", async () => {
    reconciled("op1");
    store.dispatch({ type: "table/updateCurrentTable", payload: { id: undefined, idDataset: undefined } });
    await store.dispatch(undoWithSync(1));
    expect(api.removeLoggedOperation).not.toHaveBeenCalled();
  });

  it("redo with nothing to redo only dispatches redo", async () => {
    await store.dispatch(redoWithSync());
    expect(api.restoreLoggedOperation).not.toHaveBeenCalled();
  });

  it("redoes a plain change locally", async () => {
    relabel("A");
    await store.dispatch(undoWithSync(1));
    await store.dispatch(redoWithSync());
    expect(label()).toBe("A");
    expect(api.restoreLoggedOperation).not.toHaveBeenCalled();
  });

  it("restores the logged operation of the step it redoes", async () => {
    reconciled("op1");
    api.removeLoggedOperation.mockResolvedValue({});
    api.restoreLoggedOperation.mockResolvedValue({});
    await store.dispatch(undoWithSync(1));
    await store.dispatch(redoWithSync());
    expect(api.restoreLoggedOperation).toHaveBeenCalledWith({ datasetId: "d1", tableId: "t1" }, { id: "op1" });
  });

  it("keeps going when restoring the logged operation fails", async () => {
    reconciled("op1");
    api.removeLoggedOperation.mockResolvedValue({});
    api.restoreLoggedOperation.mockRejectedValueOnce(new Error("x"));
    await store.dispatch(undoWithSync(1));
    api.getDependencies.mockClear();
    await store.dispatch(redoWithSync());
    expect(console.error).toHaveBeenCalled();
    expect(api.getDependencies).toHaveBeenCalled();
  });

  it("does not call the backend for a table that was never loaded", async () => {
    reconciled("op1");
    api.removeLoggedOperation.mockResolvedValue({});
    await store.dispatch(undoWithSync(1));
    store.dispatch({ type: "table/updateCurrentTable", payload: { id: undefined, idDataset: undefined } });
    await store.dispatch(redoWithSync());
    expect(api.restoreLoggedOperation).not.toHaveBeenCalled();
  });
});

describe("modify without a selected column", () => {
  it("uses an empty column name", async () => {
    api.modify.mockResolvedValueOnce({ data: { columns: {}, dependencies: {} } });
    await store.dispatch(modify({ modifier: { id: "m", relativeUrl: "/m", formParams: [] } as any, formValues: {} }));
    expect(api.modify.mock.calls[0][4]).toBe("");
  });
});

describe("redone reconciliation of an unknown service", () => {
  it("is skipped instead of breaking the reducer", async () => {
    api.redoOperation.mockResolvedValueOnce({
      data: { serviceId: "gone", "r3$city": { id: "r3$city", metadata: [{ id: "wd:Q64", name: "B", score: 1, match: true }] } },
    });
    const before = table().entities.rows;
    await store.dispatch(redoOperationFromLog({ opId: "op" }));
    expect(table().entities.rows).toEqual(before);
  });
});

describe("getOperationDownstreamDeps", () => {
  it("is an empty list when the answer has no downstream operations", async () => {
    api.getOperationDownstreamDeps.mockResolvedValueOnce({ data: { opId: "op" } });
    const result: any = await store.dispatch(getOperationDownstreamDeps({ datasetId: "d", tableId: "t", opId: "op" }));
    expect(result.payload).toEqual([]);
  });
});
