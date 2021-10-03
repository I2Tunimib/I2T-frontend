import { Reducer } from '@reduxjs/toolkit';
import config from '@root/config.yaml';
import tableReducer from './slices/table/table.slice';
import configReducer from './slices/config/config.slice';
import tablesReducer from './slices/tables/tables.slice';
import actionReducer from './slices/action/action.slice';
import datasetsReducer from './slices/datasets/datasets.slice';

interface StoreConfig {
  [mode: string]: {
    [reducer: string]: Reducer;
  }
}

const APP_STORE = {
  standard: {
    config: configReducer,
    tables: tablesReducer
  },
  challenge: {
    datasets: datasetsReducer
  },
  shared: {
    action: actionReducer,
    table: tableReducer
  }
};

const { MODE } = config.APP;

export const getStandardRootReducer = () => {
  return { ...APP_STORE.standard, ...APP_STORE.shared };
};

export const getChallengeRootReducer = () => {
  return { ...APP_STORE.challenge, ...APP_STORE.shared };
};
