import tableAPI, { GetTableResponse } from "@services/api/table";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@store";
//import { levDistance } from "@services/utils/lev-distance";
import { isEmptyObject } from "@services/utils/objects-utils";
import {
  Extender,
  Modifier,
  FormInputParams,
  Reconciliator,
} from "../config/interfaces/config";
import {
  BaseMetadata,
  Cell,
  ColumnMetadata,
  ColumnState,
  RowState,
  TableState,
} from "./interfaces/table";
import { updateTable, updateUI } from "./table.slice";
import { getIdsFromCell } from "./utils/table.utils";

const ACTION_PREFIX = "table";

export enum TableThunkActions {
  SAVE_TABLE = "saveTable",
  GET_TABLE = "getTable",
  GET_CHALLENGE_TABLE = "getChallengeTable",
  RECONCILE = "reconcile",
  AUTOMATIC_ANNOTATION = "automaticAnnotation",
  UPDATE_TABLE_SOCKET = "updateTableSocket",
  EXTEND = "extend",
  MODIFY = "modify",
  SUGGEST = "suggest",
  CONVER_W3C = "convertToW3C",
  EXPORT_TABLE = "exportTable",
  FILTER_TABLE = "filterTable",
}

// export const getTable = createAsyncThunk(
//   `${ACTION_PREFIX}/getTable`,
//   async (id: ID) => {
//     const response = await tableAPI.getTable(id);
//     return response.data;
//   }
// );

export const getTable = createAsyncThunk(
  `${ACTION_PREFIX}/getTable`,
  async (params: Record<string, string | number>) => {
    const response = await tableAPI.getTable(params);
    return response.data;
  }
);

export const exportTable = createAsyncThunk(
  `${ACTION_PREFIX}/exportTable`,
  async ({
    format,
    params,
  }: {
    format: string;
    params: Record<string, string | number>;
  }) => {
    const response = await tableAPI.exportTable(format, params);
    return response.data;
  }
);

export const getChallengeTable = createAsyncThunk(
  `${ACTION_PREFIX}/getChallengeTable`,
  async ({
    datasetName,
    tableName,
  }: {
    datasetName: string;
    tableName: string;
  }) => {
    const response = await tableAPI.getChallengeTable(datasetName, tableName);
    return response.data;
  }
);

export const saveTable = createAsyncThunk(
  `${ACTION_PREFIX}/saveTable`,
  async (
    params: Record<string, string | number> = {},
    { getState, dispatch }
  ) => {
    const { table } = getState() as RootState;
    const { entities } = table;
    const { tableInstance } = entities;

    // Get the list of deleted columns for this save operation
    const deletedColumns = table.ui.deletedColumnsIds;
    const deletedColumnsList = Object.values(deletedColumns) as string[];

    console.log("Save operation - deleted columns:", deletedColumnsList);
    console.log("Save operation - column order:", entities.columns.allIds);
    console.log(
      "Save operation - tableId:",
      tableInstance.id,
      "datasetId:",
      tableInstance.idDataset
    );

    // Check for non-ASCII characters in IDs
    if (tableInstance.id && /[^\x00-\xFF]/.test(tableInstance.id)) {
      console.warn("TableId contains non-ASCII characters:", tableInstance.id);
    }
    if (
      tableInstance.idDataset &&
      /[^\x00-\xFF]/.test(tableInstance.idDataset)
    ) {
      console.warn(
        "DatasetId contains non-ASCII characters:",
        tableInstance.idDataset
      );
    }

    // Check deleted columns for non-ASCII characters
    deletedColumnsList.forEach((col, index) => {
      if (/[^\x00-\xFF]/.test(col)) {
        console.warn(
          `Deleted column ${index} contains non-ASCII characters:`,
          col
        );
      }
    });

    console.log("Save operation - sending data structure:", {
      hasTableInstance: !!entities.tableInstance,
      hasColumns: !!entities.columns,
      hasRows: !!entities.rows,
      columnsCount: Object.keys(entities.columns?.byId || {}).length,
    });

    try {
      // Include column order in the data being saved
      const dataToSave = {
        ...entities,
        columnOrder: entities.columns.allIds, // Add column order to preserve frontend ordering
      };

      console.log(
        "DEBUG: Saving table with columnOrder:",
        entities.columns.allIds
      );
      console.log("DEBUG: Data structure being saved:", {
        hasTableInstance: !!dataToSave.tableInstance,
        hasColumns: !!dataToSave.columns,
        hasRows: !!dataToSave.rows,
        hasColumnOrder: !!dataToSave.columnOrder,
        columnOrder: dataToSave.columnOrder,
      });

      const response = await tableAPI.saveTable(
        dataToSave, // Send entities with column order
        params,
        tableInstance.id,
        tableInstance.idDataset,
        deletedColumnsList // Pass deleted columns to the API
      );

      console.log("Save operation - response received:", {
        status: response?.status,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : "no data",
      });

      // Clear deleted columns after successful save
      dispatch({ type: "table/clearDeletedColumns" });

      return response.data;
    } catch (error) {
      console.error("Save operation - error occurred:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorResponse: (error as any)?.response,
      });
      throw error;
    }
  }
);

