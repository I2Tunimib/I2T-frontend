import { describe, expect, it } from "vitest";
import { headerWidth } from "../header-width";

describe("headerWidth", () => {
  it("grows with the label", () => {
    expect(headerWidth("a much longer label")).toBeGreaterThan(headerWidth("a"));
  });

  it("makes room for the kind and role badges", () => {
    expect(headerWidth("a", { kind: "entity", role: "subject" })).toBeGreaterThan(
      headerWidth("a"),
    );
  });

  it("handles a missing label", () => {
    expect(headerWidth(undefined)).toBeGreaterThan(0);
  });
});
