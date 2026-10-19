import axios from "axios";
import { FormInputParams } from "../../config/interfaces/config";
import { RowState, TableState } from "../interfaces/table";

/** An axios cancel token that is cancelled when the thunk is aborted. */
export const cancelTokenFor = (signal: AbortSignal) => {
  const source = axios.CancelToken.source();
  if (signal.aborted) {
    source.cancel("Aborted before request");
    throw new Error("Aborted");
  }
  signal.addEventListener("abort", () => {
    source.cancel("Aborted by user");
  });
  return source.token;
};

/**
 * Build the per-cell metadata map for one column. Replaces the four
 * `getColumnMeta*` helpers.
 *
 * - mode "matched" (default): only rows whose matched candidate exists → its id
 * - mode "all": every row; rows without a match get "" (or a null kbId object)
 * - richObjects: return { name, kbId, value, matchingType } instead of the plain id
 */
const getColumnMeta = (
  colId: string,
  rows: RowState,
  {
    mode = "matched",
    richObjects = false,
  }: { mode?: "matched" | "all"; richObjects?: boolean } = {},
): Record<string, any> => {
  return rows.allIds.reduce((acc, rowId) => {
    const cell = rows.byId[rowId].cells[colId];
    const trueMeta = cell.metadata.find((metaItem) => metaItem.match);
    if (trueMeta) {
      acc[rowId] = richObjects
        ? {
            name: trueMeta.name,
            kbId: trueMeta.id,
            value: cell.label,
            matchingType: "exact",
          }
        : trueMeta.id;
    } else if (mode === "all") {
      acc[rowId] = richObjects
        ? { kbId: "", value: cell.label, matchingType: "none" }
        : "";
    }
    return acc;
  }, {} as Record<string, any>);
};

/** Cell values: [label, metadata, colId] for every row of a column. */
const getColumnValues = (colId: string, rows: RowState) => {
  return rows.allIds.reduce(
    (acc, rowId) => {
      const cell = rows.byId[rowId].cells[colId];
      acc[rowId] = [cell.label, cell.metadata, colId];
      return acc;
    },
    {} as Record<string, any>,
  );
};

/**
 * Build the request form parameters shared by extend / reconcile / modify.
 *
 * - buildItems: whether to build `items` from the selected columns
 * - allColumns: use every column instead of the selected ones
 * - itemMode / itemRichObjects: passed to getColumnMeta for `items`
 */
export const getRequestFormValues = (
  formParams: FormInputParams[],
  formValues: Record<string, any>,
  table: TableState,
  {
    buildItems = false,
    allColumns = false,
    selectedColumnsFallback = false,
    itemMode = "matched",
    itemRichObjects = false,
  }: {
    buildItems?: boolean;
    allColumns?: boolean;
    /** use formValues.selectedColumns when nothing is selected in the UI */
    selectedColumnsFallback?: boolean;
    /** "values" sends [label, metadata, colId] per cell instead of matches */
    itemMode?: "matched" | "all" | "values";
    itemRichObjects?: boolean;
  } = {},
) => {
  if (!formParams) {
    return {};
  }

  const { ui, entities } = table;
  const { rows } = entities;

  let selectedColumnsIds = Object.keys(ui.selectedColumnsIds);
  if (allColumns) {
    selectedColumnsIds = Object.keys(entities.columns.byId);
  } else if (
    selectedColumnsFallback &&
    selectedColumnsIds.length === 0 &&
    formValues &&
    formValues.selectedColumns
  ) {
    if (Array.isArray(formValues.selectedColumns)) {
      selectedColumnsIds = formValues.selectedColumns;
    } else if (typeof formValues.selectedColumns === "object") {
      selectedColumnsIds = Object.keys(formValues.selectedColumns);
    }
  }

  const requestParams = {} as Record<string, any>;

  if (buildItems) {
    requestParams.items = selectedColumnsIds.reduce(
      (acc, key) => {
        acc[key] =
          itemMode === "values"
            ? getColumnValues(key, rows)
            : getColumnMeta(key, rows, {
                mode: itemMode,
                richObjects: itemRichObjects,
              });
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  formParams.forEach(({ id, inputType }) => {
    if (formValues[id]) {
      if (inputType === "selectColumns" || inputType === "selectColumnAll") {
        requestParams[id] = getColumnValues(formValues[id], rows);
      } else if (inputType === "multipleColumnSelect") {
        requestParams[id] = {};
        for (const colId of formValues[id]) {
          requestParams[id][colId] = getColumnValues(colId, rows);
        }
      } else {
        requestParams[id] = formValues[id];
      }
    }
  });

  return requestParams;
};
