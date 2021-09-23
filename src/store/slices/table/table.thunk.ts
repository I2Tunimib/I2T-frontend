import tableAPI from '@services/api/table';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ID } from '@store/interfaces/store';
import { Reconciliator } from '../config/interfaces/config';
import convertToW3CTable from './utils/table.export-utils';

const ACTION_PREFIX = 'table';

export enum TableThunkActions {
  SAVE_TABLE = 'saveTable',
  GET_TABLE = 'getTable',
  RECONCILE = 'reconcile'
}

export const getTable = createAsyncThunk(
  `${ACTION_PREFIX}/getTable`,
  async (id: ID) => {
    const response = await tableAPI.getTable(id);
    return response.data;
  }
);

export const saveTable = createAsyncThunk(
  `${ACTION_PREFIX}/saveTable`,
  async (payload: void, { getState }) => {
    const { table } = getState() as any;
    const response = await tableAPI.saveTable(table.entities);
    return response.data;
  }
);

export const exportTable = createAsyncThunk(
  `${ACTION_PREFIX}/export`,
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
    }: { baseUrl: string, data: any, reconciliator: Reconciliator & { id: ID } }
  ) => {
    const response = await tableAPI.reconcile(baseUrl, data);
    return {
      data: response.data,
      reconciliator
    };
  }
);
