import tableAPI, { GetTableResponse } from '@services/api/table';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { levDistance } from '@services/utils/lev-distance';
import { isEmptyObject } from '@services/utils/objects-utils';
import { Extender, FormSchema, Reconciliator } from '../config/interfaces/config';
import { BaseMetadata, Cell, ColumnMetadata, ColumnState, RowState, TableState } from './interfaces/table';
import { updateTable, updateUI } from './table.slice';
import { getIdsFromCell } from './utils/table.utils';

const ACTION_PREFIX = 'table';

export enum TableThunkActions {
  SAVE_TABLE = 'saveTable',
  GET_TABLE = 'getTable',
  GET_CHALLENGE_TABLE = 'getChallengeTable',
  RECONCILE = 'reconcile',
  AUTOMATIC_ANNOTATION = 'automaticAnnotation',
  UPDATE_TABLE_SOCKET = 'updateTableSocket',
  EXTEND = 'extend',
  CONVER_W3C = 'convertToW3C',
  EXPORT_TABLE = 'exportTable',
  FILTER_TABLE = 'filterTable'
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
    params
  }: {
    format: string;
    params: Record<string, string | number>
  }) => {
    const response = await tableAPI.exportTable(format, params);
    return response.data;
  }
);

export const getChallengeTable = createAsyncThunk(
  `${ACTION_PREFIX}/getChallengeTable`,
  async ({ datasetName, tableName }: { datasetName: string, tableName: string }) => {
    const response = await tableAPI.getChallengeTable(datasetName, tableName);
    return response.data;
  }
);

export const saveTable = createAsyncThunk(
  `${ACTION_PREFIX}/saveTable`,
  async (params: Record<string, string | number> = {}, { getState }) => {
    const { table } = getState() as any;
    const response = await tableAPI.saveTable(table.entities, params);
    return response.data;
  }
);

type GetLabelsProps = {
  rows: RowState;
  columns: ColumnState;
}

const LABELS_FN = {
  label: ({
    rows,
    columns
  }: GetLabelsProps) => rows.allIds.flatMap((rowId) => {
    return columns.allIds.map((colId) => {
      return rows.byId[rowId].cells[colId].label;
    });
  }),
  metaName: ({
    rows,
    columns
  }: GetLabelsProps) => rows.allIds.flatMap((rowId) => {
    return columns.allIds.flatMap((colId) => {
      return rows.byId[rowId].cells[colId].metadata.map((metaItem) => metaItem.name.value);
    });
  }),
  metaType: ({
    rows,
    columns
  }: GetLabelsProps) => rows.allIds.flatMap((rowId) => {
    return columns.allIds.flatMap((colId) => {
      return rows.byId[rowId].cells[colId].metadata.flatMap((metaItem) => {
        return metaItem.type ? metaItem.type.map((type: any) => type.name) : [];
      });
    });
  })
};

