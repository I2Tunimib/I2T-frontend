import { createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '@services/api/table';

const ACTION_PREFIX = 'table';

export enum TableEndpoints {
  GET_TABLE_NAMES = 'getTableNames',
  GET_TABLE = 'getTable',
  RECONCILE = 'reconcile'
}

export const getTableNames = createAsyncThunk(
  `${ACTION_PREFIX}/getTableNames`,
  async (dataSource: string) => {
    const response = await tableAPI.getTableNames(dataSource);
    return response.data;
  }
);

export const getTable = createAsyncThunk(
  `${ACTION_PREFIX}/getTable`,
  async ({ dataSource, name }: {dataSource: string, name: string}) => {
    const response = await tableAPI.getTable(dataSource, name);
    return response.data;
  }
);

export const reconcile = createAsyncThunk(
  `${ACTION_PREFIX}/reconcile`,
  async (
    { baseUrl, data, reconciliator }: {baseUrl: string, data: any, reconciliator: string},
    { rejectWithValue }
  ) => {
    const response = await tableAPI.reconcile(baseUrl, data);
    return {
      data: response.data,
      reconciliator
    };
  }
);
