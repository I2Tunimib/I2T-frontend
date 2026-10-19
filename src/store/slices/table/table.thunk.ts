import tableAPI, {
  GetTableResponse,
  GetSchemaResponse,
} from "@services/api/table";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IConfigState } from "../config/interfaces/config";
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
  DependencyGraph,
  DependencyOperation,
  ExtendedColumnCell,
  Property,
} from "./interfaces/table";
import {
  updateTable,
  updateSchema,
  updateUI,
  updateDependencies,
  deleteColumn,
  clearColumnReconciliation,
  undo,
  redo,
} from "./table.slice";
import { getIdsFromCell } from "./utils/table.utils";
import {
  cancelTokenFor,
  getRequestFormValues,
} from "./utils/table.request-utils";

const ACTION_PREFIX = "table";

/**
 * The parts of the store these thunks read. Declared here, not taken from the
 * store, so the thunks do not depend on the type of the store that depends on
 * them (that cycle made `RootState["table"]` unknown).
 */
type RootState = { table: TableState; config: IConfigState };

export enum TableThunkActions {
  SAVE_TABLE = "saveTable",
  GET_TABLE = "getTable",
  GET_CHALLENGE_TABLE = "getChallengeTable",
  RECONCILE = "reconcile",
  AUTOMATIC_ANNOTATION = "automaticAnnotation",
  UPDATE_TABLE_SOCKET = "updateTableSocket",
  UPDATE_SCHEMA_SOCKET = "updateSchemaSocket",
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
  },
);

export const getDependencies = createAsyncThunk(
  `${ACTION_PREFIX}/getDependencies`,
  async (params: Record<string, string | number>) => {
    const response = await tableAPI.getDependencies(params);
    return response.data;
  },
);

export const exportTable = createAsyncThunk(
  `${ACTION_PREFIX}/exportTable`,
  async ({
    format,
    params,
    payload,
  }: {
    format: string;
    params: Record<string, string | number>;
    payload?: any;
  }) => {
    const response = await tableAPI.exportTable(format, params, payload);
    const isBlob = response.config.responseType === 'blob';
    if (isBlob) {
      return { data: response.data, isBlob };
    }
    return response.data;
  },
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
  },
);

export const saveTable = createAsyncThunk(
  `${ACTION_PREFIX}/saveTable`,
  async (
    params: Record<string, string | number> = {},
    { getState, dispatch },
  ) => {
    const { table } = getState() as RootState;
    const { entities } = table;
    const { tableInstance } = entities;

    // Get the list of deleted columns for this save operation
    const deletedColumns = table.ui.deletedColumnsIds;
    const deletedColumnsList = Object.values(deletedColumns) as string[];

    try {
      // Include column order in the data being saved
      const dataToSave = {
        ...entities,
        columnOrder: entities.columns.allIds, // Add column order to preserve frontend ordering
      };

      const response = await tableAPI.saveTable(
        dataToSave, // Send entities with column order
        params,
        tableInstance.id,
        tableInstance.idDataset,
        deletedColumnsList, // Pass deleted columns to the API
      );

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
  },
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
          ({ name }) => (typeof name === "string" ? name : name.value),
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
      new Set(LABELS_FN[tag as keyof typeof LABELS_FN]({ rows, columns })),
    );

    // Labels can be numbers (e.g. numeric cells), so coerce to string first
    return allLabels
      .filter((label) => label != null)
      .map((label) => String(label))
      .filter((label) => label.toLowerCase().startsWith(searchValue))
      .slice(0, 10) // max 10 suggestions
      .map((label) => ({ label }));
  },
);