type GetLabelsProps = {
  rows: RowState;
  columns: ColumnState;
};

const LABELS_FN = {
  label: ({ rows, columns }: GetLabelsProps) =>
    rows.allIds.flatMap((rowId) => {
      return columns.allIds.map((colId) => {
        return rows.byId[rowId].cells[colId].label;
      });
    }),
  metaName: ({ rows, columns }: GetLabelsProps) =>
    rows.allIds.flatMap((rowId) => {
      return columns.allIds.flatMap((colId) => {
        return rows.byId[rowId].cells[colId].metadata.map(
          (metaItem) => metaItem.name.value
        );
      });
    }),
  metaType: ({ rows, columns }: GetLabelsProps) =>
    rows.allIds.flatMap((rowId) => {
      return columns.allIds.flatMap((colId) => {
        return rows.byId[rowId].cells[colId].metadata.flatMap((metaItem) => {
          return metaItem.type
            ? metaItem.type.map((type: any) => type.name)
            : [];
        });
      });
    }),
};

export const filterTable = createAsyncThunk(
  `${ACTION_PREFIX}/filterTable`,
  async ({ value, tag }: { value: string; tag: string }, { getState }) => {
    const { table } = getState() as RootState;
    const { rows, columns } = table.entities;

    const searchValue = value.toLowerCase();

    const allLabels = Array.from(
      new Set(LABELS_FN[tag as keyof typeof LABELS_FN]({ rows, columns }))
    );

    return allLabels
      .filter((label) => (label.toLowerCase().startsWith(searchValue)))
      .slice(0, 10) // max 10 suggestions
      .map((label) => ({ label }));
  },

);

const getContextColumns = (ids: string[], rows: RowState) => {
  return ids.reduce((acc, colId) => {
    acc[colId] = rows.allIds.reduce((accInn, rowId) => {
      const cell = rows.byId[rowId].cells[colId];
      const [r, c] = getIdsFromCell(cell.id);
      accInn[r] = cell;
      return accInn;
    }, {} as Record<string, Cell>);
    return acc;
  }, {} as Record<string, any>);
};

const getColumnMetaIds = (colId: string, rowEntities: RowState) => {
  return rowEntities.allIds.reduce((acc, rowId) => {
    const cell = rowEntities.byId[rowId].cells[colId];
    const trueMeta = cell.metadata.find((metaItem) => metaItem.match);
    if (trueMeta) {
      // eslint-disable-next-line prefer-destructuring
      acc[rowId] = trueMeta.id;
    }
    return acc;
  }, {} as Record<string, any>);
};

