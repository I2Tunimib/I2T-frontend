import { createAsyncThunk } from '@reduxjs/toolkit';
import datasetAPI from '@services/api/datasets';
import { ID } from '@store/interfaces/store';
import { setCurrentDataset } from './datasets.slice';

const ACTION_PREFIX = 'dataset';

export enum DatasetThunkActions {
  GET_DATASET = 'getDataset',
  GET_DATASET_INFO = 'getDatasetInfo',
  GET_TABLES_BY_DATASET = 'getTablesByDataset',
  ANNOTATE = 'annotate',
  GLOBAL_SEARCH = 'globalSearch',
  UPLOAD_DATASET = 'uploadDataset',
  DELETE_DATASET = 'deleteDataset',
  DELETE_TABLE = 'deleteTable'
}

export const getDataset = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.GET_DATASET}`,
  async () => {
    const response = await datasetAPI.getDataset();
    return response.data;
  }
);

export const getDatasetInfo = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.GET_DATASET_INFO}`,
  async ({ datasetId }: { datasetId: ID }) => {
    const response = await datasetAPI.getDatasetInfo({ datasetId });
    return response.data;
  }
);

export const getTablesByDataset = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.GET_TABLES_BY_DATASET}`,
  async ({ datasetId }: { datasetId: ID }, { dispatch }) => {
    dispatch(setCurrentDataset(datasetId));
    const response = await datasetAPI.getTablesByDataset({ datasetId });
    return {
      data: response.data,
      datasetId
    };
  }
);

export const annotate = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.ANNOTATE}`,
  async ({ name, ...data }: { name: string, idDataset: any[], idTable: any[] }, { dispatch }) => {
    const response = await datasetAPI.annotate(name, data);
    return {
      data: response.data
    };
  }
);

export const globalSearch = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.GLOBAL_SEARCH}`,
  async ({ query }: { query: string }) => {
    const response = await datasetAPI.globalSearch(query);
    return response.data;
  }
);

export const uploadDataset = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.UPLOAD_DATASET}`,
  async ({ formData }: { formData: FormData }) => {
    const response = await datasetAPI.uploadDataset(formData);
    return response.data;
  }
);

export const deleteDataset = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.DELETE_DATASET}`,
  async ({ datasetId }: { datasetId: string }) => {
    const response = await datasetAPI.deleteDataset(datasetId);
    return datasetId;
  }
);

export const deleteTable = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.DELETE_TABLE}`,
  async (params: { datasetId: string, tableId: string }) => {
    const response = await datasetAPI.deleteTable(params);
    return params;
  }
);
