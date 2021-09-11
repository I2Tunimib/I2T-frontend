import { createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '@services/api/table';

const ACTION_PREFIX = 'tables';

export enum TablesThunkActions {
  GET_TABLES = 'getTables',
  SEARCH_TABLES = 'searchTables'
}

export const getTables = createAsyncThunk(
  `${ACTION_PREFIX}/getTables`,
  async (type: string) => {
    const response = await tableAPI.getTables(type);
    return response.data;
  }
);

export const searchTables = createAsyncThunk(
  `${ACTION_PREFIX}/searchTables`,
  async (query: string) => {
    const response = await tableAPI.searchTables(query);
    return response.data;
  }
);
