import { describe, expect, it } from "vitest";
import { normalizeConfigResponse } from "./config";

describe("normalizeConfigResponse", () => {
  it('renames the backend "reconcilers" to "reconciliators"', () => {
    const reconcilers = [{ id: "r1" }] as any;
    expect(normalizeConfigResponse({ reconcilers }).reconciliators).toBe(
      reconcilers,
    );
  });

  it("defaults everything that is missing", () => {
    expect(normalizeConfigResponse({})).toEqual({
      reconciliators: [],
      extenders: [],
      modifiers: [],
      complianceServices: [],
      annotationQuickViewUrl: "",
      policyEditorUrl: "",
      policyEngineUrl: "",
    });
  });

  it("passes the other lists and the quickView url through", () => {
    const out = normalizeConfigResponse({
      extenders: [{ id: "e" }] as any,
      modifiers: [{ id: "m" }] as any,
      complianceServices: [{ id: "c" }] as any,
      annotationQuickViewUrl: "http://q",
    });
    expect(out.extenders).toEqual([{ id: "e" }]);
    expect(out.modifiers).toEqual([{ id: "m" }]);
    expect(out.complianceServices).toEqual([{ id: "c" }]);
    expect(out.annotationQuickViewUrl).toBe("http://q");
  });
});
