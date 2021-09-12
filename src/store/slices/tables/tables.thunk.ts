import { createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '@services/api/table';
import axios from 'axios';
import { ID } from '../table/interfaces/table';
import { updateFileUpload } from './tables.slice';

const ACTION_PREFIX = 'tables';

export enum TablesThunkActions {
  GET_TABLES = 'getTables',
  SEARCH_TABLES = 'searchTables',
  UPLOAD_TABLE = 'uploadTable',
  COPY_TABLE = 'copyTable',
  REMOVE_TABLE = 'removeTable'
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

interface UploadTableThunkPayload {
  formData: FormData;
  requestId: ID;
  fileName: string;
}

export const uploadTable = createAsyncThunk(
  `${ACTION_PREFIX}/uploadTable`,
  async ({ formData, requestId, fileName }: UploadTableThunkPayload, { dispatch, signal }) => {
    // create token to possibily cancel the request
    const source = axios.CancelToken.source();
    // on abort signal, cancel the request
    signal.addEventListener('abort', () => {
      source.cancel();
    });
    const response = await tableAPI.uploadTable(formData, source.token, (progress) => {
      dispatch(updateFileUpload({ requestId, fileName, progress }));
    });
    return response.data;
  }
);

export const copyTable = createAsyncThunk(
  `${ACTION_PREFIX}/copyTable`,
  async (name: string) => {
    const response = await tableAPI.copyTable(name);
    return response.data;
  }
);

export const removeTable = createAsyncThunk(
  `${ACTION_PREFIX}/removeTable`,
  async (name: string) => {
    const response = await tableAPI.removeTable(name);
    return response.data;
  }
);
