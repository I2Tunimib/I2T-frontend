import { describe, expect, it } from "vitest";
import CONFIG from "./config";
import { apiEndpoint, buildPath } from "./configHelpers";

const GLOBAL = CONFIG.API.GLOBAL;

describe("apiEndpoint", () => {
  it("substitutes path params and prefixes the global base URL", () => {
    expect(
      apiEndpoint({
        endpoint: "GET_TABLE",
        paramsValue: { datasetId: "d1", tableId: "t1" },
      }),
    ).toBe(`${GLOBAL}/dataset/d1/table/t1`);
  });

  it("resolves a sub-endpoint by name", () => {
    const url = apiEndpoint({
      endpoint: "EXPORT",
      subEndpoint: "JSON Schema (W3C Compliant)",
      paramsValue: { datasetId: "d1", tableId: "t1" },
    });
    expect(url).toBe(
      `${GLOBAL}/dataset/d1/table/t1/export?format=schema_w3c`,
    );
  });

  it("returns an empty string for an unknown sub-endpoint", () => {
    expect(
      apiEndpoint({ endpoint: "EXPORT", subEndpoint: "does-not-exist" }),
    ).toBe("");
  });

  it("url-encodes query params and skips the prefix with useGlobal: false", () => {
    expect(
      buildPath(
        { path: "/search?q=:query", useGlobal: false },
        { query: "a b&c" },
        CONFIG,
      ),
    ).toBe("/search?q=a%20b%26c");
  });
});