// New helper for extension services like llmClassifier
const getColumnMetaObjects = (colId: string, rowEntities: RowState) => {
  return rowEntities.allIds.reduce((acc, rowId) => {
    const cell = rowEntities.byId[rowId].cells[colId];
    const trueMeta = cell.metadata.find((metaItem) => metaItem.match);
    if (trueMeta) {
      acc[rowId] = {
        kbId: trueMeta.id,
        value: cell.label,
        matchingType: trueMeta.match ? "exact" : "fuzzy", // Adjust logic if needed
      };
    }
    return acc;
  }, {} as Record<string, any>);
};

const getColumnValues = (colId: string, rowEntities: RowState) => {
  return rowEntities.allIds.reduce((acc, rowId) => {
    const cell = rowEntities.byId[rowId].cells[colId];
    acc[rowId] = [cell.label, cell.metadata, colId];
    return acc;
  }, {} as Record<string, any>);
};
const getMultipleColumnsValues = (colId: string, rowEntities: RowState) => {
  return rowEntities.allIds.reduce((acc, rowId) => {
    const cell = rowEntities.byId[rowId].cells[colId];
    acc[rowId] = [cell.label, cell.metadata, colId];
    return acc;
  }, {} as Record<string, any>);
};
const getRequestFormValuesExtension = (
  formParams: FormInputParams[],
  formValues: Record<string, any>,
  table: TableState,
  extender?: Extender
) => {
  if (!formParams) {
    return {};
  }

  const { ui, entities } = table;
  const { rows } = entities;
  const selectedColumnsIds = Object.keys(ui.selectedColumnsIds);
  console.log("getting request form values", extender);
  const requestParams = {} as Record<string, any>;

  // Use getColumnMetaObjects only for llmClassifier, otherwise use getColumnMetaIds
  if (extender && extender.id === "llmClassifier") {
    console.log("intercepted llmClassifier");
    requestParams.items = selectedColumnsIds.reduce((acc, key) => {
      acc[key] = getColumnMetaObjects(key, rows);
      return acc;
    }, {} as Record<string, any>);
  } else {
    // fallback: if extender is undefined or not llmClassifier, use KB id logic
    requestParams.items = selectedColumnsIds.reduce((acc, key) => {
      acc[key] = getColumnMetaIds(key, rows);
      return acc;
    }, {} as Record<string, any>);
  }

  formParams.forEach(({ id, inputType }) => {
    if (formValues[id]) {
      if (inputType === "selectColumns") {
        requestParams[id] = getColumnValues(formValues[id], rows);
      } else if (inputType === "multipleColumnSelect") {
        requestParams[id] = {};
        for (const colId of formValues[id]) {
          requestParams[id][colId] = getMultipleColumnsValues(colId, rows);
        }
      } else {
        requestParams[id] = formValues[id];
      }
    }
  });

  return requestParams;
};

const getRequestFormValuesReconciliation = (
  formParams: FormInputParams[],
  formValues: Record<string, any>,
  table: TableState
) => {
  if (!formParams) {
    return {};
  }

  const { entities } = table;
  const { rows } = entities;
  const requestParams = {} as Record<string, any>;

  formParams.forEach(({ id, inputType }) => {
    if (formValues[id]) {
      if (inputType === "selectColumns") {
        requestParams[id] = getColumnValues(formValues[id], rows);
      } else if (inputType === "multipleColumnSelect") {
        requestParams[id] = {};
        for (const colId of formValues[id]) {
          requestParams[id][colId] = getMultipleColumnsValues(colId, rows);
        }
      } else {
        requestParams[id] = formValues[id];
      }
    }
  });

  return requestParams;
};

