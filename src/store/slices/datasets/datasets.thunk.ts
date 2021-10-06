import { createAsyncThunk } from '@reduxjs/toolkit';
import datasetAPI from '@services/api/datasets';
import { ID } from '@store/interfaces/store';
import { setCurrentDataset } from './datasets.slice';

const ACTION_PREFIX = 'dataset';

export enum DatasetThunkActions {
  GET_ALL_DATASETS = 'getAll',
  GET_ONE_DATASET = 'getTable',
  GET_ALL_DATASET_TABLES = 'getAllDatasetTables'
}

export const getAllDatasets = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.GET_ALL_DATASETS}`,
  async () => {
    const response = await datasetAPI.getAllDatasets();
    return response.data;
  }
);

export const getOneDataset = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.GET_ONE_DATASET}`,
  async ({ datasetId }: { datasetId: ID }) => {
    const response = await datasetAPI.getOneDataset(datasetId);
    return response.data;
  }
);

export const getAllDatasetTables = createAsyncThunk(
  `${ACTION_PREFIX}/${DatasetThunkActions.GET_ALL_DATASET_TABLES}`,
  async ({ datasetId }: { datasetId: ID }, { dispatch }) => {
    dispatch(setCurrentDataset(datasetId));
    const response = await datasetAPI.getAllDatasetTables(datasetId);
    return {
      data: response.data,
      datasetId
    };
  }
);