export const reconcile = createAsyncThunk(
  `${ACTION_PREFIX}/reconcile`,
  async (
    {
      items,
      reconciliator,
      formValues,
      silent,
    }: {
      items: any;
      reconciliator: Reconciliator;
      formValues: Record<string, any>;
      silent?: boolean;
    },
    { getState, signal, dispatch },
  ) => {
    const { table } = getState() as RootState;
    const { relativeUrl, formParams, id } = reconciliator;
    const { entities, ui } = table;
    const { tableInstance, columns } = entities;

    // Get the selected column name
    const selectedColumnIds = Object.keys(ui.selectedColumnsIds);
    const selectedColumnId = selectedColumnIds[0];
    const columnName = columns.byId[selectedColumnId]?.label || "";

    const params = getRequestFormValues(formParams, formValues, table);

    const data = {
      serviceId: reconciliator.id,
      items,
      tableId: tableInstance.id!,
      datasetId: tableInstance.idDataset!,
      columnName,
      ...params,
    };

    const cancelToken = cancelTokenFor(signal);

    const response = await tableAPI.reconcile(
      relativeUrl,
      data,
      tableInstance.id,
      tableInstance.idDataset,
      columnName,
      // pass axios cancel token so the request is cancelled on abort
      cancelToken,
      silent,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dependencies: _deps, operationLog, ...reconcileData } =
      response.data;

    dispatch(
      getDependencies({
        tableId: tableInstance.id!,
        datasetId: tableInstance.idDataset!,
      }),
    );

    return {
      data: reconcileData,
      reconciliator,
      operationLog,
    };
  },
);

type AutomaticAnnotationThunkInputProps = {
  datasetId: string;
  tableId: string;
  target: "fullTable" | "schema";
  method: "alligator" | "llm";
  useLLM?: boolean;
};

type AutomaticAnnotationThunkOutputProps = {
  datasetId: string;
  tableId: string;
  mantisStatus?: "PENDING" | "DONE" | "ERROR";
  schemaStatus?: "PENDING" | "DONE" | "ERROR";
};

export const automaticAnnotation = createAsyncThunk<
  AutomaticAnnotationThunkOutputProps,
  AutomaticAnnotationThunkInputProps
>(`${ACTION_PREFIX}/automaticAnnotation`, async (params, { getState, dispatch }) => {
  const { datasetId, tableId, target, method, useLLM } = params;
  const { table } = getState() as any;
  const { entities } = table;
  const data = {
    target,
    method,
    ...(useLLM !== undefined && { useLLM }),
    rows: entities.rows.byId,
    columns: entities.columns.byId,
    table: entities.tableInstance,
  };
  const response = await tableAPI.automaticAnnotation(
    { datasetId, tableId, target, method },
    data,
  );
  if (response.data?.table && response.data?.result) {
    dispatch(updateSchema(response.data));
  }
  return response.data;
});
export type TableComplianceThunkInputProps = {
  datasetId: string;
  tableId: string;
  purpose?: string;
};
export type TableComplianceThunkOutputProps = {
  response: any;
};
export const tableCompliance = createAsyncThunk<
  TableComplianceThunkOutputProps,
  TableComplianceThunkInputProps
