import { describe, expect, it } from "vitest";
import { cancelTokenFor, getRequestFormValues } from "../table.request-utils";
import { cities } from "./../../__tests__/fixtures";
import tableReducer, { updateUI } from "../../table.slice";


// results are checked by the assertions, not by the compiler
const reducer = tableReducer as (state: any, action: any) => any;

describe("cancelTokenFor", () => {
  it("is cancelled when the signal aborts", () => {
    const controller = new AbortController();
    const token = cancelTokenFor(controller.signal);
    expect(token.reason).toBeUndefined();
    controller.abort();
    expect(token.reason?.message).toBe("Aborted by user");
  });

  it("refuses to start when the signal is already aborted", () => {
    const controller = new AbortController();
    controller.abort();
    expect(() => cancelTokenFor(controller.signal)).toThrow("Aborted");
  });
});

describe("getRequestFormValues", () => {
  const select = (colIds: string[]) =>
    reducer(
      cities(),
      updateUI({ selectedColumnsIds: Object.fromEntries(colIds.map((id) => [id, true])) }),
    );
  const noneSelected = () => cities();

  const romeMeta = { name: { value: "wd:Q220", uri: "http://kg/wd:Q220" }, kbId: "wd:Q220", value: "Rome" };
  const noMeta = (value: string) => ({ kbId: "", value, matchingType: "none" });

  it("is empty without form params", () => {
    expect(getRequestFormValues(undefined as any, {}, cities())).toEqual({});
  });

  it("builds no items unless asked to", () => {
    expect(getRequestFormValues([], {}, select(["city"]))).toEqual({});
  });

  describe("items", () => {
    it("matched: the matched candidate id of the rows that have one", () => {
      const result = getRequestFormValues([], {}, select(["city"]), { buildItems: true });
      expect(result.items).toEqual({ city: { r1: "wd:Q220" } });
    });

    it("all: every row, with an empty id when nothing is matched", () => {
      const result = getRequestFormValues([], {}, select(["city"]), { buildItems: true, itemMode: "all" });
      expect(result.items).toEqual({ city: { r1: "wd:Q220", r2: "", r3: "" } });
    });

    it("rich objects: the matched candidate as an object", () => {
      const result = getRequestFormValues([], {}, select(["city"]), {
        buildItems: true,
        itemRichObjects: true,
      });
      expect(result.items).toEqual({ city: { r1: { ...romeMeta, matchingType: "exact" } } });
    });

    it("rich objects for every row", () => {
      const result = getRequestFormValues([], {}, select(["city"]), {
        buildItems: true,
        itemMode: "all",
        itemRichObjects: true,
      });
      expect(result.items.city).toEqual({
        r1: { ...romeMeta, matchingType: "exact" },
        r2: noMeta("Paris"),
        r3: noMeta("Berlin"),
      });
    });

    it("values: label, candidates and column of every cell", () => {
      const result = getRequestFormValues([], {}, select(["note"]), { buildItems: true, itemMode: "values" });
      expect(result.items.note.r1).toEqual(["capital", [], "note"]);
      expect(Object.keys(result.items.note)).toEqual(["r1", "r2", "r3"]);
    });
  });

  describe("which columns", () => {
    it("uses the selected columns", () => {
      const result = getRequestFormValues([], {}, select(["city", "note"]), { buildItems: true });
      expect(Object.keys(result.items)).toEqual(["city", "note"]);
    });

    it("can use every column", () => {
      const result = getRequestFormValues([], {}, select(["city"]), { buildItems: true, allColumns: true });
      expect(Object.keys(result.items)).toEqual(["city", "note"]);
    });

    it("falls back to the columns of the form when asked and nothing is selected", () => {
      const options = { buildItems: true, selectedColumnsFallback: true };
      const asList = getRequestFormValues([], { selectedColumns: ["city"] }, noneSelected(), options);
      expect(Object.keys(asList.items)).toEqual(["city"]);
      const asObject = getRequestFormValues([], { selectedColumns: { note: true } }, noneSelected(), options);
      expect(Object.keys(asObject.items)).toEqual(["note"]);
      const asText = getRequestFormValues([], { selectedColumns: "city" }, noneSelected(), options);
      expect(asText.items).toEqual({});
    });

    it("does not fall back unless asked", () => {
      const result = getRequestFormValues([], { selectedColumns: ["city"] }, noneSelected(), { buildItems: true });
      expect(result.items).toEqual({});
    });

    it("does not fall back when columns are selected or the form has none", () => {
      const options = { buildItems: true, selectedColumnsFallback: true };
      const selected = getRequestFormValues([], { selectedColumns: ["note"] }, select(["city"]), options);
      expect(Object.keys(selected.items)).toEqual(["city"]);
      expect(getRequestFormValues([], {}, noneSelected(), options).items).toEqual({});
    });
  });

  describe("form params", () => {
    const params = (...inputs: [string, string][]) =>
      inputs.map(([id, inputType]) => ({ id, inputType })) as any;

    it("sends the cells of a chosen column for column inputs", () => {
      const state = cities();
      ["selectColumns", "selectColumnAll"].forEach((inputType) => {
        const result = getRequestFormValues(params(["col", inputType]), { col: "note" }, state);
        expect(result.col.r1).toEqual(["capital", [], "note"]);
        expect(result.col.r3).toEqual(["", [], "note"]);
      });
    });

    it("sends the cells of every chosen column for multiple column inputs", () => {
      const result = getRequestFormValues(
        params(["cols", "multipleColumnSelect"]),
        { cols: ["city", "note"] },
        cities(),
      );
      expect(Object.keys(result.cols)).toEqual(["city", "note"]);
      expect(result.cols.city.r1[0]).toBe("Rome");
    });

    it("passes other values as they are", () => {
      const result = getRequestFormValues(params(["text", "text"]), { text: "hello" }, cities());
      expect(result).toEqual({ text: "hello" });
    });

    it("skips inputs without a value", () => {
      const result = getRequestFormValues(params(["text", "text"], ["col", "selectColumns"]), { text: "" }, cities());
      expect(result).toEqual({});
    });
  });
});
