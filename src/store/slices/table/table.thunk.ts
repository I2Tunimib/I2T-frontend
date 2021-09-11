import { createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '@services/api/table';
import { convertFromCSV, CsvSeparator } from '@services/converters/csv-converter';
import { ID, TableFile, TableType } from './interfaces/table';
import { loadTable } from './utils/table.load-utils';

const ACTION_PREFIX = 'table';

export enum TableThunkActions {
  LOAD_UP_TABLE = 'loadUpTable',
  GET_TABLE_NAMES = 'getTableNames',
  UPLOAD_TABLE = 'uploadTable',
  RECONCILE = 'reconcile'
}

interface LoadUpTableParams {
  table: TableFile | TableFile[];
  challenge?: boolean;
}

export const loadUpTable = createAsyncThunk(
  `${ACTION_PREFIX}/loadUpTable`,
  async ({ table, challenge = false }: LoadUpTableParams) => {
    const response = await loadTable(table, challenge);
    return response;
  }
);

export const getTableNames = createAsyncThunk(
  `${ACTION_PREFIX}/getTableNames`,
  async (dataSource: string) => {
    const response = await tableAPI.getTableNames(dataSource);
    return response.data;
  }
);

export const reconcile = createAsyncThunk(
  `${ACTION_PREFIX}/reconcile`,
  async (
    { baseUrl, data, reconciliator }: { baseUrl: string, data: any, reconciliator: string },
    { rejectWithValue }
  ) => {
    const response = await tableAPI.reconcile(baseUrl, data);
    return {
      data: response.data,
      reconciliator
    };
  }
);
