import { describe, expect, it } from "vitest";
import { createAsyncThunk } from "@reduxjs/toolkit";
import reducer from "../requests.slice";
import { toRequestStatus } from "../requests.selectors";

const tableThunk = createAsyncThunk("table/getTable", async () => 1);
const datasetThunk = createAsyncThunk("dataset/getTable", async () => 1);
const initial = () => reducer(undefined, { type: "@@init" });

describe("requests slice", () => {
  it("tracks pending -> done by full type prefix", () => {
    const pending = reducer(initial(), tableThunk.pending("id", undefined));
    expect(pending.byType["table/getTable"]).toEqual({
      status: "pending",
      error: null,
    });
    const done = reducer(
      pending,
      tableThunk.fulfilled(1, "id", undefined),
    );
    expect(done.byType["table/getTable"]).toEqual({
      status: "done",
      error: null,
    });
  });

  it("does not mix thunks with the same name in different features", () => {
    const state = reducer(initial(), tableThunk.pending("id", undefined));
    expect(state.byType["dataset/getTable"]).toBeUndefined();
    const both = reducer(state, datasetThunk.pending("id", undefined));
    expect(Object.keys(both.byType).sort()).toEqual([
      "dataset/getTable",
      "table/getTable",
    ]);
  });

  it("keeps the error of a rejected thunk", () => {
    const state = reducer(
      initial(),
      tableThunk.rejected(new Error("boom"), "id", undefined),
    );
    const entry = state.byType["table/getTable"];
    expect(entry.status).toBe("done");
    expect(entry.error.message).toBe("boom");
  });

  it("prefers the payload error when the thunk rejects with a value", () => {
    const state = reducer(
      initial(),
      tableThunk.rejected(null, "id", undefined, { error: "bad" } as any),
    );
    expect(state.byType["table/getTable"].error).toBe("bad");
  });

  it("forgets only table requests when the table is restored", () => {
    let state = reducer(initial(), tableThunk.pending("id", undefined));
    state = reducer(state, datasetThunk.pending("id", undefined));
    state = reducer(state, { type: "table/restoreInitialState" });
    expect(Object.keys(state.byType)).toEqual(["dataset/getTable"]);
  });

  it("ignores actions that are not thunk lifecycles", () => {
    expect(reducer(initial(), { type: "table/updateUI" })).toEqual(initial());
  });
});

describe("toRequestStatus", () => {
  it("is undefined before the first request", () => {
    expect(toRequestStatus(undefined)).toEqual({
      loading: undefined,
      error: null,
    });
  });
  it("maps pending, done and failed", () => {
    expect(toRequestStatus({ status: "pending", error: null })).toEqual({
      loading: true,
      error: null,
    });
    expect(toRequestStatus({ status: "done", error: null })).toEqual({
      loading: false,
      error: null,
    });
    expect(toRequestStatus({ status: "done", error: "x" })).toEqual({
      loading: false,
      error: "x",
    });
  });
});