const getRequestFormValuesModification = (
    formParams: FormInputParams[],
    formValues: Record<string, any>,
    table: TableState,
    modifier?: Modifier
) => {
  if (!formParams) {
    return {};
  }

  const { ui, entities } = table;
  const { rows } = entities;
  const selectedColumnsIds = Object.keys(table.ui.selectedColumnsIds);
  console.log("getting request form values", modifier);
  const requestParams = {} as Record<string, any>;

  requestParams.items = selectedColumnsIds.reduce((acc, key) => {
    acc[key] = getColumnValues(key, rows);
    return acc;
  }, {} as Record<string, any>);

  formParams.forEach(({ id, inputType }) => {
    if (formValues[id]) {
      if (inputType === "selectColumns") {
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

export const reconcile = createAsyncThunk(
  `${ACTION_PREFIX}/reconcile`,
  async (
    {
      items,
      reconciliator,
      formValues,
    }: {
      items: any;
      reconciliator: Reconciliator;
      formValues: Record<string, any>;
    },
    { getState }
  ) => {
    const { table } = getState() as RootState;
    const { relativeUrl, formParams, id } = reconciliator;
    const { entities, ui } = table;
    const { tableInstance, columns } = entities;

    // Get the selected column name
    const selectedColumnIds = Object.keys(ui.selectedColumnsIds);
    const selectedColumnId = selectedColumnIds[0];
    const columnName = columns.byId[selectedColumnId]?.label || "";

    const params = getRequestFormValuesReconciliation(
      formParams,
      formValues,
      table
    );

    console.log("reconcile", { items, reconciliator, formValues, params });
    const data = {
      serviceId: reconciliator.id,
      items,
      tableId: tableInstance.id,
      datasetId: tableInstance.idDataset,
      columnName,
      ...params,
    };
    const response = await tableAPI.reconcile(
      relativeUrl,
      data,
      tableInstance.id,
      tableInstance.idDataset,
      columnName
    );
    return {
      data: response.data,
      reconciliator,
    };
  }
);

type AutomaticAnnotationThunkInputProps = {
  datasetId: string;
  tableId: string;
};

type AutomaticAnnotationThunkOutputProps = {
  datasetId: string;
  tableId: string;
  mantisStatus: "PENDING";
};

export const automaticAnnotation = createAsyncThunk<
  AutomaticAnnotationThunkOutputProps,
  AutomaticAnnotationThunkInputProps
>(`${ACTION_PREFIX}/automaticAnnotation`, async (params, { getState }) => {
  const { table } = getState() as any;
  const { entities } = table;
  const data = {
    rows: entities.rows.byId,
    columns: entities.columns.byId,
    table: entities.tableInstance,
  };
  const response = await tableAPI.automaticAnnotation(params, data);
  return response.data;
});
export type SuggestThunkInputProps = {
  // rowCellsEntities: any;
  suggester: string;
};
export type SuggestThunkOutputProps = {
  suggester: string;
  data: any;
};

export const suggest = createAsyncThunk<
  SuggestThunkOutputProps,
  SuggestThunkInputProps
>(`${ACTION_PREFIX}/suggest`, async (inputProps, { getState }) => {
  const { suggester } = inputProps;
  const { table } = getState() as RootState;
  const { ui, entities } = table;
  const { rows } = entities;
  const selectedColumnId = Object.keys(ui.selectedColumnsIds)[0];
  const rowsMetadata = rows.allIds
    .map((rowId) => {
      let currentMetadata =
        rows.byId[rowId].cells[selectedColumnId].metadata[0];
      if (currentMetadata.match) {
        return currentMetadata;
      } else {
        return null;
      }
    })
    .filter((meta) => meta !== null);
  const response = await tableAPI.suggest(suggester, rowsMetadata);
  let currentDataResponse = response.data.data;
  console.log("suggest", currentDataResponse);
  return {
    suggester,
    data: currentDataResponse,
  };
});

export type ExtendThunkInputProps = {
  extender: Extender;
  formValues: Record<string, any>;
};
export type ExtendedColumnCell = {
  label: string;
  metadata: BaseMetadata[];
};
type ExtendedColumn = {
  label: string;
  metadata: ColumnMetadata[];
  cells: Record<string, ExtendedColumnCell | null>;
};
interface Property {
  id: string; // Wikidata property ID (e.g., "wd:P31")
  obj: string; // Column name that this property maps to
  name: string; // Human-readable name of the property
  match: boolean; // Whether this is a matched property
  score: number; // Match confidence score (1 = exact match)
}

export type ExtendThunkResponseProps = {
  extender: Extender;
  selectedColumnId: string;
  data: {
    columns: Record<string, ExtendedColumn>;
    meta: Record<string, string>;
    originalColMeta: {
      originalColName: string;
      properties: Property[];
    };
  };
};

/**
 * Handle api call for dynamic form extension
 */
export const extend = createAsyncThunk<
  ExtendThunkResponseProps,
  ExtendThunkInputProps
>(`${ACTION_PREFIX}/extend`, async (inputProps, { getState }) => {
  const { extender, formValues } = inputProps;
  // get root table states
  const { table } = getState() as RootState;
  const { relativeUrl, formParams, id } = extender;
  const { entities, ui } = table;
  const { tableInstance, columns } = entities;

  // Get the selected column name
  const selectedColumnIds = Object.keys(ui.selectedColumnsIds);
  const selectedColumnId = selectedColumnIds[0];
  const columnName = columns.byId[selectedColumnId]?.label || "";

  const params = getRequestFormValuesExtension(
    formParams,
    formValues,
    table,
    extender
  );
  const response = await tableAPI.extend(
    relativeUrl,
    {
      serviceId: id,
      ...params,
    },
    tableInstance.id,
    tableInstance.idDataset,
    columnName
  );
  return {
    data: response.data,
    extender,
    selectedColumnId,
  };
});

export type ModifyThunkInputProps = {
  modifier: Modifier;
  formValues: Record<string, any>;
};

export type ModifyThunkResponseProps = {
  modifier: Modifier;
  selectedColumnId: string;
  data: any;
};

export const modify = createAsyncThunk<
  ModifyThunkResponseProps,
  ModifyThunkInputProps
>(`${ACTION_PREFIX}/modify`, async (inputProps, { getState }) => {
  const { modifier, formValues } = inputProps;

  const { table } = getState() as RootState;
  const { relativeUrl, formParams, id } = modifier;
  const { entities, ui } = table;
  const { tableInstance, columns } = entities;

  const selectedColumnIds = Object.keys(ui.selectedColumnsIds);
  const selectedColumnId = selectedColumnIds[0];
  const columnName = columns.byId[selectedColumnId]?.label || "";

  const params = getRequestFormValuesModification(formParams, formValues, table);

  const response = await tableAPI.modify(
    relativeUrl,
    {
      serviceId: id,
      ...params,
    },
    tableInstance.id,
    tableInstance.idDataset,
    columnName
  );

  return {
    data: response.data,
    modifier,
    selectedColumnId,
  };
});

export const updateTableSocket = createAsyncThunk(
  `${ACTION_PREFIX}/updateTableSocket`,
  async (inputProps: GetTableResponse, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { tableInstance } = state.table.entities;
    const { settings } = state.table.ui;
    const { table } = inputProps;

    if (!isEmptyObject(tableInstance) && table.id === tableInstance.id) {
      console.log("update table socket called");

      // Preserve the current column order when updating from socket
      const currentColumnOrder = state.table.entities.columns.allIds;
      const updatedProps = {
        ...inputProps,
        columnOrder: currentColumnOrder, // Preserve existing column order
      };

      dispatch(updateTable(updatedProps));
      dispatch(
        updateUI({
          settings: {
            ...settings,
            isViewOnly: false,
            scoreLowerBound: (table.maxMetaScore - table.minMetaScore) / 3,
          },
        })
      );
    }
  }
);
