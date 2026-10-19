import { describe, expect, it } from "vitest";
import reducer from "../config.slice";
import { getConfig } from "../config.thunk";

const initial = () => reducer(undefined, { type: "@@init" });

const services = (over: object = {}) => ({
  reconciliators: [{ id: "r1" }, { id: "r2" }] as any[],
  extenders: [{ id: "e1" }] as any[],
  modifiers: [{ id: "m1" }] as any[],
  complianceServices: [{ id: "c1" }] as any[],
  annotationQuickViewUrl: "http://quick",
  policyEditorUrl: "http://policy-editor",
  policyEngineUrl: "http://policy-engine",
  ...over,
});

const fulfilled = (payload: ReturnType<typeof services>) =>
  getConfig.fulfilled(payload, "req");

describe("config slice", () => {
  it("stores the services normalized, with the quickView url", () => {
    const state = reducer(initial(), fulfilled(services()));
    expect(state.entities.reconciliators.allIds).toEqual(["r1", "r2"]);
    expect(state.entities.reconciliators.byId.r2).toEqual({ id: "r2" });
    expect(state.entities.extenders.allIds).toEqual(["e1"]);
    expect(state.entities.modifiers.allIds).toEqual(["m1"]);
    expect(state.entities.complianceServices.allIds).toEqual(["c1"]);
    expect(state.annotationQuickViewUrl).toBe("http://quick");
  });

  it("does not duplicate ids when the config is fetched twice", () => {
    const once = reducer(initial(), fulfilled(services()));
    const twice = reducer(once, fulfilled(services()));
    expect(twice.entities).toEqual(once.entities);
  });

  it("drops services that disappeared from the backend", () => {
    const once = reducer(initial(), fulfilled(services()));
    const next = reducer(
      once,
      fulfilled(services({ reconciliators: [{ id: "r2" }] })),
    );
    expect(next.entities.reconciliators.allIds).toEqual(["r2"]);
    expect(next.entities.reconciliators.byId.r1).toBeUndefined();
  });

  it("no longer carries the static app config", () => {
    expect(initial()).not.toHaveProperty("app");
    expect(initial()).not.toHaveProperty("_requests");
  });
});
