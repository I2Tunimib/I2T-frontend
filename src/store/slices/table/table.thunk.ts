import tableAPI from '@services/api/table';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ID } from '@store/interfaces/store';
import { RootState } from '@store';
import { Extender, ExtenderFormInputParams, Reconciliator } from '../config/interfaces/config';
// import convertToW3CTable from './utils/table.export-utils';
import { ColumnState, RowState, TableState } from './interfaces/table';

const ACTION_PREFIX = 'table';

export enum TableThunkActions {
  SAVE_TABLE = 'saveTable',
  GET_TABLE = 'getTable',
  GET_CHALLENGE_TABLE = 'getChallengeTable',
  RECONCILE = 'reconcile',
  EXTEND = 'extend',
  CONVER_W3C = 'convertToW3C',
  EXPORT_TABLE = 'exportTable'
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

// export const convertToW3C = createAsyncThunk(
//   `${ACTION_PREFIX}/convertToW3C`,
//   async (keepMatching: boolean, { getState }) => {
//     const { table, config } = getState() as any;
//     const { columns, rows, tableInstance } = table.entities;
//     const { reconciliators } = config.entities;
//     const response = await convertToW3CTable({
//       columns,
//       rows,
//       tableInstance,
//       reconciliators,
//       keepMatching
//     });
//     return response;
//   }
// );

export const reconcile = createAsyncThunk(
  `${ACTION_PREFIX}/reconcile`,
  async (
    {
      baseUrl,
      items,
      reconciliator
    }: { baseUrl: string, items: any, reconciliator: Reconciliator }
  ) => {
    const data = {
      serviceId: reconciliator.id,
      items
    };
    const response = await tableAPI.reconcile(baseUrl, data);
    return {
      data: response.data,
      reconciliator
    };
  }
);

export type ExtendThunkInputProps = {
  extender: Extender;
  formValues: Record<string, any>;
}
export type ExtendThunkResponseProps = {
  extender: Extender;
  data: {
    columns: ColumnState['byId']
    rows: RowState['byId'],
    meta: Record<string, string>
  }
}

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
  return rowEntities.allIds.reduce((acc, rowId) => {
    const cell = rowEntities.byId[rowId].cells[colId];
    acc[rowId] = cell.label;
    return acc;
  }, {} as Record<string, any>);
};

const getRequestFormValues = (
  formParams: ExtenderFormInputParams[],
  formValues: Record<string, any>,
  table: TableState
) => {
  const { ui, entities } = table;
  const { rows } = entities;
  const selectedColumnsIds = Object.keys(ui.selectedColumnsIds);

  const requestParams = {} as Record<string, any>;

  requestParams.items = selectedColumnsIds.reduce((acc, key) => {
    acc[key] = getColumnMetaIds(key, rows);
    return acc;
  }, {} as Record<string, any>);

  formParams.forEach(({ id, inputType }) => {
    if (inputType === 'selectColumns') {
      requestParams[id] = getColumnValues(formValues[id], rows);
    } else {
      requestParams[id] = formValues[id];
    }
  });

  return requestParams;
};

/**
 * Handle api call for dynamic form extension
 */
export const extend = createAsyncThunk<ExtendThunkResponseProps, ExtendThunkInputProps>(
  `${ACTION_PREFIX}/extend`,
  async (inputProps, { getState }) => {
    const { extender, formValues } = inputProps;
    // get root table states
    const { table } = getState() as RootState;
    const { relativeUrl, formParams, id } = extender;
    const params = getRequestFormValues(formParams, formValues, table);
    const response = await tableAPI.extend(relativeUrl, { serviceId: id, ...params });
    return {
      data: response.data,
      extender
    };
  }
);
// export const extend = createAsyncThunk(
//   `${ACTION_PREFIX}/extend`,
//   async (
//     {
//       baseUrl,
//       data,
//       extender
//     }: { baseUrl: string, data: any, extender: Extender }
//   ) => {
//     const response = await tableAPI.extend(baseUrl, data);
//     return {
//       data: response.data,
//       extender
//     };
//   }
// );