>(`${ACTION_PREFIX}/compliance`, async (params, { getState }) => {
  const { datasetId, tableId, purpose } = params;
  const data = {
    purpose: purpose || "General data processing",
  };
  const response = await tableAPI.makeCompliance({ datasetId, tableId }, data);
  return { response: response.data };
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
>(`${ACTION_PREFIX}/suggest`, async (inputProps, { getState, signal }) => {
  const { suggester } = inputProps;
  const { table } = getState() as RootState;
  const { ui, entities } = table;
  const { rows } = entities;
  const selectedColumnId = Object.keys(ui.selectedColumnsIds)[0];
  // the first candidate of each row, when it is the matched one
  const rowsMetadata = rows.allIds
    .map((rowId) => rows.byId[rowId].cells[selectedColumnId].metadata[0])
    .filter((candidate) => candidate?.match);

  const cancelToken = cancelTokenFor(signal);

  const response = await tableAPI.suggest(
    suggester,
    rowsMetadata,
    cancelToken,
  );
  let currentDataResponse = response.data.data;
  return {
    suggester,
    data: currentDataResponse,
  };
});

export type ExtendThunkInputProps = {
  extender: Extender;
  formValues: Record<string, any>;
};
type ExtendedColumn = {
  label: string;
  metadata: ColumnMetadata[];
  cells: Record<string, ExtendedColumnCell | null>;
};
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
  operationLog?: DependencyOperation;
};

/**
 * Handle api call for dynamic form extension
 */
export const extend = createAsyncThunk<
  ExtendThunkResponseProps,
  ExtendThunkInputProps
>(
  `${ACTION_PREFIX}/extend`,
  async (inputProps, { getState, signal, dispatch }) => {
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

    // Rich objects (llmClassifier / allValues) include every row with a
    // null-kbId fallback; skipFiltering without rich objects includes every
    // row as plain ids; otherwise only matched rows are sent.
    const richObjects =
      extender && (extender.id === "llmClassifier" || extender.allValues);
    const skipFiltering = extender?.skipFiltering === true;

    const params = {
      ...getRequestFormValues(formParams, formValues, table, {
        buildItems: true,
        selectedColumnsFallback: true,
        itemMode: richObjects || skipFiltering ? "all" : "matched",
        itemRichObjects: richObjects,
      }),
      // Prefer selected columns explicitly provided by the formValues.
      // If not present, fall back to extender.selectedColumns (service-level selection).
      selectedColumns:
        formValues && formValues.selectedColumns
          ? formValues.selectedColumns
          : extender && (extender as any).selectedColumns
            ? (extender as any).selectedColumns
            : undefined,
    };

    const cancelToken = cancelTokenFor(signal);

    const response = await tableAPI.extend(
      relativeUrl,
      {
        serviceId: id,
        ...params,
      },
      tableInstance.id,
      tableInstance.idDataset,
      columnName,
      // pass axios cancel token so the request is cancelled on abort
      cancelToken,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dependencies: _deps, operationLog, ...extendData } =
      response.data;

    dispatch(
      getDependencies({
        tableId: tableInstance.id!,
        datasetId: tableInstance.idDataset!,
      }),
    );

    return {
      data: extendData,
      extender,
      selectedColumnId,
      operationLog,
    };
  },
);

export type ModifyThunkInputProps = {
  modifier: Modifier;
  formValues: Record<string, any>;
};

export type ModifyThunkResponseProps = {
  modifier: Modifier;
  selectedColumnId: string;
  data: any;
  operationLog?: DependencyOperation;
};

export const modify = createAsyncThunk<
  ModifyThunkResponseProps,
  ModifyThunkInputProps
>(`${ACTION_PREFIX}/modify`, async (inputProps, { getState, dispatch }) => {
  const { modifier, formValues } = inputProps;

  const { table } = getState() as RootState;
  const { relativeUrl, formParams, id } = modifier;
  const { entities, ui } = table;
  const { tableInstance, columns } = entities;

  const selectedColumnIds = Object.keys(ui.selectedColumnsIds);
  const selectedColumnId = selectedColumnIds[0];
  const columnName = columns.byId[selectedColumnId]?.label || "";

  const params = {
    ...getRequestFormValues(formParams, formValues, table, {
      buildItems: true,
      allColumns: modifier?.skipFiltering === true,
      itemMode: modifier?.allValues ? "all" : "values",
      itemRichObjects: modifier?.allValues === true,
    }),
    joinColumns: formValues.joinColumns,
    selectedColumns: formValues.selectedColumns,
    columnType: formValues.columnType,
    separator: formValues.separator,
    splitDatetime: formValues.splitDatetime,
  };

  const response = await tableAPI.modify(
    relativeUrl,
    {
      serviceId: id,
      ...params,
    },
    tableInstance.id,
    tableInstance.idDataset,
    columnName,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dependencies: _deps, operationLog, ...modifyData } = response.data;

  dispatch(
    getDependencies({
      tableId: tableInstance.id!,
      datasetId: tableInstance.idDataset!,
    }),
  );

  return {
    data: modifyData,
    modifier,
    selectedColumnId,
    operationLog,
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
        }),
      );
    }
  },
);
export const updateSchemaSocket = createAsyncThunk(
  `${ACTION_PREFIX}/updateSchemaSocket`,
  async (inputProps: GetSchemaResponse, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { tableInstance } = state.table.entities;
    const { settings } = state.table.ui;
    const { table } = inputProps;

    if (
      !isEmptyObject(tableInstance) &&
      tableInstance.id!.toString() === table.id.toString()
    ) {
      dispatch(updateSchema(inputProps));
      dispatch(
        updateUI({
          settings: {
            ...settings,
            isViewOnly: false,
          },
        }),
      );
    }
  },
);

