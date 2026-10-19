import { describe, expect, it } from "vitest";
import { canEditTable } from "../table.access-utils";

const dataset = { userId: 1, editors: [2, "3"] };

describe("canEditTable", () => {
  it("lets the dataset owner edit", () => {
    expect(canEditTable(1, dataset)).toBe(true);
  });

  it("lets a dataset editor edit (ids compared as strings)", () => {
    expect(canEditTable(2, dataset)).toBe(true);
    expect(canEditTable("3", dataset)).toBe(true);
  });

  it("denies other users", () => {
    expect(canEditTable(9, dataset)).toBe(false);
  });

  it("denies when the user or dataset is unknown", () => {
    expect(canEditTable(undefined, dataset)).toBe(false);
    expect(canEditTable(1, null)).toBe(false);
    expect(canEditTable(1, undefined)).toBe(false);
  });

  it("tolerates a dataset without an editors list", () => {
    expect(canEditTable(2, { userId: 1 })).toBe(false);
  });

  describe("restricted table", () => {
    it("requires dataset editors to also be table editors", () => {
      const restricted = { visibility: "restricted", editors: [3] };
      expect(canEditTable(2, dataset, restricted)).toBe(false);
      expect(canEditTable(3, dataset, restricted)).toBe(true);
    });

    it("never locks the owner out", () => {
      expect(
        canEditTable(1, dataset, { visibility: "restricted", editors: [] }),
      ).toBe(true);
    });

    it("does not grant a table editor who is not a dataset editor", () => {
      expect(
        canEditTable(9, dataset, { visibility: "restricted", editors: [9] }),
      ).toBe(false);
    });
  });

  it("ignores table editors when the table inherits the dataset ACL", () => {
    expect(canEditTable(2, dataset, { visibility: null, editors: [] })).toBe(
      true,
    );
    expect(canEditTable(9, dataset, { visibility: null, editors: [9] })).toBe(
      false,
    );
  });
});
