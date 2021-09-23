import { createAsyncThunk } from '@reduxjs/toolkit';
import tableAPI from '@services/api/table';
import { ID } from '@store/interfaces/store';
import axios from 'axios';
import { updateFileUpload } from './tables.slice';

const ACTION_PREFIX = 'tables';

export enum TablesThunkActions {
  GET_TABLE = 'getTable',
  GET_TABLES = 'getTables',
  GET_CHALLENGE_DATASETS = 'getChallengeDatasets',
  UPLOAD_TABLE = 'uploadTable',
  COPY_TABLE = 'copyTable',
  REMOVE_TABLE = 'removeTable',
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

interface UploadTableThunkPayload {
  formData: FormData;
  requestId: ID;
  name: string;
}

export const uploadTable = createAsyncThunk(
  `${ACTION_PREFIX}/uploadTable`,
  async ({ formData, requestId, name }: UploadTableThunkPayload, { dispatch, signal }) => {
    // create token to possibily cancel the request
    const source = axios.CancelToken.source();
    // on abort signal, cancel the request
    signal.addEventListener('abort', () => {
      source.cancel();
    });
    const response = await tableAPI.uploadTable(formData, source.token, (progress) => {
      dispatch(updateFileUpload({ requestId, name, progress }));
    });
    return response.data;
  }
);

export const importTable = createAsyncThunk(
  `${ACTION_PREFIX}/import`,
  async (formData: FormData, { dispatch, signal }) => {
    const response = await tableAPI.importTable(formData);

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
  async (id: ID) => {
    await tableAPI.removeTable(id);
    return id;
  }
);

export const getTable = createAsyncThunk(
  `${ACTION_PREFIX}/getTable`,
  async (name: string) => {
    const response = await tableAPI.getTable(name, 'application/octet-stream');
    return response.data;
  }
);

export const getChallengeDatasets = createAsyncThunk(
  `${ACTION_PREFIX}/getChallengeDatasets`,
  async () => {
    const response = await tableAPI.getChallengeDatasets();
    return response.data;
  }
);