/**
 * Apply a reconciliation the backend redid, through the same reducer a normal
 * reconciliation goes through. It is not part of the undo history.
 */
const applyRedoneReconciliation = (
  dispatch: (action: any) => unknown,
  getState: () => unknown,
  serviceId: string,
  data: any,
) => {
  const { config } = getState() as RootState;
  const reconciliator = config.entities.reconciliators.byId[serviceId] as any;
  // without its service there is no way to resolve the candidates
  if (!reconciliator) return;
  dispatch(
    reconcile.fulfilled(
      { data, reconciliator, undoable: false } as any,
      "redo",
      { items: [], reconciliator, formValues: {} } as any,
    ),
  );
};

export const deleteOperationAndRedo = createAsyncThunk(
  `${ACTION_PREFIX}/deleteOperationAndRedo`,
  async (
    { opId, columnName }: { opId: string; columnName?: string },
    { getState, dispatch },
  ) => {
    const state = getState() as RootState;
    const { tableInstance, columns } = state.table.entities;

    if (!tableInstance.id || !tableInstance.idDataset) return;

    // Single DELETE call — backend handles redo internally and returns everything
    const deleteResult = await tableAPI.deleteOperation({
      datasetId: String(tableInstance.idDataset),
      tableId: String(tableInstance.id),
      opId,
    });

    const {
      deleted = [opId],
      reconResults = [],
      dependencies,
    } = deleteResult.data ?? {};
    const deletedIds = new Set<string>(deleted);

    // Remove columns created by deleted EXTENSION ops
    const depColumns = (state.table as any).dependencies?.columns ?? {};
    Object.entries(depColumns).forEach(([colLabel, colInfo]: [string, any]) => {
      if (colInfo?.createdBy && deletedIds.has(colInfo.createdBy)) {
        const colId = columns.allIds.find(
          (id) => columns.byId[id]?.label === colLabel,
        );
        if (colId) dispatch(deleteColumn({ colId }));
      }
    });

    // Clear reconciliation metadata for columns whose recon op was deleted
    // (those that had no surviving recon will stay cleared; those that did will be re-set below)
    const depOperations: DependencyOperation[] =
      (state.table as any).dependencies?.operations ?? [];
    depOperations
      .filter(
        (op) =>
          deletedIds.has(op.id) &&
          op.operationType === "RECONCILIATION" &&
          op.columnName,
      )
      .forEach((op) => {
        const cId = columns.allIds.find(
          (id) => columns.byId[id]?.label === op.columnName,
        );
        if (cId) dispatch(clearColumnReconciliation({ colId: cId }));
      });

    // Update dependency graph in store
    if (dependencies) {
      dispatch(updateDependencies(dependencies));
    }

    // Apply each reconciliation the backend redid
    for (const { serviceId, reconData } of reconResults) {
      applyRedoneReconciliation(dispatch, getState, serviceId, reconData);
    }

    // Refresh dependencies from backend to ensure store is up to date
    dispatch(
      getDependencies({
        tableId: tableInstance.id!,
        datasetId: tableInstance.idDataset!,
      }),
    );
  },
);

