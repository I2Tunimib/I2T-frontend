import { createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '@services/api/table';
import { convertFromCSV, CsvSeparator } from '@services/converters/csv-converter';
import { RootState } from '@store';
import { ID } from '@store/interfaces/store';
import { Reconciliator } from '../config/interfaces/config';
import { TableFile, TableType } from './interfaces/table';

const ACTION_PREFIX = 'table';

export enum TableThunkActions {
  SAVE_TABLE = 'saveTable',
  GET_TABLE = 'getTable',
  IMPORT = 'import',
  LOAD_UP_TABLE = 'loadUpTable',
  GET_TABLE_NAMES = 'getTableNames',
  UPLOAD_TABLE = 'uploadTable',
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

export const importTable = createAsyncThunk(
  `${ACTION_PREFIX}/import`,
  async (data: FormData) => {
    const response = await tableAPI.importTable(data);
    return response.data;
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
