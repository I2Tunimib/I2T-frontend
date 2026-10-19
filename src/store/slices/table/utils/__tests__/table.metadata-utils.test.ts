import { describe, expect, it } from "vitest";
import {
  getColumnTypeStats,
  hasMetadataId,
  isMatching,
  matchedIds,
  metadataIdCandidates,
  pickBestCandidate,
  sameIds,
} from "../table.metadata-utils";
import { buildTable, cities } from "../../__tests__/fixtures";

describe("isMatching", () => {
  it("accepts true and the text true only", () => {
    expect(isMatching(true)).toBe(true);
    expect(isMatching("true")).toBe(true);
    expect(isMatching(false)).toBe(false);
    expect(isMatching("false")).toBe(false);
    expect(isMatching(undefined)).toBe(false);
    expect(isMatching(1)).toBe(false);
  });
});

describe("metadataIdCandidates", () => {
  it("lowercases text and adds the id without prefix", () => {
    expect(metadataIdCandidates(" WD:Q1 ")).toEqual(["wd:q1", "q1"]);
    expect(metadataIdCandidates("Q1")).toEqual(["q1"]);
  });

  it("has nothing for missing or blank ids, and for a prefix without id", () => {
    expect(metadataIdCandidates(null)).toEqual([]);
    expect(metadataIdCandidates(undefined)).toEqual([]);
    expect(metadataIdCandidates("  ")).toEqual([]);
    expect(metadataIdCandidates("wd:")).toEqual(["wd:"]);
  });

  it("keeps everything after the first colon", () => {
    expect(metadataIdCandidates("geo:12:34")).toEqual(["geo:12:34", "12:34"]);
  });

  it("turns numbers into text", () => {
    expect(metadataIdCandidates(42)).toEqual(["42"]);
  });

  it("flattens lists", () => {
    expect(metadataIdCandidates(["wd:Q1", "Q2"])).toEqual(["wd:q1", "q1", "q2"]);
  });

  it("reads the label, id and value of an object, without duplicates", () => {
    expect(metadataIdCandidates({ label: "wd:Q1", id: "wd:Q1", value: "Q2" })).toEqual(["wd:q1", "q1", "q2"]);
    expect(metadataIdCandidates({ id: "Q9" })).toEqual(["q9"]);
  });

  it("falls back to the text of the object when it has none of those fields", () => {
    // the text goes through the same prefix splitting as any other id
    expect(metadataIdCandidates({ other: 1 })).toEqual([`{"other":1}`, "1}"]);
  });
});

describe("hasMetadataId", () => {
  const item: any = { id: "wd:Q220" };
  it("matches by full id or id without prefix, in any case", () => {
    expect(hasMetadataId(item, ["wd:q220"])).toBe(true);
    expect(hasMetadataId(item, ["q220"])).toBe(true);
    expect(hasMetadataId(item, ["q1"])).toBe(false);
  });
});

describe("pickBestCandidate", () => {
  const items = (...scores: (number | undefined)[]) => scores.map((score, i) => ({ id: `c${i}`, score })) as any;

  it("is the index of the best candidate at or above the threshold", () => {
    expect(pickBestCandidate(items(0.2, 0.9, 0.5), 0.5)).toBe(1);
    expect(pickBestCandidate(items(0.5), 0.5)).toBe(0);
  });
  it("is the first one on a tie", () => {
    expect(pickBestCandidate(items(0.9, 0.9), 0.5)).toBe(0);
  });
  it("is -1 when nothing reaches the threshold or there are no candidates", () => {
    expect(pickBestCandidate(items(0.1, 0.2), 0.5)).toBe(-1);
    expect(pickBestCandidate([], 0.5)).toBe(-1);
  });
  it("counts a missing score as zero", () => {
    expect(pickBestCandidate(items(undefined, 0.3), 0)).toBe(1);
    expect(pickBestCandidate(items(0.3, undefined), 0)).toBe(0);
    expect(pickBestCandidate(items(undefined), 0)).toBe(0);
  });
});

describe("matched ids", () => {
  const items: any = [
    { id: "a", match: true },
    { id: "b", match: false },
    { id: "c", match: true },
  ];
  it("matchedIds lists the matched ones", () => {
    expect(matchedIds(items)).toEqual(["a", "c"]);
  });
  it("sameIds compares regardless of order", () => {
    expect(sameIds(["a", "c"], ["c", "a"])).toBe(true);
    expect(sameIds(["a"], ["a", "c"])).toBe(false);
    expect(sameIds(["a", "b"], ["a", "c"])).toBe(false);
  });
});

describe("getColumnTypeStats", () => {
  const typed = (id: string, name: string) => ({ id, name, uri: `http://t/${id}` });

  it("counts the types of the matched candidates by id without prefix", () => {
    const table = buildTable({
      columns: ["a"],
      rows: {
        r1: { a: ["x", [{ id: "wd:Q1", match: true, decider: "human", type: [typed("wd:T1", "City"), typed("T2", "Place")] }]] },
        r2: { a: ["y", [{ id: "wd:Q2", match: true, type: [typed("wd:T1", "City")] }]] },
        r3: { a: ["z", [{ id: "wd:Q3", match: false, type: [typed("wd:T9", "Other")] }, { id: "wd:Q4" }]] },
        r4: { a: "w" },
      },
    });
    const stats = getColumnTypeStats(table.entities.rows, "a");
    expect(Object.keys(stats)).toEqual(["T1", "T2"]);
    expect(stats.T1).toEqual({ id: "T1", label: "City", uri: "http://t/wd:T1", count: 2, match: true, decider: "human" });
    expect(stats.T2.count).toBe(1);
  });

  it("is empty when no matched candidate has types, or the column is missing", () => {
    expect(getColumnTypeStats(cities().entities.rows, "city")).toEqual({});
    expect(getColumnTypeStats(cities().entities.rows, "ghost")).toEqual({});
  });
});