export const redoOperationFromLog = createAsyncThunk(
  `${ACTION_PREFIX}/redoOperationFromLog`,
  async ({ opId }: { opId: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { tableInstance } = state.table.entities;

    if (!tableInstance.id || !tableInstance.idDataset) return;

    const response = await tableAPI.redoOperation({
      datasetId: String(tableInstance.idDataset),
      tableId: String(tableInstance.id),
      opId,
    });

    const { serviceId, dependencies: _deps, ...reconcileData } = response.data;

    // Refresh dependency graph
    dispatch(
      getDependencies({
        tableId: tableInstance.id!,
        datasetId: tableInstance.idDataset!,
      }),
    );

    applyRedoneReconciliation(dispatch, getState, serviceId, reconcileData);
  },
);

/**
 * Toolbar Undo, kept in sync with the backend operation log.
 *
 * Local cell/column state is reverted instantly via the existing `undo()`
 * patch-replay reducer, same as before. Additionally, for each step being
 * undone that corresponds to a logged RECONCILIATION/EXTENSION/MODIFICATION
 * operation (tracked alongside the patch stack — see produceWithPatch's
 * operationRef param), the matching operation is removed from the backend
 * log so the DependenciesPanel/pipeline stays consistent with what's now
 * visible in the table. Steps with no backend counterpart (e.g. a plain
 * cell edit) are left as pure local undo.
 */
export const undoWithSync = createAsyncThunk(
  `${ACTION_PREFIX}/undoWithSync`,
  async (steps: number | undefined, { getState, dispatch }) => {
    const { table } = getState() as RootState;
    const { undoPointer, operationRefs } = table._draft;
    const { tableInstance } = table.entities;

    if (undoPointer < 0) {
      dispatch(undo(steps as any));
      return;
    }

    const actualSteps = Math.min(steps ?? 1, undoPointer + 1);
    const opsToRemove: DependencyOperation[] = [];
    for (let i = 0; i < actualSteps; i++) {
      const ref = operationRefs[undoPointer - i] as DependencyOperation | null;
      if (ref) opsToRemove.push(ref);
    }

    dispatch(undo(steps as any));

    if (opsToRemove.length === 0) return;

    const datasetId = tableInstance.idDataset;
    const tableId = tableInstance.id;
    if (!datasetId || !tableId) return;

    for (const op of opsToRemove) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await tableAPI.removeLoggedOperation({
          datasetId: String(datasetId),
          tableId: String(tableId),
          opId: op.id,
        });
      } catch (err) {
        console.error(
          "[undoWithSync] Failed to remove logged operation:",
          op.id,
          err,
        );
      }
    }

    dispatch(getDependencies({ tableId, datasetId }));
  },
);

/**
 * Toolbar Redo, mirror of undoWithSync: restores any logged operation that
 * a prior Undo had removed, reusing the cached full operation record so the
 * backend can re-append it with its original id.
 */
export const redoWithSync = createAsyncThunk(
  `${ACTION_PREFIX}/redoWithSync`,
  async (_arg: void, { getState, dispatch }) => {
    const { table } = getState() as RootState;
    const { redoPointer, redoOperationRefs } = table._draft;
    const { tableInstance } = table.entities;

    if (redoPointer < 0) {
      dispatch(redo());
      return;
    }

    const ref = redoOperationRefs[redoPointer] as DependencyOperation | null;

    dispatch(redo());

    if (!ref) return;

    const datasetId = tableInstance.idDataset;
    const tableId = tableInstance.id;
    if (!datasetId || !tableId) return;

    try {
      await tableAPI.restoreLoggedOperation(
        { datasetId: String(datasetId), tableId: String(tableId) },
        ref,
      );
    } catch (err) {
      console.error(
        "[redoWithSync] Failed to restore logged operation:",
        ref.id,
        err,
      );
    }

    dispatch(getDependencies({ tableId, datasetId }));
  },
);

export const downloadComplianceReport = createAsyncThunk(
  `${ACTION_PREFIX}/downloadComplianceReport`,
  async ({
    datasetId,
    tableId,
    reportIndex,
    format,
  }: {
    datasetId: string;
    tableId: string;
    reportIndex: number | "latest";
    format: "json" | "md";
  }) => {
    const response = await tableAPI.downloadComplianceReport(
      { datasetId, tableId, reportIndex },
      format,
    );
    return response.data;
  },
);

export const getOperationDownstreamDeps = createAsyncThunk(
  `${ACTION_PREFIX}/getOperationDownstreamDeps`,
  async (params: { datasetId: string; tableId: string; opId: string }) => {
    const response = await tableAPI.getOperationDownstreamDeps(params);
    return response.data.downstreamDeps ?? [];
  },
);
