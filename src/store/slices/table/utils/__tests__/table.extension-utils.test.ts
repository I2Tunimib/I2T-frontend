import { describe, expect, it } from "vitest";
import {
  createCell,
  getAnnotationMeta,
  getColumnAnnotationMeta,
  getColumnMetadata,
  getMetadata,
} from "../table.extension-utils";

const WD = "https://www.wikidata.org/wiki/";
const item = (id: string, over: Record<string, any> = {}): any => ({ id, name: "n", score: 0.5, match: false, ...over });

describe("getAnnotationMeta", () => {
  it("is nothing without candidates", () => {
    expect(getAnnotationMeta(undefined)).toEqual({});
    expect(getAnnotationMeta(null)).toEqual({});
    expect(getAnnotationMeta([])).toEqual({});
  });
  it("is the annotation of the candidates", () => {
    expect(getAnnotationMeta([item("wd:Q1", { score: 0.2 }), item("wd:Q2", { score: 0.8, match: true })])).toEqual({
      annotationMeta: {
        annotated: true,
        match: { value: true, reason: "reconciliator" },
        lowestScore: 0.2,
        highestScore: 0.8,
      },
    });
  });
});

describe("getColumnAnnotationMeta", () => {
  it("is the annotation of the entities of the first metadata", () => {
    expect(getColumnAnnotationMeta(undefined)).toEqual({});
    expect(getColumnAnnotationMeta([])).toEqual({});
    expect(getColumnAnnotationMeta([{} as any])).toEqual({});
    expect(getColumnAnnotationMeta([{ entity: [item("wd:Q1", { match: true })] } as any]).annotationMeta?.match.value).toBe(true);
  });
});

describe("getMetadata", () => {
  it("adds the name and link of the knowledge base", () => {
    expect(getMetadata([item("wd:Q1", { name: "Rome" })])).toEqual([
      { id: "wd:Q1", name: { value: "Rome", uri: `${WD}Q1` }, score: 0.5, match: false },
    ]);
  });
  it("uses a placeholder link for an unknown knowledge base", () => {
    expect(getMetadata([item("zz:7")])[0].name.uri).toBe("empty/7");
  });
  it("drops candidates without a prefix or that are links already", () => {
    expect(getMetadata([item("plain"), item("http://x/1"), item("https://x/2"), item("wd:Q1")]).map((m) => m.id)).toEqual(["wd:Q1"]);
  });
  it("is empty for no candidates", () => {
    expect(getMetadata([])).toEqual([]);
  });
});

describe("getColumnMetadata", () => {
  it("resolves the entities and leaves other metadata as it is", () => {
    const result = getColumnMetadata([{ entity: [item("wd:Q1")] }, { property: [] }] as any);
    expect(result[0].entity[0].name.uri).toBe(`${WD}Q1`);
    expect(result[1]).toEqual({ property: [] });
    expect(getColumnMetadata([])).toEqual([]);
  });
});

describe("createCell", () => {
  it("builds a cell from what a service answered", () => {
    const cell = createCell("r1", "c", {
      label: "Rome",
      metadata: [item("wd:Q1", { match: true })],
      annotations: { a: [{ id: 1 }] } as any,
    });
    expect(cell).toMatchObject({ id: "r1$c", label: "Rome", annotations: { a: [{ id: 1 }] } });
    expect(cell.metadata).toHaveLength(1);
    expect(cell.annotationMeta?.annotated).toBe(true);
  });

  it("has no annotations or annotation meta when there is nothing", () => {
    const cell: any = createCell("r1", "c", { label: "x", metadata: [] });
    expect(cell).not.toHaveProperty("annotations");
    expect(cell).not.toHaveProperty("annotationMeta");
  });

  it("is a placeholder when the service had no cell", () => {
    expect(createCell("r1", "c", null)).toEqual({ id: "r1$c", label: "null", metadata: [] });
  });

  describe("labels", () => {
    const label = (value: any) => createCell("r", "c", { label: value, metadata: [] }).label;

    it("keeps text", () => {
      expect(label("Rome")).toBe("Rome");
    });
    it("reads the value, label or uri of an object, in that order", () => {
      expect(label({ value: "v", label: "l", uri: "u" })).toBe("v");
      expect(label({ label: "l", uri: "u" })).toBe("l");
      expect(label({ uri: "u" })).toBe("u");
    });
    it("writes out any other object", () => {
      expect(label({ other: 1 })).toBe('{"other":1}');
    });
    it("turns other values into text, nothing into an empty label", () => {
      expect(label(42)).toBe("42");
      expect(label(null)).toBe("");
      expect(label(undefined)).toBe("");
    });
  });
});
