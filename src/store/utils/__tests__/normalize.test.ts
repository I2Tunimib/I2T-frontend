import { describe, expect, it } from "vitest";
import { normalize } from "../normalize";

describe("normalize", () => {
  it("builds byId and allIds in order", () => {
    expect(normalize([{ id: "b" }, { id: "a" }])).toEqual({
      byId: { b: { id: "b" }, a: { id: "a" } },
      allIds: ["b", "a"],
    });
  });

  it("is empty for an empty list", () => {
    expect(normalize([])).toEqual({ byId: {}, allIds: [] });
  });

  it("keeps one id when an entity appears twice (last one wins)", () => {
    const state = normalize([
      { id: "a", v: 1 },
      { id: "a", v: 2 },
    ]);
    expect(state.allIds).toEqual(["a"]);
    expect(state.byId.a.v).toBe(2);
  });
});
