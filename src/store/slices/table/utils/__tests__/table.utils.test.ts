import { describe, expect, it } from "vitest";
import {
  findCell,
  getCell,
  getColumn,
  getContextPrefix,
  getIdsFromCell,
  orderColumnIds,
  removeObject,
  stripPrefix,
  toggleObject,
} from "../table.utils";
import { cities } from "../../__tests__/fixtures";

describe("objects", () => {
  it("removeObject drops a key without touching the original", () => {
    const original = { a: 1, b: 2 };
    expect(removeObject(original, "a")).toEqual({ b: 2 });
    expect(original).toEqual({ a: 1, b: 2 });
  });

  it("toggleObject adds a missing id and removes a present one", () => {
    expect(toggleObject({}, "a", true)).toEqual({ a: true });
    expect(toggleObject({ a: true, b: true }, "a", true)).toEqual({ b: true });
  });
});

describe("ids", () => {
  it("getIdsFromCell splits a cell id into row and column", () => {
    expect(getIdsFromCell("r1$city")).toEqual(["r1", "city"]);
  });

  it("getContextPrefix is the prefix of the id, or empty without an id", () => {
    expect(getContextPrefix({ id: "wd:Q1" } as any)).toBe("wd");
    expect(getContextPrefix({ id: "Q1" } as any)).toBe("Q1");
    expect(getContextPrefix({} as any)).toBe("");
  });

  it("stripPrefix removes the prefix of an id", () => {
    expect(stripPrefix("wd:Q1")).toBe("Q1");
    expect(stripPrefix("Q1")).toBe("Q1");
  });
});

describe("column order", () => {
  it("keeps the ids as they are without a saved order", () => {
    expect(orderColumnIds(["a", "b"], undefined)).toEqual(["a", "b"]);
    expect(orderColumnIds(["a", "b"], "b,a")).toEqual(["a", "b"]);
  });

  it("follows the saved order, ignores unknown ids and appends missing ones", () => {
    expect(orderColumnIds(["a", "b", "c"], ["c", "x", "a"])).toEqual(["c", "a", "b"]);
  });
});

describe("lookup", () => {
  it("getColumn and getCell find what is there", () => {
    const state = cities();
    expect(getColumn(state, "city").id).toBe("city");
    expect(getCell(state, "r1", "city").label).toBe("Rome");
  });

  it("findCell returns undefined for a missing row or column", () => {
    const state = cities();
    expect(findCell(state, "r1", "city")?.label).toBe("Rome");
    expect(findCell(state, "ghost", "city")).toBeUndefined();
    expect(findCell(state, "r1", "ghost")).toBeUndefined();
  });
});
