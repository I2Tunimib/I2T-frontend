import { createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '@services/api/table';

const ACTION_PREFIX = 'tables';

export enum TableEndpoints {
  GET_TABLES = 'getTables'
}

export const getTables = createAsyncThunk(
  `${ACTION_PREFIX}/getTables`,
  async (type: string) => {
    const response = await tableAPI.getTables(type);
    return response.data;
  }
);
