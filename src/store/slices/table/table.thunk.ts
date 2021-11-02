import tableAPI from '@services/api/table';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ID } from '@store/interfaces/store';
import { Extender, Reconciliator } from '../config/interfaces/config';
import convertToW3CTable from './utils/table.export-utils';

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
    console.log(table);
    const response = await tableAPI.saveTable(table.entities, params);
    return response.data;
  }
);

export const convertToW3C = createAsyncThunk(
  `${ACTION_PREFIX}/convertToW3C`,
  async (keepMatching: boolean, { getState }) => {
    const { table, config } = getState() as any;
    const { columns, rows, tableInstance } = table.entities;
    const { reconciliators } = config.entities;
    const response = await convertToW3CTable({
      columns,
      rows,
      tableInstance,
      reconciliators,
      keepMatching
    });
    return response;
  }
);

export const reconcile = createAsyncThunk(
  `${ACTION_PREFIX}/reconcile`,
  async (
    {
      baseUrl,
      data,
      reconciliator
    }: { baseUrl: string, data: any, reconciliator: Reconciliator }
  ) => {
    const response = await tableAPI.reconcile(baseUrl, data);
    return {
      data: response.data,
      reconciliator
    };
  }
);

export const extend = createAsyncThunk(
  `${ACTION_PREFIX}/extend`,
  async (
    {
      baseUrl,
      data,
      extender
    }: { baseUrl: string, data: any, extender: Extender }
  ) => {
    const response = await tableAPI.extend(baseUrl, data);
    return {
      data: response.data,
      extender
    };
  }
);