export const filterTable = createAsyncThunk(
  `${ACTION_PREFIX}/filterTable`,
  async ({ value, tag }: { value: string; tag: string }, { getState }) => {
    const { table } = getState() as RootState;
    const { rows, columns } = table.entities;

    const allLabels = Array.from(new Set(
      LABELS_FN[tag as keyof typeof LABELS_FN]({ rows, columns })
    ));

    return allLabels.map((label) => ({
      distance: levDistance(value, label),
      label
    }))
      .filter((item) => item.distance < 0.9)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }
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

const getColumnValues = (colId: string, rowEntities: RowState) => {
  if (!colId) {
    return '';
  }
  return rowEntities.allIds.reduce((acc, rowId) => {
    const cell = rowEntities.byId[rowId].cells[colId];
    acc[rowId] = [cell.label, cell.metadata, colId];
    return acc;
  }, {} as Record<string, any>);
};

const getFormValues = (
  formSchema: FormSchema,
  formValues: Record<string, any>,
  rows: RowState
) => {
  return Object.keys(formSchema).reduce((acc, key) => {
    const formFieldSchema = formSchema[key];

    if (formFieldSchema.component === 'group') {
      if (formFieldSchema.dynamic) {
        acc[key] = formValues[key]
          .map((item: any) => getFormValues(formFieldSchema.fields, item, rows));
      } else {
        acc[key] = getFormValues(formFieldSchema.fields, formValues[key], rows);
      }
    } else {
      if (formFieldSchema.component === 'selectColumns') {
        acc[key] = getColumnValues(formValues[key], rows);
      } else {
        acc[key] = formValues[key];
      }
    }
    return acc;
  }, {} as Record<string, any>);
};

const getRequestFormValuesExtension = (
  formSchema: FormSchema,
  formValues: Record<string, any>,
  table: TableState
) => {
  if (!formSchema) {
    return {};
  }

  const { ui, entities } = table;
  const { rows } = entities;
  const selectedColumnsIds = Object.keys(ui.selectedColumnsIds);

  // const requestParams = {} as Record<string, any>;

  const items = selectedColumnsIds.reduce((acc, key) => {
    acc[key] = getColumnMetaIds(key, rows);
    return acc;
  }, {} as Record<string, any>);

  // Object.keys(formSchema).forEach((id) => {
  //   const { component } = formSchema[id];

  //   if (formValues[id]) {
  //     if (component === 'selectColumns') {
  //       requestParams[id] = getColumnValues(formValues[id], rows);
  //     } else {
  //       requestParams[id] = formValues[id];
  //     }
  //   }
  // });

  return {
    items,
    ...getFormValues(formSchema, formValues, rows)
  };
};

const getRequestFormValuesReconciliation = (
  formSchema: FormSchema,
  formValues: Record<string, any>,
  table: TableState
) => {
  if (!formSchema) {
    return {};
  }

  const { entities } = table;
  const { rows } = entities;
  // const requestParams = {} as Record<string, any>;

  // console.log(getFormValues(formSchema, formValues, rows));
  // console.log('LOL');

  // Object.keys(formSchema).forEach((id) => {
  //   const { component } = formSchema[id];
  //   if (formValues[id]) {
  //     if (component === 'selectColumns') {
  //       requestParams[id] = getColumnValues(formValues[id], rows);
  //     } else {
  //       requestParams[id] = formValues[id];
  //     }
  //   }
  // });

  return getFormValues(formSchema, formValues, rows);
};

export const reconcile = createAsyncThunk(
  `${ACTION_PREFIX}/reconcile`,
  async (
    {
      items,
      reconciliator,
      formValues
    }: {
      items: any,
      reconciliator: Reconciliator,
      formValues: Record<string, any>;
    }, { getState }
  ) => {
    const { table } = getState() as RootState;
    const { relativeUrl, formSchema, id } = reconciliator;
    const params = getRequestFormValuesReconciliation(formSchema, formValues, table);
    const data = {
      serviceId: reconciliator.id,
      items,
      ...params
    };
    const response = await tableAPI.reconcile(relativeUrl, { serviceId: id, data });
    return {
      data: response.data,
      reconciliator
    };
  }
);

type AutomaticAnnotationThunkInputProps = {
  datasetId: string;
  tableId: string;
}

type AutomaticAnnotationThunkOutputProps = {
  datasetId: string;
  tableId: string;
  mantisStatus: 'PENDING';
}

export const automaticAnnotation = createAsyncThunk<
  AutomaticAnnotationThunkOutputProps,
  AutomaticAnnotationThunkInputProps>(
    `${ACTION_PREFIX}/automaticAnnotation`,
    async (params, { getState }) => {
      const { table } = getState() as any;
      const { entities } = table;
      const data = {
        rows: entities.rows.byId,
        columns: entities.columns.byId,
        table: entities.tableInstance
      };
      const response = await tableAPI.automaticAnnotation(params, data);
      return response.data;
    }
  );

export type ExtendThunkInputProps = {
  extender: Extender;
  formValues: Record<string, any>;
}
export type ExtendedColumnCell = {
  label: string;
  metadata: BaseMetadata[];
}
type ExtendedColumn = {
  label: string;
  metadata: ColumnMetadata[];
  cells: Record<string, ExtendedColumnCell | null>
}

export type ExtendThunkResponseProps = {
  extender: Extender;
  data: {
    columns: Record<string, ExtendedColumn>
    meta: Record<string, string>
  }
}

/**
 * Handle api call for dynamic form extension
 */
export const extend = createAsyncThunk<ExtendThunkResponseProps, ExtendThunkInputProps>(
  `${ACTION_PREFIX}/extend`,
  async (inputProps, { getState }) => {
    const { extender, formValues } = inputProps;
    // get root table states
    const { table } = getState() as RootState;
    const { relativeUrl, formSchema, id } = extender;
    const params = getRequestFormValuesExtension(formSchema, formValues, table);
    const response = await tableAPI.extend(relativeUrl, { serviceId: id, ...params });
    return {
      data: response.data,
      extender
    };
  }
);

export const updateTableSocket = createAsyncThunk(
  `${ACTION_PREFIX}/updateTableSocket`,
  async (inputProps: GetTableResponse, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { tableInstance } = state.table.entities;
    const { settings } = state.table.ui;
    const { table } = inputProps;

    if (!isEmptyObject(tableInstance) && table.id === tableInstance.id) {
      dispatch(updateTable(inputProps));
      dispatch(updateUI({
        settings: {
          ...settings,
          isViewOnly: false,
          scoreLowerBound: (table.maxMetaScore - table.minMetaScore) / 3
        }
      }));
    }
  }
);
